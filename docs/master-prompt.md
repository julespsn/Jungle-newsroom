# Master prompt for Claude Code in your terminal

Open a terminal in an empty folder, run `claude`, and paste everything between the lines.

---

You are setting up the Jungle Newsroom website on Railway with Jungle-only Google login. Work through every step in order, run the commands yourself, and only stop where I'm needed. Never print, log or commit a secret. Never push to any branch except `claude/dazzling-brown-aupje6`, and only code, docs and `newsroom/site.json`.

**1. Get the code**
- `git clone https://github.com/julespsn/Jungle-newsroom.git`, `cd Jungle-newsroom`, `git checkout claude/dazzling-brown-aupje6`.
- Read `docs/hosting.md` and `docs/jungle-login.md`. Check Node is 18 or newer.
- Run `node --test auth/jungle-auth.test.js`. All tests must pass before you go on; if one fails, stop and tell me.
- Run `node newsroom/build-site.js`, then test locally: `AUTH_MODE=off PORT=3000 node server.js`, check `/`, `/editions/` and `/editions/2026-10-23/` return 200, then stop the server. Also check that without `AUTH_MODE=off` the server returns 503 (it must never serve openly).

**2. Railway project**
- Install the CLI if missing: `npm i -g @railway/cli`. Run `railway login` (I'll complete it in the browser).
- `railway init --name jungle-newsroom`
- `railway add --service newsroom --repo julespsn/Jungle-newsroom --branch claude/dazzling-brown-aupje6`. If it can't reach the repo, tell me to connect GitHub in Railway's account settings and wait.
- `railway domain` and note the address, for example `https://newsroom-production-xxxx.up.railway.app`. That is BASE_URL.

**3. Google OAuth client (the one step that needs me)**
- Google offers no command for this, so tell me exactly what to do in the Google Cloud console (signed in with my Jungle account, project under the Jungle organisation):
  1. *Google Auth Platform / OAuth consent screen*: user type **Internal**, app name "Jungle Newsroom".
  2. *Credentials → Create credentials → OAuth client ID → Web application*. Authorised redirect URIs: `<BASE_URL>/auth/callback` and `http://localhost:3000/auth/callback`. Use the real BASE_URL from step 2.
  3. Copy the client ID and client secret.
- Then ask me for the client ID and secret. Wait for me.

**4. Railway settings**
- Set the variables without exposing the secret:
  - `railway variable set GOOGLE_CLIENT_ID=<id> BASE_URL=<BASE_URL> ALLOWED_DOMAINS=junglecreations.com --skip-deploys`
  - `echo "<secret>" | railway variable set GOOGLE_CLIENT_SECRET --stdin --skip-deploys`
  - `openssl rand -hex 32 | railway variable set SESSION_SECRET --stdin --skip-deploys`
- Do not set `AUTH_MODE`. Then `railway redeploy --from-source` (or `railway up` if that isn't available) and follow `railway logs` until the service is running.

**5. Check it works**
- `curl -sI <BASE_URL>/` must return a 302 to `/login`. `curl -s <BASE_URL>/login` must contain "Sign in with Google". `<BASE_URL>/editions/2026-10-23/carousel.pdf` must redirect to login, not download.
- Tell me to open the address in a browser, sign in with my Jungle account (it should land on the island), then try a personal Gmail (it must be refused). Wait for me to confirm.

**6. Switch the newsroom over**
- Set `"siteUrl"` in `newsroom/site.json` to the BASE_URL (no trailing slash).
- Run `node newsroom/floor-sync.js` then `node newsroom/build-site.js`.
- `git pull --rebase origin claude/dazzling-brown-aupje6`, commit with the message "Newsroom site is live on Railway" and push to `claude/dazzling-brown-aupje6`. Railway redeploys from the push.
- Check `<BASE_URL>/` again after the deploy.

**7. Report back**
Tell me in a few lines: the live address, that login works for Jungle accounts and refuses others, what I still need to do (nothing, if all passed), and a one-line note that the morning routines will now use these links on their next run. List anything that failed or that you skipped.

---

Why one prompt is enough: the newsroom's two morning routines read `newsroom/site.json` after they pull the repo, so once step 6 is pushed they switch to the new links by themselves.
