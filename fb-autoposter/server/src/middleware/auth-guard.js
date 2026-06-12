const crypto = require('crypto');

const COOKIE_NAME = 'autoposter_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Simple token-based session: hash of password + timestamp
function createSessionToken(password) {
  const ts = Date.now().toString();
  const hash = crypto.createHash('sha256').update(password + ts).digest('hex');
  return `${ts}.${hash}`;
}

function verifySessionToken(token, password) {
  if (!token || !password) return false;
  const [ts, hash] = token.split('.');
  if (!ts || !hash) return false;
  // Check token age
  const age = Date.now() - parseInt(ts, 10);
  if (age > SESSION_MAX_AGE) return false;
  // Verify hash
  const expected = crypto.createHash('sha256').update(password + ts).digest('hex');
  return hash === expected;
}

const LOGIN_HTML = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FB Autoposter - Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0F172A; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #e2e8f0; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; text-align: center; }
    h1 { font-size: 20px; margin-bottom: 8px; color: #f1f5f9; }
    p { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
    input { width: 100%; padding: 12px 16px; border: 1px solid #475569; border-radius: 10px; background: #0f172a; color: #e2e8f0; font-size: 16px; outline: none; margin-bottom: 16px; text-align: center; letter-spacing: 2px; }
    input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
    button { width: 100%; padding: 12px; border: none; border-radius: 10px; background: linear-gradient(135deg, #0ea5e9, #0369a1); color: white; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.9; }
    .error { color: #f87171; font-size: 13px; margin-bottom: 12px; display: none; }
    .logo { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #0ea5e9, #0369a1); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">AP</div>
    <h1>FB Autoposter</h1>
    <p>Panglao Prime Villas</p>
    <form method="POST" action="/auth/login">
      <input type="password" name="password" placeholder="סיסמה" autocomplete="current-password" autofocus required>
      <div class="error" id="err">סיסמה שגויה</div>
      <button type="submit">כניסה</button>
    </form>
  </div>
  <script>
    if (location.search.includes('error=1')) document.getElementById('err').style.display='block';
  </script>
</body>
</html>`;

function authGuard(app) {
  const password = process.env.AUTOPOSTER_PASSWORD;

  // If no password set, skip auth (local dev)
  if (!password) {
    console.log('[auth] No AUTOPOSTER_PASSWORD set - authentication disabled');
    return;
  }

  console.log('[auth] Password authentication enabled');

  // Login page
  app.get('/auth/login', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(LOGIN_HTML);
  });

  // Login POST
  app.post('/auth/login', (req, res) => {
    const submitted = req.body?.password;
    if (submitted === password) {
      const token = createSessionToken(password);
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });
      // Redirect to the app
      const returnTo = req.query.returnTo || '/';
      res.redirect(returnTo);
    } else {
      res.redirect('/auth/login?error=1');
    }
  });

  // Logout
  app.get('/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.redirect('/auth/login');
  });

  // Guard middleware - applied to all routes except login
  app.use((req, res, next) => {
    // Allow login routes
    if (req.path === '/auth/login' || req.path === '/auth/logout') return next();

    // Check session cookie
    const token = req.cookies?.[COOKIE_NAME];
    if (verifySessionToken(token, password)) return next();

    // Not authenticated
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Redirect to login for HTML pages
    res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
  });
}

module.exports = { authGuard };
