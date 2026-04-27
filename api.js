// FlowCast — API client (plain JS, no React)
// Talks to the Flask backend on Railway.
// Falls back gracefully if the backend is unavailable (localStorage-only mode).

const Api = (() => {
  const BASE_URL  = 'https://flowcast-production-34a3.up.railway.app';
  const TOKEN_KEY = 'fc_token';
  const USER_KEY  = 'fc_user';

  // ── Token management ────────────────────────────────────────────────────────
  function getToken()          { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t)         { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken()        { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
  function isLoggedIn()        { return !!getToken(); }
  function getUser()           { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
  function setUser(u)          { localStorage.setItem(USER_KEY, JSON.stringify(u)); }

  // ── Unauthenticated callback (called on 401) ────────────────────────────────
  let _onUnauth = null;
  function onUnauthenticated(cb) { _onUnauth = cb; }

  // ── Core fetch wrapper ──────────────────────────────────────────────────────
  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(BASE_URL + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      throw new Error('Cannot reach server — is the backend running?');
    }

    if (res.status === 401) {
      clearToken();
      if (_onUnauth) _onUnauth();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Session expired');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error (${res.status})`);
    }

    return res.json();
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  async function register(email, password) {
    const data = await request('POST', '/api/auth/register', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login(email, password) {
    const data = await request('POST', '/api/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    clearToken();
    if (_onUnauth) _onUnauth();
  }

  // ── User data ───────────────────────────────────────────────────────────────
  async function loadData() {
    return request('GET', '/api/data');
  }

  async function saveData(data) {
    return request('PUT', '/api/data', { data });
  }

  async function clearData() {
    return request('DELETE', '/api/data');
  }

  async function changePassword(currentPassword, newPassword) {
    return request('POST', '/api/auth/change-password', { currentPassword, newPassword });
  }

  // ── Health ──────────────────────────────────────────────────────────────────
  async function ping() {
    try {
      const r = await fetch(BASE_URL + '/api/health');
      return r.ok;
    } catch {
      return false;
    }
  }

  return {
    getToken, isLoggedIn, getUser,
    onUnauthenticated,
    register, login, logout,
    loadData, saveData, clearData,
    changePassword,
    ping,
  };
})();
