# Morning run

How one edition of the Jungle Newsroom is made. Follows `docs/agent-newsroom-principles.md`: every claim sourced, no invented figures, nothing posts without a human.

## Models (cost vs quality)
Each step runs on the cheapest model that holds quality for it. Run the Scout, Trend, Fact-check and desk steps as sub-agents on their model; Sterling's edit and Ozzie's review stay in the main session (Opus).

| Step | Who | Model | Effort | Why |
|---|---|---|---|---|
| Scout | Mira | Claude Sonnet 5.5 | medium | Heavy web search and reading; needs judgement to spot real moments |
| Momentum tags | Cam | Claude Haiku 5.5 | low | Simple, high-volume tagging |
| Fact-check | Tilly | Claude Sonnet 5.5 | high | Accuracy over speed; opens every source |
| Desk ideas | Desk monkeys | Claude Haiku 5.5 | medium | Filter a checked shortlist for one brand; step up to Sonnet 5.5 if Ozzie sends work back twice |
| Pick and write | Sterling | Claude Opus 5.5 | medium | Story choice and writing quality |
| Review | Ozzie | Claude Opus 5.5 | high | Final quality gate |

Prices per million input / output tokens: Opus 5.5 $4 / $20, Sonnet 5.5 $2 / $10, Haiku 5.5 $0.10 / $0.50.

### Switching models when quality slips
Every step starts on its base model above and can step up when its work isn't good enough:
- **Trigger:** Ozzie sends a step's work back twice in the same run (Scout misses obvious moments, a desk's ideas are generic, a fact-check leaves gaps), or Jules flags the same weakness in feedback.
- **Ladder:** Haiku 5.5 → Sonnet 5.5 → Opus 5.5. Re-run only the failing step, one rung up. Steps already on Opus go up in effort instead (medium → high → xhigh).
- **Ozzie's own review:** if Jules says the review let weak work through, run Ozzie at xhigh effort for the next editions.
- **Stepping down:** each run starts from the base plan again. If the same step needed a step-up on three runs in a row, raise its base model in this table (and say so to Jules) instead of escalating every day. If a step has run cleanly on its base for a week, try one rung down on the next edition and keep it if Ozzie passes it.
- **Log every switch** in the edition folder (`models.log`): step, from, to, one-line reason. The cost difference shows up there.

## The week's rhythm
Each weekday edition has its own job:

| Day | Edition | Window |
|---|---|---|
| Monday | **Weekend wrap-up**: what we might have missed on social over the weekend | Friday evening to Sunday night |
| Tuesday to Thursday | **The daily**: what's moving now | Last 24 to 72 hours; up to a week for a topic still building |
| Friday | **Best of the week**: the strongest stories of the week, plus anything new worth knowing | Monday to Friday, starting from this week's editions |

Set `edition` in `edition.json` to the edition name, so the cover shows it. On Friday, read this week's earlier `edition.json` files first and say which stories carried on growing.

## 1. Scout (Mira)
Search the window for today's edition, UK first, global when a trend crosses borders. Read the original source, not a rewrite.
- Platforms: TikTok Newsroom, Instagram (@creators, Meta newsroom), YouTube blog, Snapchat, X, Threads, Pinterest.
- Trade press: Social Media Today, The Drum, Campaign, Adweek, Marketing Week, Marketing Beat, Press Gazette. Campaign and Adweek's work and campaign coverage often shows what is about to drive content.
- Other agencies, for leads only: OKAY COOL's channels and its founders' LinkedIn posts. Use them to spot moments and updates, then trace each one to the original post, brand or platform and cite that. Never quote, credit or name OKAY COOL or any other agency in an edition, least of all next to Jungle: it's about the content and the updates, not who spotted them.
- Culture: Google Trends UK, Know Your Meme, BBC Culture/Entertainment, TikTok Creative Center.
- Client categories: Disney UK news and releases; family and half-term culture; Disney Store UK products and retail moments; food and grocery (The Grocer) for Mutti; home and retail (Retail Gazette) for DFS; gym, fitness and sports nutrition culture for Optimum Nutrition UK.
Shortlist 10 to 12 items, each with its source link and date.

## 2. Trend Analyst (Cam)
Tag each item: momentum (Rising, Peaking, Fading), region (UK or Global) and main platform. Drop anything already faded.

## 3. Fact-checker (Tilly)
Open every source. Check each claim, figure and date. Drop anything that cannot be traced. Never fill a gap with a guess.

## Edition structure
1. **Things we saw**: 4 to 6 moments that happened on social (memes, stunts, viral moments, fandom rows), not platform news.
2. **Platform highlights**: 2 or 3 product or policy updates.
3. **Things to watch this week**: 3 to 5 dated items.
4. **Client slides**: 1 or 2 ideas plus one watch-out per client.
Every story has a link to the post or article and an image taken from it (saved in `images/`, credited on the slide). Font: Poppins. Wordmark: `logos/jungle-wordmark-white.png`.

## 4. Desks
Pick the 5 or 6 strongest stories. Then:
- Jungle (Sterling): two thought leadership prompts for Strategy and Data & Insight, one quick reactive idea for Jungle's own social.
- Each client desk: one or two ideas tied to a named story, plus one watch-out. Desks: Disney UK, Disney Family UK, Disney Store UK, Mutti UK, Optimum Nutrition UK, DFS. A desk may have nothing today; that is fine.
Brief packs are not written yet, so desks work from what is public about each brand.

## 5. Review (Ozzie)
Test every story and idea against the five gates: forward, business, accessible, stopping power, brand. Cut what fails. Correct but dull fails.

## 6. Ship
1. Write `newsroom/editions/YYYY-MM-DD/edition.json`, following `newsroom/editions/_example/edition.json` (a copy of the 19 Oct edition; use it for shape only). Set `edition`, `coverTitle` and `coverSub`; wrap the key words of a headline or title in `*asterisks*` to set them in Jungle green. Keep headlines under about 12 words and `what` under about 45 words so they fit the slide.
2. `node newsroom/render.js newsroom/editions/YYYY-MM-DD` renders `carousel.html`, `slides/*.png` and `carousel.pdf`.
3. Commit and push the edition folder.
4. Publish `carousel.html` as an artifact (with the `logos/` files).
5. Add the artifact link to `edition.json` as `carouselUrl`, run `node newsroom/floor-sync.js` and republish `prototype/floor.html` to the newsroom island (https://claude.ai/artifact/QByUaU2dzAX6fAwH2X3jVb). The floor then opens on the new edition, its "Open the carousel" button points at it, and the arrows on the date step back through earlier days. Commit and push the floor too.
6. Post to the #agency-hq Slack channel (`CHFPZ108P`): upload `carousel.pdf` with a short recap (edition name and date, the headlines under "Things we saw" and "Platform highlights", and the "See the newsroom island" link). Leave out the carousel artifact link, which is private to Jules, and model step-ups, which go to Jules only. If Slack is unavailable, don't post anywhere else: make a Gmail draft to Jules with the same content.

## Style
Reference edition: `editions/2026-10-19/` (the second version Jules approved) sets the bar for structure, tone, images and links.

The carousel follows Jungle's own Instagram carousels (reference: instagram.com/p/DeeohthDBuS): dark concrete texture, hairline top bar, big bold sans, green for the key words, lowercase jungle wordmark.

UK English. Plain words, short sentences, no hype. Every story names its source and date.
