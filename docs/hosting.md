# Hosting the newsroom on Railway

Railway serves the `site/` folder (the island, a list of every edition, and each carousel with its PDF). It deploys from this repo, so each morning's push updates the site.

One-time setup (in a terminal, from a clone of this repo):

```
npm i -g @railway/cli
railway login
railway init --name jungle-newsroom
railway add --service newsroom --repo julespsn/Jungle-newsroom --branch claude/dazzling-brown-aupje6
railway domain
```

Then set up the Jungle login (docs/jungle-login.md): the site shows "Login isn't set up yet" until its Google sign-in settings are in. Then put the address `railway domain` prints (for example `https://newsroom-production-xxxx.up.railway.app`) in `newsroom/site.json` as `siteUrl`. From then on the carousel's last page, the Slack recap and the island's buttons all point at the site.

Each morning: `node newsroom/floor-sync.js`, `node newsroom/render.js newsroom/editions/YYYY-MM-DD`, `node newsroom/build-site.js`, commit `site/` and push. Railway redeploys in a minute or two.

Test locally: `node newsroom/build-site.js && node server.js`, then open http://localhost:3000.
