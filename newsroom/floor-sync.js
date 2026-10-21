// Copies every edition into the newsroom floor so it can step between days.
//   node newsroom/floor-sync.js
// Reads newsroom/editions/YYYY-MM-DD/edition.json and rewrites the block
// between "editions:start" and "editions:end" in prototype/floor.html.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'editions');
const floor = path.join(__dirname, '..', 'prototype', 'floor.html');
const MOMENTUM = { Rising: 'up', Peaking: 'peak', Fading: 'down' };
const plain = s => String(s || '').replace(/\*/g, '');

const editions = fs.readdirSync(dir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().map(date => {
  const e = JSON.parse(fs.readFileSync(path.join(dir, date, 'edition.json'), 'utf8'));
  const stories = [...(e.sections.saw || []), ...(e.sections.platform || [])].map(s => ({
    tags: [[s.momentum, MOMENTUM[s.momentum] || ''], [s.region, ''], [s.platform, '']],
    t: plain(s.short), note: plain(s.why), url: s.url
  }));
  const desks = {};
  for (const d of e.desks || []) {
    desks[d.id] = d.ideas.map(i => ({ tags: [[plain(i.from), '']], t: plain(i.idea), note: plain(i.note) }));
    if (d.watch) desks[d.id].push({ tags: [['Watch out', 'peak']], t: plain(d.watch) });
  }
  return { date, label: e.dateLabel, edition: e.edition, carousel: e.carouselUrl || null, stories, desks };
});

const html = fs.readFileSync(floor, 'utf8');
const block = '/* editions:start */\nconst EDITIONS = ' + JSON.stringify(editions).replace(/</g, '\\u003c') + ';\n/* editions:end */';
const next = html.replace(/\/\* editions:start \*\/[\s\S]*?\/\* editions:end \*\//, block);
if (next === html && !html.includes(block)) throw new Error('editions block not found in floor.html');
fs.writeFileSync(floor, next);
console.log('Floor now has ' + editions.length + ' editions, latest ' + editions[editions.length - 1].date);
