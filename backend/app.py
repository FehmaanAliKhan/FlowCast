"""
FlowCast — Python/Flask backend
Serves the frontend static files and provides a JSON REST API with JWT auth.

Start: python3 backend/app.py
      (or: PORT=3001 python3 backend/app.py)
"""

import os, sqlite3, json, time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS

# ── Config ─────────────────────────────────────────────────────────────────────

SECRET_KEY = os.environ.get(
    'JWT_SECRET',
    'fc-dev-secret-b7e2a91d4f83c65e0d1a8b3f9c27e54ad61092e7f3b4a5c8d0e1f2'
)
TOKEN_DAYS   = 30
DB_PATH      = os.path.join(os.path.dirname(__file__), 'flowcast.db')
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# ── App setup ──────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder=None)
CORS(app, origins='*', supports_credentials=True)
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024   # 4 MB max body

# ── Database helpers ───────────────────────────────────────────────────────────

def get_db():
    if 'db' not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA journal_mode=WAL')
        conn.execute('PRAGMA foreign_keys=ON')
        g.db = conn
    return g.db

@app.teardown_appcontext
def close_db(_):
    db = g.pop('db', None)
    if db:
        db.close()

def init_db():
    with sqlite3.connect(DB_PATH) as db:
        db.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT    UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT    NOT NULL,
                created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS user_data (
                user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                data       TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        ''')
        print('[DB] Schema ready —', DB_PATH)

# ── JWT helpers ────────────────────────────────────────────────────────────────

def make_token(user_id: int, email: str) -> str:
    payload = {
        'sub':   str(user_id),
        'email': email,
        'exp':   datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS),
        'iat':   datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

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

# ── Simple in-memory rate limiter for auth endpoints ──────────────────────────

_rl: dict[str, list] = defaultdict(list)

def rate_limit(max_req: int = 20, window: int = 900):
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

# ── Error handler ──────────────────────────────────────────────────────────────

@app.errorhandler(Exception)
def handle_error(e):
    code = getattr(e, 'code', 500)
    return jsonify({'error': str(e)}), code

# ─────────────────────────────────────────────────────────────────────────────
# Auth routes
# ─────────────────────────────────────────────────────────────────────────────

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
        cur = db.execute(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            (email, pw_hash)
        )
        db.commit()
        user_id = cur.lastrowid
        token   = make_token(user_id, email)
        return jsonify({'token': token, 'user': {'id': user_id, 'email': email}}), 201
    except sqlite3.IntegrityError:
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
    row = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()

    # Always run hash check (timing-safe: avoids user enumeration)
    dummy_hash = b'$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    check_hash = row['password_hash'].encode() if row else dummy_hash
    match = bcrypt.checkpw(password.encode(), check_hash)

    if not row or not match:
        return jsonify({'error': 'Invalid email or password'}), 401

    token = make_token(row['id'], row['email'])
    return jsonify({'token': token, 'user': {'id': row['id'], 'email': row['email']}})


@app.get('/api/auth/me')
@require_auth
def me():
    db  = get_db()
    row = db.execute(
        'SELECT id, email, created_at FROM users WHERE id = ?',
        (g.user_id,)
    ).fetchone()
    if not row:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': dict(row)})

# ─────────────────────────────────────────────────────────────────────────────
# Data routes  (entire app state stored as a single JSON blob per user)
# ─────────────────────────────────────────────────────────────────────────────

@app.get('/api/data')
@require_auth
def get_data():
    db  = get_db()
    row = db.execute(
        'SELECT data FROM user_data WHERE user_id = ?',
        (g.user_id,)
    ).fetchone()
    if not row:
        return jsonify({'data': None})
    try:
        return jsonify({'data': json.loads(row['data'])})
    except Exception:
        return jsonify({'data': None})


@app.put('/api/data')
@require_auth
def save_data():
    body = request.get_json(silent=True) or {}
    data = body.get('data')
    if data is None:
        return jsonify({'error': 'No data provided'}), 400

    serialized = json.dumps(data, separators=(',', ':'))  # compact JSON
    db = get_db()
    db.execute('''
        INSERT INTO user_data (user_id, data, updated_at) VALUES (?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    ''', (g.user_id, serialized))
    db.commit()
    return jsonify({'ok': True})


@app.delete('/api/data')
@require_auth
def clear_data():
    db = get_db()
    db.execute('DELETE FROM user_data WHERE user_id = ?', (g.user_id,))
    db.commit()
    return jsonify({'ok': True})

# ─────────────────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────────────────

@app.get('/api/health')
def health():
    return jsonify({'ok': True, 'ts': int(time.time()), 'version': '1.0.0'})

# ─────────────────────────────────────────────────────────────────────────────
# Frontend — serve static files, SPA fallback to index.html
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    target = os.path.join(FRONTEND_DIR, path)
    if path and os.path.isfile(target):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    port  = int(os.environ.get('PORT', 3001))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    print(f'FlowCast server  →  http://localhost:{port}')
    print(f'Frontend dir     →  {FRONTEND_DIR}')
    app.run(host='0.0.0.0', port=port, debug=debug)
