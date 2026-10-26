# Jungle-only login for every app and dashboard

Standard for anything we build: **no page opens without "Sign in with Google" on a Jungle account.** The login lives in one dependency-free file, `auth/jungle-auth.js`, so each new app copies it (or this repo is the source to copy from) and adds its own Google OAuth client.

What it enforces (tested in `auth/jungle-auth.test.js`; run `node --test auth/jungle-auth.test.js`):
- the Google account must be verified and carry the Jungle Workspace domain (`hd` claim plus the email address), so personal Gmail and look-alike domains are turned away;
- login uses state, a nonce and PKCE; the session is a signed, HttpOnly cookie for 7 days;
- if it isn't configured, the app shows a 503 and serves nothing. It never falls back to open;
- `AUTH_MODE=off` works for local development only and is ignored on Railway.
- `AUTH_MODE=public` opens the app to anyone, on Railway too. It is an explicit, temporary switch for while the Google OAuth client is being set up; remove the variable to turn the login back on.

## Add it to an app

```js
const auth = require('./auth/jungle-auth')({ appName: 'Name shown on the login page' });
http.createServer((req, res) => {
  if (auth.handle(req, res)) return;   // login, callback, logout and the redirect for signed-out visitors
  // req.user = { email, name }
});
```

Express and other frameworks: call `auth.handle(req, res)` first in a middleware and stop if it returns `true`.

## Settings (environment variables)

| Variable | What it is |
|---|---|
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | from the app's Google OAuth client (below) |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `BASE_URL` | the app's public address, no trailing slash |
| `ALLOWED_DOMAINS` | default `junglecreations.com`; comma-separate to add more |
| `ALLOWED_EMAILS` | optional one-off outside addresses |

## Per-app setup (once per app)

1. **Google Cloud console** (signed in with your Jungle account), in a project under the Jungle organisation: *APIs & Services → OAuth consent screen* → user type **Internal**. Internal means Google itself only lets Jungle Workspace accounts through. Then *Credentials → Create credentials → OAuth client ID → Web application*, with the authorised redirect URI `BASE_URL/auth/callback` (and `http://localhost:3000/auth/callback` for local work). Copy the client ID and secret. Google offers no command for this step, so it's done in the console.
2. **Railway** (from the app's folder, linked to its project):

```
railway variable set GOOGLE_CLIENT_ID=... BASE_URL=https://... ALLOWED_DOMAINS=junglecreations.com --skip-deploys
echo "THE_CLIENT_SECRET" | railway variable set GOOGLE_CLIENT_SECRET --stdin --skip-deploys
openssl rand -hex 32 | railway variable set SESSION_SECRET --stdin --skip-deploys
railway redeploy --from-source
```

3. Open the app: you should land on the Jungle login page, and a personal Gmail should be refused.

## Paste this to Claude Code in your terminal (inside the repo)

> Set up Jungle-only Google login for this app, following docs/jungle-login.md. Pull the repo's branch, make sure `server.js` calls `auth/jungle-auth.js` first, run `node --test auth/jungle-auth.test.js`, then create the Railway variables from docs/jungle-login.md. I'll give you the Google client ID and secret when you ask; don't print the secret or commit it, and pass it to Railway with `--stdin`. Set BASE_URL to the Railway domain from `railway domain`. When it's deployed, check that the home page redirects to /login and tell me the exact redirect URI I need to add in Google Cloud. Don't push anything other than code and docs.

## Newsroom specifics

- The newsroom site (`server.js`) already uses it. The carousel links, the island and every PDF now need a Jungle sign-in; the PDF in Slack is unaffected.
- Until the Railway variables are set, the deployed site shows "Login isn't set up yet" instead of the island. That is intended.
- The Slack recap links open the login page first for anyone signed out, then take them to the page.
