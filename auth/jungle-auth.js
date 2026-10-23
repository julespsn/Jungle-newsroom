// "Sign in with Google", for Jungle accounts only. No dependencies (Node 18+).
// Drop this file into any app and put it in front of everything:
//
//   const auth = require('./auth/jungle-auth')();          // reads the settings below from the environment
//   http.createServer((req, res) => {
//     if (auth.handle(req, res)) return;                    // served the login page, the callback, a redirect or a 401
//     ...your app; req.user is { email, name } here
//   })
//
// Settings (environment variables):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   from the Google Cloud OAuth client
//   SESSION_SECRET                           long random string (openssl rand -hex 32)
//   BASE_URL                                 the app's public address, e.g. https://newsroom.example.com
//   ALLOWED_DOMAINS                          comma-separated, default junglecreations.com
//   ALLOWED_EMAILS                           optional comma-separated extras (individual outside addresses)
//   AUTH_MODE=off                            local development only; ignored when running on Railway
//
// If it isn't configured the app refuses to serve anything (503). It never falls back to open.
const crypto = require('crypto');

const b64 = b => Buffer.from(b).toString('base64url');
const unb64 = s => Buffer.from(s, 'base64url').toString('utf8');
const list = s => String(s || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const COOKIE = 'jn_session', FLOW = 'jn_oauth';
const WEEK = 7 * 24 * 3600, TEN_MIN = 600;

module.exports = function createAuth(opts = {}) {
  const env = process.env;
  const cfg = {
    clientId: opts.clientId || env.GOOGLE_CLIENT_ID,
    clientSecret: opts.clientSecret || env.GOOGLE_CLIENT_SECRET,
    secret: opts.sessionSecret || env.SESSION_SECRET,
    baseUrl: (opts.baseUrl || env.BASE_URL || '').replace(/\/+$/, ''),
    domains: list(opts.domains || env.ALLOWED_DOMAINS || 'junglecreations.com'),
    emails: list(opts.emails || env.ALLOWED_EMAILS),
    authUrl: opts.authUrl || 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: opts.tokenUrl || 'https://oauth2.googleapis.com/token',
    publicPaths: opts.publicPaths || ['/logos/jungle-wordmark-white.png', '/healthz'],
    fetch: opts.fetch || fetch,
    appName: opts.appName || 'The Jungle Newsroom'
  };
  const off = (opts.mode || env.AUTH_MODE) === 'off' && !env.RAILWAY_ENVIRONMENT;
  const configured = cfg.clientId && cfg.clientSecret && cfg.secret && cfg.secret.length >= 32;

  const sign = v => crypto.createHmac('sha256', cfg.secret).update(v).digest('base64url');
  const pack = (obj, ttl) => { const p = b64(JSON.stringify({ ...obj, exp: Math.floor(Date.now() / 1000) + ttl })); return p + '.' + sign(p); };
  function unpack(v) {
    if (!v || !v.includes('.')) return null;
    const [p, sig] = v.split('.');
    const want = sign(p);
    if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
    try { const o = JSON.parse(unb64(p)); return o.exp > Date.now() / 1000 ? o : null; } catch { return null; }
  }
  const cookies = req => Object.fromEntries(String(req.headers.cookie || '').split(';').map(c => c.trim().split(/=(.*)/s).slice(0, 2)).filter(c => c[0]));
  const origin = req => cfg.baseUrl || ((req.headers['x-forwarded-proto'] || 'http').split(',')[0] + '://' + (req.headers['x-forwarded-host'] || req.headers.host));
  const secure = req => origin(req).startsWith('https');
  const setCookie = (res, req, name, value, maxAge) => {
    const prev = [].concat(res.getHeader('Set-Cookie') || []);
    res.setHeader('Set-Cookie', prev.concat(name + '=' + value + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAge + (secure(req) ? '; Secure' : '')));
  };
  const safeNext = n => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') && !n.includes('\\') ? n : '/');
  const allowed = email => {
    email = String(email || '').toLowerCase();
    return cfg.emails.includes(email) || cfg.domains.some(d => email.endsWith('@' + d));
  };

  function page(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(body);
  }
  function loginPage(res, next, error) {
    const msg = {
      domain: 'That Google account isn\'t a Jungle account. Sign in with your ' + cfg.domains.map(d => '@' + d).join(' or ') + ' email.',
      denied: 'Google sign-in was cancelled.',
      failed: 'Sign-in didn\'t work. Please try again.'
    }[error];
    page(res, error === 'domain' ? 403 : 200, `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&display=swap" rel="stylesheet">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#2a2927;color:#f4f1ea;font-family:Poppins,system-ui,sans-serif;padding:16px}
main{width:min(440px,100%);text-align:center}img{height:34px;margin-bottom:26px}h1{font-size:40px;line-height:1.05;letter-spacing:-.03em;margin:0 0 10px;font-weight:800}h1 em{font-style:normal;color:#7ef25c}
p{color:#a9a49a;margin:0 0 26px}.err{background:#4a2b27;border:1px solid #a8483b;color:#ffd9d2;border-radius:12px;padding:12px 14px;margin:0 0 20px;font-size:14px}
a.g{display:inline-flex;align-items:center;gap:12px;background:#fff;color:#1f1f1f;font-weight:700;text-decoration:none;border-radius:999px;padding:12px 24px;font-size:16px}
a.g:focus-visible{outline:3px solid #7ef25c;outline-offset:3px}</style></head><body><main>
<img src="/logos/jungle-wordmark-white.png" alt="Jungle"><h1>Jungle <em>only</em></h1><p>${esc(cfg.appName)} is for the Jungle team. Sign in with your Jungle Google account.</p>
${msg ? '<div class="err" role="alert">' + esc(msg) + '</div>' : ''}
<a class="g" href="/auth/google?next=${encodeURIComponent(next)}"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>Sign in with Google</a>
</main></body></html>`);
  }

  async function callback(req, res, url) {
    const flow = unpack(cookies(req)[FLOW]);
    setCookie(res, req, FLOW, '', 0);
    const fail = code => { res.writeHead(302, { Location: '/login?error=' + code }); res.end(); };
    if (url.searchParams.get('error')) return fail('denied');
    if (!flow || !url.searchParams.get('code') || url.searchParams.get('state') !== flow.state) return fail('failed');
    let token;
    try {
      const r = await cfg.fetch(cfg.tokenUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code: url.searchParams.get('code'), client_id: cfg.clientId, client_secret: cfg.clientSecret,
          redirect_uri: origin(req) + '/auth/callback', grant_type: 'authorization_code', code_verifier: flow.verifier })
      });
      token = await r.json();
      if (!r.ok || !token.id_token) return fail('failed');
    } catch { return fail('failed'); }
    // The id_token comes straight from Google's token endpoint over TLS, so its signature needn't be re-checked
    // (OpenID Connect Core 3.1.3.7). Everything it claims is checked here.
    let c;
    try { c = JSON.parse(unb64(token.id_token.split('.')[1])); } catch { return fail('failed'); }
    const now = Date.now() / 1000;
    if (!['https://accounts.google.com', 'accounts.google.com'].includes(c.iss) || c.aud !== cfg.clientId || c.exp < now || c.nonce !== flow.nonce) return fail('failed');
    if (c.email_verified !== true && c.email_verified !== 'true') return fail('domain');
    const email = String(c.email || '').toLowerCase();
    // Workspace accounts carry the hosted-domain claim, so a personal Gmail address can't pass as Jungle.
    const inDomain = cfg.domains.some(d => email.endsWith('@' + d) && c.hd === d);
    if (!inDomain && !cfg.emails.includes(email)) return fail('domain');
    setCookie(res, req, COOKIE, pack({ email, name: c.name || email }, WEEK), WEEK);
    res.writeHead(302, { Location: safeNext(flow.next) }); res.end();
  }

  return {
    // true when this function has already answered the request
    handle(req, res) {
      if (off) { req.user = { email: 'local@dev', name: 'Local dev' }; return false; }
      if (!configured) { page(res, 503, '<h1>Login isn\'t set up yet</h1><p>This app needs its Google sign-in settings before it can open.</p>'); return true; }
      const url = new URL(req.url, 'http://x');
      const p = url.pathname;
      if (cfg.publicPaths.includes(p)) return false;
      if (p === '/login') { loginPage(res, safeNext(url.searchParams.get('next')), url.searchParams.get('error')); return true; }
      if (p === '/logout') { setCookie(res, req, COOKIE, '', 0); res.writeHead(302, { Location: '/login' }); res.end(); return true; }
      if (p === '/auth/google') {
        const flow = { state: crypto.randomBytes(16).toString('hex'), nonce: crypto.randomBytes(16).toString('hex'), verifier: crypto.randomBytes(32).toString('base64url'), next: safeNext(url.searchParams.get('next')) };
        setCookie(res, req, FLOW, pack(flow, TEN_MIN), TEN_MIN);
        const q = new URLSearchParams({ client_id: cfg.clientId, redirect_uri: origin(req) + '/auth/callback', response_type: 'code', scope: 'openid email profile',
          state: flow.state, nonce: flow.nonce, code_challenge: crypto.createHash('sha256').update(flow.verifier).digest('base64url'), code_challenge_method: 'S256',
          prompt: 'select_account' });
        if (cfg.domains.length === 1) q.set('hd', cfg.domains[0]);
        res.writeHead(302, { Location: cfg.authUrl + '?' + q }); res.end(); return true;
      }
      if (p === '/auth/callback') { callback(req, res, url).catch(() => { if (!res.headersSent) { res.writeHead(302, { Location: '/login?error=failed' }); res.end(); } }); return true; }
      const s = unpack(cookies(req)[COOKIE]);
      if (s && allowed(s.email)) { req.user = { email: s.email, name: s.name }; return false; }
      if (req.method === 'GET' || req.method === 'HEAD') { res.writeHead(302, { Location: '/login?next=' + encodeURIComponent(safeNext(p + url.search)) }); res.end(); }
      else { res.writeHead(401, { 'Content-Type': 'text/plain' }); res.end('Sign in required'); }
      return true;
    }
  };
};
