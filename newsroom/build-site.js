// Builds the public site into ./site so Railway can serve it.
//   node newsroom/build-site.js
//   /                       the newsroom island (prototype/floor.html)
//   /editions/              a list of every edition
//   /editions/YYYY-MM-DD/   that day's carousel, with its PDF alongside
// Run it after newsroom/floor-sync.js and newsroom/render.js. Commit site/ and Railway redeploys.
const fs = require('fs');
const path = require('path');

const repo = path.join(__dirname, '..');
const src = path.join(__dirname, 'editions');
const out = path.join(repo, 'site');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const plain = s => String(s || '').replace(/\*/g, '');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'editions'), { recursive: true });

// the island, with its links pointing at this site
const floor = fs.readFileSync(path.join(repo, 'prototype', 'floor.html'), 'utf8');
if (!floor.includes('const HOSTED = false;')) throw new Error('floor.html has no HOSTED flag; run floor-sync.js first');
fs.writeFileSync(path.join(out, 'index.html'), floor.replace('const HOSTED = false;', 'const HOSTED = true;'));
fs.cpSync(path.join(repo, 'prototype', 'logos'), path.join(out, 'logos'), { recursive: true });

const dates = fs.readdirSync(src).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && fs.existsSync(path.join(src, d, 'carousel.html'))).sort();
const cards = [];
for (const date of dates.slice().reverse()) {
  const from = path.join(src, date), to = path.join(out, 'editions', date);
  const e = JSON.parse(fs.readFileSync(path.join(from, 'edition.json'), 'utf8'));
  fs.mkdirSync(to, { recursive: true });
  // the carousel's last page links back to this site's island
  const html = fs.readFileSync(path.join(from, 'carousel.html'), 'utf8').replace(/("floorUrl":)"[^"]*"/, '$1"../../"');
  fs.writeFileSync(path.join(to, 'index.html'), html);
  for (const d of ['images', 'logos']) if (fs.existsSync(path.join(from, d))) fs.cpSync(path.join(from, d), path.join(to, d), { recursive: true });
  const pdf = path.join(from, 'carousel.pdf');
  const hasPdf = fs.existsSync(pdf);
  if (hasPdf) fs.copyFileSync(pdf, path.join(to, 'carousel.pdf'));
  const heads = [...(e.sections.saw || []), ...(e.sections.platform || [])].map(s => plain(s.headline));
  cards.push(
    '<article class="card"><div class="meta"><span class="date">' + esc(e.dateLabel) + '</span><span class="kind">' + esc(e.edition) + '</span></div>' +
    '<ul>' + heads.map(h => '<li>' + esc(h) + '</li>').join('') + '</ul>' +
    '<div class="acts"><a class="go" href="' + date + '/">Open the carousel →</a>' +
    (hasPdf ? '<a class="pdf" href="' + date + '/carousel.pdf">PDF · ' + (fs.statSync(pdf).size / 1048576).toFixed(1) + ' MB</a>' : '') + '</div></article>');
}

fs.writeFileSync(path.join(out, 'editions', 'index.html'), `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jungle Newsroom editions</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#2a2927;--card:#34322f;--line:rgba(255,255,255,.14);--text:#f4f1ea;--dim:#a9a49a;--green:#7ef25c}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:Poppins,system-ui,sans-serif;line-height:1.45}
.wrap{max-width:860px;margin:0 auto;padding:28px 16px 64px}
header{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:26px}
header img{height:30px;display:block}
header a{color:#1d1c1a;background:var(--green);border-radius:999px;padding:8px 18px;font-weight:700;font-size:14px;text-decoration:none}
h1{font-size:clamp(34px,7vw,56px);line-height:1.02;letter-spacing:-.03em;margin:0 0 6px;font-weight:800}
h1 em{font-style:normal;color:var(--green)}
.sub{margin:0 0 26px;color:var(--dim)}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px 22px;margin-bottom:16px}
.meta{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline}
.date{font-weight:800;font-size:22px}
.kind{color:var(--green);font-weight:600;font-size:14px}
.card ul{margin:12px 0 16px;padding-left:18px;color:var(--dim);font-size:14px}
.card li{margin:3px 0}
.acts{display:flex;gap:10px;flex-wrap:wrap}
.acts a{text-decoration:none;font-weight:700;font-size:14px;border-radius:999px;padding:9px 18px}
.go{background:var(--green);color:#1d1c1a}
.pdf{border:1.5px solid var(--line);color:var(--text)}
.pdf:hover{border-color:var(--text)}
a:focus-visible{outline:3px solid var(--green);outline-offset:2px}
footer{color:var(--dim);font-size:13px;margin-top:28px}
</style></head><body><div class="wrap">
<header><img src="../logos/jungle-wordmark-white.png" alt="Jungle"><a href="../">See the newsroom island →</a></header>
<h1>Every morning's <em>newsroom</em></h1>
<p class="sub">The latest first. Open the carousel in your browser, or take the PDF.</p>
${cards.join('\n')}
<footer>Made by the Jungle Newsroom. Every claim is traced to its source.</footer>
</div></body></html>`);

console.log('Built site/ with ' + dates.length + ' editions');
