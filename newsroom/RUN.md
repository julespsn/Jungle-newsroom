# Morning run

How one edition of the Jungle Newsroom is made. Follows `docs/agent-newsroom-principles.md`: every claim sourced, no invented figures, nothing posts without a human.

## 1. Scout (Mira)
Search the last 72 hours, UK first, global when a trend crosses borders. Read the original source, not a rewrite.
- Platforms: TikTok Newsroom, Instagram (@creators, Meta newsroom), YouTube blog, Snapchat, X, Threads, Pinterest.
- Trade press: Social Media Today, The Drum, Campaign, Marketing Week, Marketing Beat, Press Gazette.
- Culture: Google Trends UK, Know Your Meme, BBC Culture/Entertainment, TikTok Creative Center.
- Client categories: Disney UK news and releases; family and half-term culture; food and grocery (The Grocer) for Mutti; home and retail (Retail Gazette) for DFS.
Shortlist 10 to 12 items, each with its source link and date.

## 2. Trend Analyst (Cam)
Tag each item: momentum (Rising, Peaking, Fading), region (UK or Global) and main platform. Drop anything already faded.

## 3. Fact-checker (Tilly)
Open every source. Check each claim, figure and date. Drop anything that cannot be traced. Never fill a gap with a guess.

## 4. Desks
Pick the 5 or 6 strongest stories. Then:
- Jungle (Sterling): two thought leadership prompts for Strategy and Data & Insight, one quick reactive idea for Jungle's own social.
- Each client desk: one or two ideas tied to a named story. A desk may have nothing today; that is fine.
Brief packs are not written yet, so desks work from what is public about each brand.

## 5. Review (Ozzie)
Test every story and idea against the five gates: forward, business, accessible, stopping power, brand. Cut what fails. Correct but dull fails.

## 6. Ship
1. Write `newsroom/editions/YYYY-MM-DD/edition.json` (shape: see the first edition).
2. `node newsroom/render.js newsroom/editions/YYYY-MM-DD` renders `carousel.html`, `slides/*.png` and `carousel.pdf`.
3. Commit and push the edition folder.
4. Publish `carousel.html` as an artifact (with the `logos/` files).
5. Deliver: Slack is not connected yet, so create a Gmail draft to Jules with the headlines, the artifact link and the PDF link.

## Style
UK English. Plain words, short sentences, no hype. Every story names its source and date.
