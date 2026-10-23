// node --test auth/
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const crypto = require('crypto');
const createAuth = require('./jungle-auth');

const SECRET = 'x'.repeat(40), CLIENT = 'client-123.apps.googleusercontent.com';
const jwt = c => 'h.' + Buffer.from(JSON.stringify(c)).toString('base64url') + '.s';

// a fake Google token endpoint: whatever claims we set are what "Google" returns
function start(claimsFor, extra = {}) {
  const fakeFetch = async () => ({ ok: true, json: async () => ({ id_token: jwt(claimsFor.current) }) });
  const auth = createAuth({ clientId: CLIENT, clientSecret: 's', sessionSecret: SECRET, baseUrl: 'http://localhost', fetch: fakeFetch, ...extra });
  const srv = http.createServer((req, res) => { if (auth.handle(req, res)) return; res.end('APP ' + req.user.email); });
  return new Promise(r => srv.listen(0, () => r({ srv, url: 'http://localhost:' + srv.address().port })));
}
const get = (url, cookie) => fetch(url, { redirect: 'manual', headers: cookie ? { cookie } : {} });
const jar = res => res.headers.getSetCookie().map(c => c.split(';')[0]).filter(c => !/=$/.test(c)).join('; ');

async function signIn(base, claims) {
  const start = await get(base + '/auth/google?next=/editions/');
  const loc = new URL(start.headers.get('location'));
  const flowCookie = jar(start);
  claims.current = { iss: 'https://accounts.google.com', aud: CLIENT, exp: Date.now() / 1000 + 300, nonce: claims.nonce ?? decodeFlow(flowCookie).nonce, email_verified: true, ...claims.base };
  return { loc, flowCookie, cb: state => get(base + '/auth/callback?code=abc&state=' + state, flowCookie) };
}
const decodeFlow = c => JSON.parse(Buffer.from(c.split('=')[1].split('.')[0], 'base64url').toString());

test('unconfigured: refuses to serve', async () => {
  const auth = createAuth({});
  const srv = http.createServer((q, s) => { if (auth.handle(q, s)) return; s.end('OPEN'); });
  await new Promise(r => srv.listen(0, r));
  const res = await get('http://localhost:' + srv.address().port + '/');
  assert.equal(res.status, 503); srv.close();
});

test('signed out: sent to the login page, which has a Google button', async () => {
  const { srv, url } = await start({});
  const r = await get(url + '/editions/');
  assert.equal(r.status, 302); assert.match(r.headers.get('location'), /^\/login\?next=%2Feditions%2F/);
  const l = await fetch(url + '/login'); assert.equal(l.status, 200); assert.match(await l.text(), /Sign in with Google/);
  const post = await fetch(url + '/', { method: 'POST', redirect: 'manual' }); assert.equal(post.status, 401);
  srv.close();
});

test('Google redirect carries state, PKCE, nonce and the domain hint', async () => {
  const claims = {}; const { srv, url } = await start(claims);
  const { loc } = await signIn(url, claims);
  assert.equal(loc.host, 'accounts.google.com');
  for (const k of ['state', 'nonce', 'code_challenge']) assert.ok(loc.searchParams.get(k), k);
  assert.equal(loc.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(loc.searchParams.get('hd'), 'junglecreations.com');
  assert.equal(loc.searchParams.get('redirect_uri'), 'http://localhost/auth/callback');
  srv.close();
});

test('a Jungle account signs in, lands where it was going, and stays signed in', async () => {
  const claims = { base: { email: 'Jules@JungleCreations.com', hd: 'junglecreations.com', name: 'Jules' } }; const { srv, url } = await start(claims);
  const s = await signIn(url, claims);
  const r = await s.cb(s.loc.searchParams.get('state'));
  assert.equal(r.status, 302); assert.equal(r.headers.get('location'), '/editions/');
  const session = jar(r); assert.match(session, /^jn_session=/);
  assert.match(r.headers.getSetCookie().join(' '), /HttpOnly/);
  assert.equal(await (await get(url + '/', session)).text(), 'APP jules@junglecreations.com');
  srv.close();
});

test('other accounts are turned away', async () => {
  for (const base of [
    { email: 'someone@gmail.com', name: 'x' },                                              // personal Gmail, no hd
    { email: 'x@evil.com', hd: 'evil.com', name: 'x' },                                     // another company
    { email: 'x@junglecreations.com', name: 'x' },                                          // right domain but no hosted-domain claim
    { email: 'x@junglecreations.com', hd: 'junglecreations.com', email_verified: false },   // unverified
    { email: 'x@junglecreations.com.evil.com', hd: 'junglecreations.com' }                  // look-alike
  ]) {
    const claims = { base: { name: 'x', ...base } }; const { srv, url } = await start(claims);
    const s = await signIn(url, claims);
    const r = await s.cb(s.loc.searchParams.get('state'));
    assert.match(r.headers.get('location'), /^\/login\?error=domain$/, JSON.stringify(base));
    assert.ok(!/jn_session=\w/.test(jar(r)), 'no session for ' + base.email);
    srv.close();
  }
});

test('bad state, wrong nonce, wrong audience and tampered cookies all fail', async () => {
  const good = { email: 'a@junglecreations.com', hd: 'junglecreations.com', name: 'a' };
  let claims = { base: good }; let { srv, url } = await start(claims); let s = await signIn(url, claims);
  assert.equal((await s.cb('wrong')).headers.get('location'), '/login?error=failed'); srv.close();
  claims = { base: good, nonce: 'other' }; ({ srv, url } = await start(claims)); s = await signIn(url, claims);
  assert.equal((await s.cb(s.loc.searchParams.get('state'))).headers.get('location'), '/login?error=failed'); srv.close();
  claims = { base: { ...good, aud: 'someone-else' } }; ({ srv, url } = await start(claims)); s = await signIn(url, claims);
  assert.equal((await s.cb(s.loc.searchParams.get('state'))).headers.get('location'), '/login?error=failed');
  const forged = 'jn_session=' + Buffer.from(JSON.stringify({ email: 'a@junglecreations.com', name: 'a', exp: 9e9 })).toString('base64url') + '.AAAA';
  assert.equal((await get(url + '/', forged)).status, 302);
  const own = crypto.createHmac('sha256', 'y'.repeat(40)).update('p').digest('base64url');
  assert.equal((await get(url + '/', 'jn_session=p.' + own)).status, 302);
  srv.close();
});

test('only same-site paths are followed after login', async () => {
  const claims = { base: { email: 'a@junglecreations.com', hd: 'junglecreations.com', name: 'a' } }; const { srv, url } = await start(claims);
  for (const bad of ['//evil.com', 'https://evil.com', '/\\evil.com']) {
    const st = await get(url + '/auth/google?next=' + encodeURIComponent(bad));
    const flowCookie = jar(st); claims.current = { iss: 'accounts.google.com', aud: CLIENT, exp: Date.now() / 1000 + 300, nonce: decodeFlow(flowCookie).nonce, email_verified: true, ...claims.base };
    const r = await get(url + '/auth/callback?code=1&state=' + new URL(st.headers.get('location')).searchParams.get('state'), flowCookie);
    assert.equal(r.headers.get('location'), '/', bad);
  }
  srv.close();
});

test('logout clears the session', async () => {
  const { srv, url } = await start({});
  const r = await get(url + '/logout'); assert.equal(r.headers.get('location'), '/login');
  assert.match(r.headers.getSetCookie().join(' '), /jn_session=;.*Max-Age=0/); srv.close();
});

test('AUTH_MODE=off is ignored on Railway', async () => {
  process.env.RAILWAY_ENVIRONMENT = 'production';
  const auth = createAuth({ mode: 'off' });
  const srv = http.createServer((q, s) => { if (auth.handle(q, s)) return; s.end('OPEN'); });
  await new Promise(r => srv.listen(0, r));
  assert.equal((await get('http://localhost:' + srv.address().port + '/')).status, 503);
  delete process.env.RAILWAY_ENVIRONMENT; srv.close();
});
