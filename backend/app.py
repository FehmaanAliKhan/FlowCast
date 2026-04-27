"""
FlowCast — Flask backend
- Local dev:  SQLite  (no setup, DATABASE_URL not set)
- Production: PostgreSQL  (set DATABASE_URL to your Supabase connection string)

Start: python3 backend/app.py
"""

import os, json, time, bcrypt, jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from collections import defaultdict

from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError

# ── Config ──────────────────────────────────────────────────────────────────

SECRET_KEY   = os.environ.get('JWT_SECRET', 'fc-dev-secret-b7e2a91d4f83c65e0d1a8b3f9c27e54ad61092e7f3b4a5c8d0e1f2')
TOKEN_DAYS   = 30
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

_DB_FILE     = os.path.join(os.path.dirname(__file__), 'flowcast.db')
DATABASE_URL = os.environ.get('DATABASE_URL', f'sqlite:///{_DB_FILE}')

# Railway/Heroku export postgres:// — SQLAlchemy needs postgresql://
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

IS_POSTGRES = DATABASE_URL.startswith('postgresql')

# ── SQLAlchemy engine ────────────────────────────────────────────────────────

_engine_kw = {'pool_pre_ping': True}
if not IS_POSTGRES:
    _engine_kw['connect_args'] = {'check_same_thread': False}

engine = create_engine(DATABASE_URL, **_engine_kw)

# ── App ──────────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder=None)
CORS(app, origins='*', supports_credentials=True)
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024

@app.teardown_appcontext
def close_db(_):
    db = g.pop('db', None)
    if db:
        db.close()

def get_db():
    if 'db' not in g:
        g.db = engine.connect()
    return g.db

def init_db():
    if IS_POSTGRES:
        stmts = [
            """CREATE TABLE IF NOT EXISTS users (
                id            SERIAL PRIMARY KEY,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )""",
            """CREATE TABLE IF NOT EXISTS user_data (
                user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                data       TEXT NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )""",
        ]
    else:
        stmts = [
            """CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY,
                email         TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at    TEXT NOT NULL DEFAULT (datetime('now'))
            )""",
            """CREATE TABLE IF NOT EXISTS user_data (
                user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                data       TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )""",
        ]
    with engine.connect() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))
        conn.commit()
    print(f'[DB] {"PostgreSQL" if IS_POSTGRES else "SQLite"} schema ready')

# ── JWT ──────────────────────────────────────────────────────────────────────

def make_token(user_id, email):
    return jwt.encode(
        {'sub': str(user_id), 'email': email,
         'exp': datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS),
         'iat': datetime.now(timezone.utc)},
        SECRET_KEY, algorithm='HS256'
    )

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        try:
            payload = jwt.decode(header[7:], SECRET_KEY, algorithms=['HS256'])
            g.user_id    = int(payload['sub'])
            g.user_email = payload['email']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Session expired — please sign in again'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return wrapper

# ── Rate limiter ─────────────────────────────────────────────────────────────

_rl: dict = defaultdict(list)

def rate_limit(max_req=20, window=900):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            ip  = request.remote_addr or 'unknown'
            now = time.time()
            _rl[ip] = [t for t in _rl[ip] if now - t < window]
            if len(_rl[ip]) >= max_req:
                return jsonify({'error': 'Too many requests — try again later'}), 429
            _rl[ip].append(now)
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({'error': str(e)}), getattr(e, 'code', 500)

# ── Auth routes ───────────────────────────────────────────────────────────────

@app.post('/api/auth/register')
@rate_limit(20, 900)
def register():
    body     = request.get_json(silent=True) or {}
    email    = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    if '@' not in email or '.' not in email.split('@')[-1]:
        return jsonify({'error': 'Enter a valid email address'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=10)).decode()
    db = get_db()
    try:
        result  = db.execute(
            text('INSERT INTO users (email, password_hash) VALUES (:e, :h) RETURNING id'),
            {'e': email, 'h': pw_hash}
        )
        user_id = result.scalar()
        db.commit()
        return jsonify({'token': make_token(user_id, email), 'user': {'id': user_id, 'email': email}}), 201
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'An account with that email already exists'}), 409


@app.post('/api/auth/login')
@rate_limit(20, 900)
def login():
    body     = request.get_json(silent=True) or {}
    email    = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    db  = get_db()
    row = db.execute(
        text('SELECT id, email, password_hash FROM users WHERE email = :e'),
        {'e': email}
    ).mappings().fetchone()
    dummy = b'$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    check = row['password_hash'].encode() if row else dummy
    match = bcrypt.checkpw(password.encode(), check)
    if not row or not match:
        return jsonify({'error': 'Invalid email or password'}), 401
    return jsonify({'token': make_token(row['id'], row['email']), 'user': {'id': row['id'], 'email': row['email']}})


@app.get('/api/auth/me')
@require_auth
def me():
    row = get_db().execute(
        text('SELECT id, email, created_at FROM users WHERE id = :uid'),
        {'uid': g.user_id}
    ).mappings().fetchone()
    if not row:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': dict(row)})

# ── Data routes ───────────────────────────────────────────────────────────────

@app.get('/api/data')
@require_auth
def get_data():
    row = get_db().execute(
        text('SELECT data FROM user_data WHERE user_id = :uid'),
        {'uid': g.user_id}
    ).mappings().fetchone()
    if not row:
        return jsonify({'data': None})
    try:
        return jsonify({'data': json.loads(row['data'])})
    except Exception:
        return jsonify({'data': None})


@app.put('/api/data')
@require_auth
def save_data():
    data = (request.get_json(silent=True) or {}).get('data')
    if data is None:
        return jsonify({'error': 'No data provided'}), 400
    serialized = json.dumps(data, separators=(',', ':'))
    db = get_db()
    if IS_POSTGRES:
        db.execute(text('''
            INSERT INTO user_data (user_id, data, updated_at) VALUES (:uid, :d, NOW())
            ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        '''), {'uid': g.user_id, 'd': serialized})
    else:
        db.execute(text('''
            INSERT INTO user_data (user_id, data, updated_at) VALUES (:uid, :d, datetime('now'))
            ON CONFLICT (user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
        '''), {'uid': g.user_id, 'd': serialized})
    db.commit()
    return jsonify({'ok': True})


@app.delete('/api/data')
@require_auth
def clear_data():
    db = get_db()
    db.execute(text('DELETE FROM user_data WHERE user_id = :uid'), {'uid': g.user_id})
    db.commit()
    return jsonify({'ok': True})

# ── Health ────────────────────────────────────────────────────────────────────

@app.get('/api/health')
def health():
    return jsonify({'ok': True, 'db': 'postgresql' if IS_POSTGRES else 'sqlite', 'ts': int(time.time())})

# ── Frontend static files ─────────────────────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    target = os.path.join(FRONTEND_DIR, path)
    if path and os.path.isfile(target):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 3001))
    print(f'FlowCast  →  http://localhost:{port}')
    print(f'Database  →  {"PostgreSQL" if IS_POSTGRES else "SQLite (dev)"}')
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG','').lower()=='true')
