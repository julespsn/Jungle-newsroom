# The agent newsroom: principles and backbone

A top-line model for running social content with a team of AI agents, built so a human reviews everything and the system gets better every week. Written to be adapted per client.

---

## 1. The core idea

A small crew of specialist agents works like a newsroom: one finds stories, one decides the angle, others write, check and design, and one challenges the lot. A human editor reviews every piece on a single review desk. Nothing goes out without approval.

The value is the process, not any one tool:
- **Specialists beat one generalist.** Each agent has one job, one brief and one output file. Easier to judge, easier to fix.
- **Checks are built in, not added at the end.** Every piece passes a fact check and a strategy check before a human sees it.
- **The human is the editor, not the producer.** Time goes on judgement (approve, change, drop), not on making.
- **It learns.** Performance data and the human's own edits feed back into the next run.

## 2. The crew (roles, not names)

| Role | Job | Output |
|---|---|---|
| Scout | Reads chosen sources (newsletters, trade press, platform newsrooms, culture), returns a shortlist traced to original sources | Shortlist with source links |
| Editor | Picks stories and the angle for each, using the brand's point of view; writes briefs | Briefs |
| Strategist | The critical voice. Tests every brief and finished piece against the brand's goals; sends weak work back; reviews performance weekly | Pass / rework / drop, with one-line reasons |
| Writer | Long-form (articles, newsletters) | Drafts |
| Social lead | Platform copy: carousels, reels scripts, captions, LinkedIn posts | Post copy and slide specs |
| Fact-checker | Checks every claim, figure and date against the original source | Claim-by-claim check |
| Art director | Sources and credits images; renders slides from templates | Finished visuals |
| Motion designer | Turns scripts and images into video from templates | MP4s |
| Publisher | Schedules approved items only | Scheduled posts, publish log |

Per client, the roles stay the same. What changes is the **brief pack** each agent reads (see 6).

## 3. The pipeline

1. **Plan the week (once a week).** Strategist reviews last week's figures; Editor drafts a slate (one slot per day per channel: date, format, section, idea, angle); Strategist challenges it; the human approves the slate.
2. **Daily run (early morning, automated).** Read the latest data, then Scout, Editor, Strategist (briefs), makers, Fact-checker, Strategist (finished pieces). Everything lands on the review desk.
3. **Human review (whenever the human starts their day).** Approve, request changes with a note, or reject. Change requests go back through the crew on the next run.
4. **Publish run (automated).** Only approved items, only on their date. Re-checks approved items that have aged before they go out.
5. **Learn.** Metrics collected; human edits compared with drafts; rules updated.

Work ahead: evergreen pieces are made days early so there's always a buffer of approved posts; news and culture pieces are made the day before.

## 4. Quality gates

Every piece answers these before a human sees it:
- **Forward:** who would send this to whom, and why?
- **Business:** which goal or offer does it serve? A forced link is a fail.
- **Accessible:** does someone outside the topic get it in three seconds?
- **Stopping power:** is it better than what everyone else posted this week? "Correct but dull" fails.
- **Brand:** does it make the brand look like itself? Hype, teasers and cheap grabs fail.

Plus: every fact traced to an original source; every image credited and cleared; covers that make people swipe; one visual family per post.

## 5. Guardrails (non-negotiable)

- **Nothing posts without human approval.** Automation only ever acts on approved items.
- **Never invent figures or results.** If a number isn't available, say so.
- **Every claim sourced**, every quote attributed, every image rights-checked.
- **Approved work is never changed silently.** If it needs to change, it goes back to the human.
- **Every model or plan change is logged** with a one-line reason, visible on the desk.

## 6. Making it per client

Keep one engine, swap the brief pack. Each client gets:
- **Brand book:** voice, banned words, visual templates, colours, fonts, logo rules.
- **Point of view:** the positions the brand holds and won't contradict.
- **Audience:** who it's for and who influences them.
- **Sources:** what the Scout reads for this client (category press, competitors, culture, platform updates).
- **Formats and rhythm:** channels, posting days, sections.
- **Approval chain:** who approves internally, then who approves client-side, and the deadlines for each.
- **Risk list:** legal or regulatory claims to avoid, competitor mentions, sensitive topics, embargoes.
- **Its own desk, data and learning log**, never mixed with another client's.

Things that change in client work and need deciding up front:
- **Image rights.** Editorial use of press images is not the same as a brand using them. Clients usually need owned, licensed or commissioned assets.
- **Two-step approval** (agency, then client) changes the timing: the buffer of approved posts matters more.
- **Disclosure and AI policy:** each client's position on AI-made content, and any platform labelling rules.
- **Data access:** which analytics the system can read for each client, and who owns that access.

## 7. The data loop (pivot live, without chasing noise)

- **Every run reads the latest figures**: saves, shares, comments, follows, reach, plus real business signals (enquiries, DMs, sales).
- **Change upcoming unmade pieces only on a pattern**: the same result across two or three posts, or one real business result. One post doing well or badly is noise.
- **Weekly look back** sets the next week's slate by section and format.
- **Time-boxed tests** (a new section, a new channel) with a review date and a keep-or-drop rule agreed at the start.
- **Learn from human edits.** Save what the human actually posted next to the draft; the next draft is written closer to it.

## 8. Cost and models

- Use the cheapest model that does the job well for each role; the strongest models only where judgement matters most (editing, long-form writing).
- **Step up one model** only when a quality check fails twice or a task is unusually hard, and log it.
- Track cost per run; it should be predictable.

## 9. The review desk

One place where the human sees everything: the week's plan, every draft with its visuals, the fact checks and strategy notes beside it, and approve / change / reject buttons. It also shows what each agent is doing live, so the system is never a black box. Per client, one desk (or one filtered view) per client.

## 10. Lessons learned building it

- **Lead with critique.** The strategist role is what lifts quality; without it the crew produces competent, forgettable work.
- **Specific notes beat general ones.** "Use the campaign key art, not a stock photo" beats "make it more engaging".
- **Personal or founder content needs its own rules.** It must sound like the person (short, plain, their quirks), always be tied to something real (news, a campaign, a cultural moment, a tool) and come with a visual. Standalone thoughts read as AI.
- **Covers are title pages.** They set up the story; they never look like the slides behind them.
- **Not everything can be automated.** Some platforms and formats (for example newsletters on some platforms, trending sounds on reels) still need a human step. Build reminders, not workarounds.
- **Automations break quietly.** Watch the first runs, check they saved their work, and make failures visible on the desk.
- **Start with one client and one channel**, prove the loop, then scale.

## 11. Starting checklist

1. Pick one client and one channel.
2. Write the brief pack (section 6).
3. Set up the crew roles and their output formats.
4. Build the review desk (even a simple shared board works to start).
5. Run manually for a week; tune the briefs from what you change.
6. Automate the daily run and the publish run.
7. Add the data loop once there are two weeks of figures.
8. Review after four weeks: time saved, quality, results. Then decide on the next client.
