# CareerLadder — Session Summary / Resume Notes

Hand this file (plus `PROJECT_ANALYSIS.md`) to a new chat to continue with full context.

## What the project is
CareerLadder / SQLingo — a Next.js 14 static site: 9 free, hands-on, no-signup IT
courses (SQL, BA, QA, Dev Fundamentals, Python, Django, FastAPI, DevOps, Capstone).
No backend. Progress is saved in the browser (localStorage). Hosted-style build on
Vercel. Brand promise: "free, no signup, no paywall, no dark patterns."

## Architecture (important)
- **Hub / marketing pages** are React Server Components: `app/page.js` (landing),
  `app/courses/page.js`, `app/about/page.js`, `app/progress/page.js`,
  `app/certificate/`, `app/explained/`.
- **Course lessons** live in big client engines: `public/{app,ba,qa,devfund,
  python,django,fastapi,devops,capstone}.js`. Each course page (`app/courses/<slug>/
  page.js`, "use client") injects its engine script into an empty `#content` div.
  `app.js` = SQL engine.
- **Per-chapter reading pages (SEO)** are server-rendered from committed data:
  `scripts/extract-content.js` runs each engine in a stubbed Node sandbox and writes
  `lib/content/<slug>.json`; `app/courses/<slug>/[chapter]/page.js` (thin, uses shared
  `components/ChapterReading.js`) statically generates one page per chapter + per
  "extra" (interview, cheatsheet). 303 reading pages total.

## Build / validation workflow
- After changing any engine content in `public/*.js`, regenerate the reading data:
  `node scripts/extract-content.js` (all) or `... sql` (one course).
- `npm run build` generates all static pages. **Note:** in the sandbox used this
  session, `next build` times out, so changes were validated with `node --check`
  and `npx esbuild --loader:.js=jsx` (syntax) instead. The user runs the real build.
- CSS is one file: `app/globals.css`.

## What was built this session (all done + validated)
- Landing/SEO foundation: metadataBase, per-page metadata, OpenGraph/Twitter,
  `app/sitemap.js`, `app/robots.js`, `app/manifest.js`, JSON-LD (Organization,
  WebSite, ItemList, per-course Course + BreadcrumbList, FAQPage), dynamic OG image
  `app/opengraph-image.js` (needs build verify — edge/next-og).
- Landing polish: FAQ, closing CTA, hero trust-row, "Who it's for", course-card
  redesign (status dot + practice pill), hover polish.
- **Bug fixed:** course pages hung on the loader because every engine declares the
  same global names; opening a 2nd course in one tab threw a redeclaration error.
  Fixed with a per-tab reload guard (`window.__ccEngine`) in each `app/courses/*/page.js`.
- Cross-course progress dashboard (`components/MyProgress.js`, `/progress`).
- Completion certificates (`/certificate`, client-side print).
- Offline PWA: `public/sw.js` + `components/ServiceWorkerRegistrar.js` (production only).
- Resume-last-chapter: engines persist `<stem>_last` and boot into it.
- Light/dark theme toggle (`components/ThemeToggle.js`) — hub pages dark; course
  shell reset to light. No-flash init script in `app/layout.js`.
- Progress backup/restore + clear (`components/ProgressDataControls.js`).
- **Interview Q&A** tab in all 9 courses (pinned like Cheat sheet): 298 questions
  total (SQL 58, BA 41, Python 40, DevFund 36, QA 35, Django 25, DevOps 23,
  FastAPI 20, Capstone 20), with code + diagrams. Uses `iq()` helper, no graded `q()`,
  so the 469 graded total is unchanged.
- SEO content: crawlable course outlines on `/courses` (`lib/syllabus.js` +
  `components/CourseOutline.js`), canonical URLs on all indexable pages, noindex on
  /progress + /certificate, per-chapter SSR reading pages (see Architecture).
- **`/explained`** plain-English glossary: `lib/explained.js` = 61 terms in 7
  categories, each with a one-liner + analogy + gentle detail + related links; 12 have
  diagrams (`figure` field, rendered via `iq-flow`/`iq-table` CSS). Hub + per-term SSR
  pages + DefinedTerm/Breadcrumb JSON-LD + nav link.
- **"In short" box** at the top of every chapter in every course: shared `inShort(num)`
  helper (in each engine + the extractor) builds a plain summary + example from the
  cheat-sheet data. SQL cheats got ~19 plain one-line `note`s added so SQL boxes lead
  with a definition.

## Plain-language voice standard (SQL — CONFIRMED by user)
The user's wife found SQL harder than GeeksforGeeks. Confirmed voice rules:
1. **State what the command does in the first sentence**, plainly. No literary lead-ins.
2. **Plain standard textbook English** (Indian-learner friendly), not "elegant" English.
   Banned/removed flourishes: "genuinely", "quietly", "neat grid", "boil it down",
   "sweeps down", "worth the stretch", "the honest truth/picture", "hands them back",
   "nothing more mysterious", "kinder to the reader", "folded into one".
3. **Prefer the actual noun** ("the database", the command name) over "it/them/their" —
   but not mechanically every time. e.g. "FROM tells the database which table," not "it".
4. Spell things out: "returns the data in a table of rows and columns, where each row is
   one record and each column holds one type of information."
5. Keep analogies (dhaba/chai are on-brand for the Indian audience) as a bonus AFTER the
   plain explanation, not before the point.

**Status:** SQLingo (all 29 chapters) fully rewritten to this voice + swept clean
("genuinely"/"quietly" = 0). The other 8 courses were reviewed and already lead with the
point (written later in a plainer voice), so they were left as-is to avoid making good
content blander. Any specific chapter can be spot-fixed on request.

Also applies to `/explained`: beginner-first — never explain an unknown term with more
unknown jargon; define or link instead. (The API entry was rewritten to meet this.)

## Added in later sessions (recap)
- **/explained** glossary: 61 plain-English terms, 12 with diagrams (`lib/explained.js`).
- **/sql-reference**: complete SQL reference, 59 entries in 10 categories
  (`lib/sql-reference.js`), hub + per-topic SSR pages, in nav ("SQL Ref") + sitemap.
- **Plain-language pass:** all SQLingo prose rewritten to the confirmed voice; every
  chapter (all courses) opens with an auto-generated "In short" box (`inShort()` in
  each engine + extractor, fed by CHEATS).
- **First depth chapter:** SQL 12b "SELF & CROSS JOIN" (3 graded COUNT questions).
- **Counts now:** SQL 30 chapters / 118 questions; site 286 chapters / 472 questions.
  These live in `lib/courses.js` and the landing `STATS` in `app/page.js` — keep in
  sync when adding chapters (recipe is in PROJECT_ANALYSIS.md section 3e).

## Current state / what's next
Remaining SQL depth chapters (guided, runnable): constraints deep-dive (use a scratch
table like ch17's `demo`), function catalogs, deeper normalization, keys/ER. Recipe
for adding a chapter is in PROJECT_ANALYSIS.md. Everything else below still applies.
- Awaiting the wife's feedback on the rewritten SQL course; fix whatever she flags.
- If she approves, the same flourish-sweep + noun-preference can be applied to any other
  course on request.
- Deferred (needs a backend, against the no-signup ethos for now): cross-device progress
  sync. Middle path already shipped = backup/restore file. Advised against Google AdSense
  (hurts Core Web Vitals + brand); suggested donations/sponsors instead.
- After deploy: submit `https://careerladder.io/sitemap.xml` to Google Search Console.

## How to resume in a new chat
Open the `sqlingo-next` folder, then: "Read PROJECT_ANALYSIS.md and SESSION_SUMMARY.md,
then continue." That restores full context in a clean window.
