# CareerLadder / SQLingo — Project Analysis & Improvement Brief

> **Status:** Updated after a second scan on 2026-07-11. The project changed
> substantially between the two scans (the other courses were built out with
> graded assessments, SEO files were added, several quick-win bugs fixed). This
> version reflects the **current** state. Superseded findings are noted so the
> history is clear.
>
> **Repo:** `sqlingo-next` (Next.js 14.2.5, React 18.3.1, no backend)
> **Method:** static analysis of source (landing copy, layout, CSS, every course
> file). The running site at `localhost:3000` could not be reached, so findings
> are from source — authoritative for content/structure, but a live pass is still
> worth doing for visual/UX polish.

---

## 1. Current state (good news first)

The platform is now essentially built out and its landing-page claims check out:

| Landing stat | Claim | Verified actual | Verdict |
|--------------|-------|-----------------|---------|
| chapters across all courses | 285 | 285 (29 + 8×32) | ✅ Accurate |
| graded practice questions | 469 | **469** (see table below) | ✅ Accurate |
| real, hands-on courses | 9 | 9 (all have routes + content + graded practice) | ✅ Accurate |
| signups / paywalls / dark patterns | 0 | 0 | ✅ Accurate |

**Graded questions per course** (counted from `${q...(` render embeds):

| Course | Graded questions | Mechanism |
|--------|:----------------:|-----------|
| SQL (`app.js`) | 115 | live SQLite (`q`/`qm`) |
| BA (`ba.js`) | 91 | MCQ + scenario |
| QA (`qa.js`) | 60 | MCQ + scenario |
| Dev Fundamentals (`devfund.js`) | 39 | MCQ + scenario |
| Python (`python.js`) | 34 | live Pyodide (`qPy`) + MCQ |
| Django (`django.js`) | 33 | MCQ + scenario |
| DevOps (`devops.js`) | 33 | MCQ + scenario |
| FastAPI (`fastapi.js`) | 32 | MCQ + scenario |
| Capstone (`capstone.js`) | 32 | Pyodide + MCQ + scenario |
| **Total** | **469** | |

> **Superseded:** the first version of this brief reported that "only one course
> delivers the hands-on promise" and that "390+/469 graded questions" was
> overstated. Both are now **false** — the non-SQL courses were built out with
> real multiple-choice + scenario assessment engines (`qMC`, `qScenario`, `qPy`),
> and the 469 total is exact. Disregard those earlier findings.

**Quality:** the pedagogy remains strong across courses — analogies, progressive
sections, an interactive glossary, friendly error messages (SQL), live code
execution (SQL via sql.js, Python via Pyodide).

---

## 2. Already fixed since the first scan

- ✅ Stale `"All 115 questions solved"` completion toast now uses dynamic
  `${TOTAL_Q}` (`public/app.js`).
- ✅ `@media (prefers-reduced-motion: reduce)` block added (`app/globals.css`).
- ✅ `app/sitemap.js` and `app/robots.js` added (BASE_URL `https://careerladder.io`).
- ✅ All 9 courses have routes, content files, and graded practice.

## 3. Implemented in this pass (by me)

Prior pass:
- ✅ Added `metadataBase: new URL("https://careerladder.io")` to `app/layout.js`
  (needed to resolve absolute OG/canonical URLs; aligns with sitemap/robots).
- ✅ Refreshed the stale root `description` in `app/layout.js`.
  *(Also briefly changed the "469" stat to "437", then reverted after recounting
  with `capstone.js` — the true total is exactly 469.)*

This pass — SEO structured data, FAQ, manifest, copy:
- ✅ **JSON-LD structured data** on the landing page (`app/page.js`): an
  `@graph` with `Organization`, `WebSite`, an `ItemList` of all courses (each as
  a free `Course`), and a `FAQPage`. This is the biggest SEO win available
  without the full content-SSR refactor — search engines now get rich, accurate
  course + FAQ data server-side.
- ✅ **Per-course `Course` schema** via a new server component
  `components/CourseSchema.js`, wired into all 9 `app/courses/*/layout.js` files.
  Each course page now emits server-rendered structured data (name, description,
  free offer, chapter count) even though the lesson body is still client-injected.
- ✅ **FAQ section** on the landing page — 6 genuinely useful, accurate Q&As
  (free, no install, no prerequisites, how grading works, progress is
  per-device, where to start). Doubles as real server-rendered content and backs
  the `FAQPage` schema. Uses native `<details>` (accessible, no JS).
- ✅ **Closing CTA band** on the landing page.
- ✅ **Web app manifest** (`app/manifest.js`) — name, theme color `#0f766e`
  (matches `--teal`), icon, standalone display. Enables install/PWA basics.
- ✅ Fixed stale `/courses` page metadata description (said courses were "on the
  way"; now describes the 9 live courses).
- ✅ Added supporting CSS for the FAQ accordion and CTA band (`app/globals.css`).

Bug fix — course pages stuck on the loading spinner:
- 🐞 **Root cause:** every course engine (`public/{app,ba,qa,...}.js`) loads as a
  plain `<script>` into one shared global scope, and each declares the *same*
  top-level `const`/`let` names — `manifest`, `lessons`, `order`, `answers`,
  `qCount`, `curCh`, etc. Opening one course, then opening a *different* course
  in the same tab (via the browser Back button or client-side navigation), makes
  the second engine hit `const manifest`/`const lessons` **already declared** →
  the browser throws a redeclaration `SyntaxError`, the whole second script
  aborts, so it never hides the loader. The page hangs on the spinner. (The
  first course loaded in a fresh tab always works, which is why it looked
  intermittent.) Not caused by the SEO/landing changes — it surfaced once the
  catalog grew past one course.
- ✅ **Fix:** added a clean-scope guard to all 9 `app/courses/*/page.js`. Each
  records the active engine on `window.__ccEngine`; if a *different* engine is
  already alive in the tab, it does one `window.location.reload()` so the new
  engine boots into a fresh global scope. Switching courses now costs a single
  quick reload instead of hanging; navigation *within* a course is unchanged and
  still instant.
- 🔭 **Cleaner follow-up (optional):** isolate each engine (wrap in an IIFE and
  attach its handler functions to `window`, or convert to ES modules) to remove
  the reload entirely. Larger change; deferred.

**Validation:** all changed files pass a JSX/JS syntax check (esbuild, 0 errors).
A full `next build` could not complete inside the environment's 45s-per-command
limit (it compiled without errors but didn't finish) — **worth running
`npm run build` once locally to confirm** before deploying.

---

## 3b. New features built (phased plan)

All client-side, no backend — consistent with the free / no-signup model. Each
phase was syntax-validated (esbuild, 0 errors); a real-browser pass is still
worth doing.

- ✅ **Phase 1 — Cross-course progress dashboard.** Added `questions` +
  `progressKey` to every course in `lib/courses.js` (totals sum to 469, matching
  the landing stat). New `components/MyProgress.js` reads each course's
  `localStorage` progress, computes solved/total + %, and renders per-course bars
  with Resume/Review links. Shown on the landing page ("Pick up where you left
  off", appears only once a learner has started something) and on a new
  `/progress` page (full view + a "Progress" nav link).
- ✅ **Phase 2 — Completion certificates.** New `/certificate` page detects
  completed courses, takes the learner's name (saved locally), and renders a
  printable certificate (Print / Save as PDF via the browser). Honest by design:
  a decorative reference code, and a note that completion is tracked in the
  learner's browser (no server verification).
- ✅ **Phase 3 — Offline PWA.** `public/sw.js` service worker: network-first for
  navigations (new deploys always win), stale-while-revalidate for engine
  scripts + CDN runtimes (sql.js, Pyodide, fonts), so a course opened once keeps
  working offline. Registered by `components/ServiceWorkerRegistrar.js`,
  **production only** (never interferes with dev/HMR). Bump `VERSION` in `sw.js`
  to invalidate caches on deploy.
- ✅ **Phase 4 — data controls + backup/restore.** `/progress` gets "Back up my
  progress" (downloads a JSON file of all progress + name), "Restore from backup"
  (file input, validates + only writes app-owned keys), and "Clear all my
  progress". This is the no-account answer to cross-device / don't-lose-my-work.
- ✅ **Resume-last-chapter.** All 9 engines now persist the current chapter to
  `<stem>_last` in `go()` and boot into it (falling back to `'00'` if missing or
  no longer a valid chapter). So "Resume" on the dashboard reopens where you
  actually stopped. Works with the per-tab reload guard (each course boots fresh
  and resumes its own last chapter).
- ✅ **Light/dark theme toggle.** Dark theme for the hub/marketing pages via
  `html[data-theme="dark"]` CSS-variable overrides; the in-course reading and
  practice experience is explicitly reset to its designed light palette inside
  `.course-shell`/`.loader` (the course UI has ~19 hardcoded light colors, so
  theming it fully was intentionally out of scope). Toggle lives in the hub
  header (`components/ThemeToggle.js`); a small inline script in the root layout
  sets the theme before paint (no flash) and respects the OS preference on first
  visit. Choice persists in `localStorage` (`cc_theme`).

- ✅ **Interview Q&A tab.** A pinned "Interview Q&A" item in the course sidebar
  next to the Cheat sheet: `iq()` helper + `renderInterview()` + a pinned
  `lessons['interview']` in the engine, plus a nav pin in the course `page.js`.
  Click-to-expand accordion, Beginner / Intermediate / Advanced, with code blocks
  and figures. No graded questions, so the 469 total is unchanged. Shared styles
  (`.iq`, `.iq-flow`, `.iq-table`) live in `globals.css`.
  - **SQL** (`public/app.js`) — **deep: 58 Qs across 15 topics** (fundamentals,
    filtering, aggregation, joins, set ops, subqueries/CTEs, window functions,
    modifying data, keys/constraints, views/indexes, transactions, performance,
    design, query puzzles); JOIN Venn + execution-order figure + isolation table.
    This is the depth standard for the rest.
  - **Python** (`public/python.js`) — **deep: 40 Qs** across core types, functions
    & scope, iteration/comprehensions, OOP, errors/context managers, execution &
    memory, concurrency (GIL), and performance/idioms; LEGB figure + Big-O table.
  - **BA** (`public/ba.js`) — **deep: 41 Qs** across role/fundamentals,
    elicitation, stakeholders, documentation & modelling, prioritisation & scope,
    methodologies, analysis techniques, and delivery/behavioural; RACI table +
    as-is/to-be figure.
  - **QA** (`public/qa.js`) — **deep: 35 Qs** across fundamentals, test levels &
    types, design techniques, defect management, automation, and process/metrics;
    test-pyramid figure + severity-vs-priority table.
  - **Dev Fundamentals** (`public/devfund.js`) — **deep: 36 Qs** across software/
    SDLC, Git, how-the-web-works, servers/infra, containers/deployment, and core
    concepts; URL-request flow, Git-areas flow, HTTP status table, VM-vs-container
    table.
  - **Django** (`public/django.js`) — 25 Qs; request-lifecycle flow.
  - **FastAPI** (`public/fastapi.js`) — 20 Qs; request/validation flow.
  - **DevOps** (`public/devops.js`) — 23 Qs; CI/CD pipeline flow + deployment-
    strategy table.
  - **Capstone** (`public/capstone.js`) — 20 Qs; system-design / project-
    walkthrough + architecture flow.

  **Complete across all 9 courses — 298 interview questions total** (SQL 58,
  BA 41, Python 40, Dev Fundamentals 36, QA 35, Django 25, DevOps 23, FastAPI 20,
  Capstone 20). None affect the 469 graded total (they use `iq()`, not `q()`).
  All engines parse, all 9 pages compile, CSS balanced, 9 nav pins in place.

## Progress sections — verified

Automated cross-check (engine vs `lib/courses.js`) confirms all 9 courses agree
on both the graded-question total and the `localStorage` progress key:

| | declared | engine | key |
|---|---|---|---|
| sql | 115 | 115 | sqlingo_progress ✓ |
| business-analyst | 91 | 91 | ba_progress ✓ |
| qa | 60 | 60 | qa_progress ✓ |
| dev-fundamentals | 39 | 39 | devfund_progress ✓ |
| dev-python | 34 | 34 | python_progress ✓ |
| dev-django | 33 | 33 | django_progress ✓ |
| dev-fastapi | 32 | 32 | fastapi_progress ✓ |
| dev-devops | 33 | 33 | devops_progress ✓ |
| dev-capstone | 32 | 32 | capstone_progress ✓ |

Totals sum to 469 (matches the landing stat). The dashboard, per-course bars,
certificate completion detection, and backup/restore all read these keys with
matching count semantics (engine writes `PROG[ch][id]=true`; the dashboard sums
the same). The new Interview Q&A tabs use `iq()`, not the graded `q()` helpers,
so they add 0 to the totals. Interview content verified not to change any count.

Landing polish:
- ✅ Hero trust-row (real SQL & Python in-browser · no signup · works offline).
- ✅ New "Who it's for" section (career switchers / students / upskillers).
- ✅ Course-card header redesign (status dot + single practice pill) and
  consistent hover lift across landing cards.

## 4. Remaining real gaps (ranked)

### 4.1 Lesson content is still not server-rendered — HIGH (biggest open issue)
Every course page renders an **empty** `<div id="content">` (e.g.
`app/courses/sql/page.js:72`, `app/courses/qa/page.js:67`) and fills it with
client-side JS. The new `sitemap.js`/`robots.js` tell crawlers the course URLs
*exist*, but a crawler that visits those URLs still sees a near-empty page — the
actual lesson text isn't in the HTML. So SEO is currently **half-wired**:
discoverable routes, non-indexable content.

To finish the SEO story, the chapter content needs to be server-rendered or
statically generated. This is the README's "Stage 2" refactor (move
`lessons['NN']` into `lib/lessons/`, componentize, one route per chapter). It is
the highest-value remaining work but also the largest — best done deliberately,
not blind, so it is **deferred**.

**Mitigated further (SEO pass):**
- **Crawlable course outlines** — `lib/syllabus.js` (auto-extracted chapter
  lists, 285 chapters) + `components/CourseOutline.js` render every course's full
  chapter-by-chapter outline as real, indexable text with internal links on
  `/courses` (in `<details>`, which Google still indexes). Course descriptions +
  285 chapter titles are now in the server HTML.
- **Canonical URLs** on all 14 indexable pages (landing, /courses, /about, and
  all 9 course pages via their layouts).
- **noindex** on `/progress` and `/certificate` (per-user utility pages) to focus
  crawl budget; both excluded from the sitemap.
- **BreadcrumbList JSON-LD** added per course (Home › Courses › Course), on top of
  the existing Organization/WebSite/ItemList/Course/FAQPage schema.
- **Sitemap** now sends `lastModified` and includes /about.

**Per-chapter SSR — SQL proof of concept (built, needs `npm run build` to confirm):**
- `scripts/extract-content.js` runs a course engine in a stubbed Node sandbox and
  emits static per-chapter HTML. `node scripts/extract-content.js sql` produced
  `lib/content/sql.json` (29 chapters, full prose). Re-run when content changes.
- `app/courses/sql/[chapter]/page.js` — server component with
  `generateStaticParams` (29 static pages), per-chapter `generateMetadata`
  (title, description from the lead, canonical), `LearningResource` +
  `BreadcrumbList` JSON-LD, breadcrumb, prev/next, and a full chapter index for
  internal linking. Interactive-only controls are hidden via CSS (`.reading-content`);
  example queries stay visible. A banner links to the interactive course.
- `/courses` outline now links SQL chapters to their reading pages; the sitemap
  includes all 29 chapter URLs.
- **Verify:** run `npm run build` — it should statically generate
  `/courses/sql/00 … /26`. Once confirmed, roll out to the other 8 courses by
  running the extractor for each and generalizing the route to
  `app/courses/[course]/[chapter]` (or one route per course).

**Rolled out to all 9 courses (285 reading pages).** After the SQL build was
confirmed working:
- `node scripts/extract-content.js` (all courses) generates `lib/content/*.json`
  for every course (285 chapters, ~1.5 MB total, committed).
- Shared `components/ChapterReading.js` renders each reading page (breadcrumb,
  banner to the interactive course, content, prev/next, chapter index, JSON-LD).
- Each course has a thin `app/courses/<slug>/[chapter]/page.js` (9 total) with
  `generateStaticParams` + `generateMetadata` → **285 statically generated,
  individually indexable chapter pages** with unique titles/descriptions and
  canonicals.
- `/courses` outline links every chapter to its reading page; the sitemap lists
  all 285 chapter URLs.
- All routes/components pass syntax validation; SQL build already confirmed by
  the user. Re-run `npm run build` to generate the full set across all courses.

**Extended: Interview Q&A + Cheat sheet as indexable pages, and OG image.**
- The extractor now also captures each course's pinned `interview` and
  `cheatsheet` lessons into an `extras` array. The existing `[chapter]` route
  generates them too (`/courses/<slug>/interview`, `/courses/<slug>/cheatsheet`),
  so **18 more indexable pages** (9 interview banks, 9 cheat sheets) — the
  interview pages are keyword-gold ("SQL interview questions", etc.).
  `ChapterReading` links them in a "Reference & practice" section and keeps them
  out of the chapter pager/index. Total server-rendered reading pages: **303**
  (285 chapters + 18 extras). Sitemap includes all of them.
- `app/opengraph-image.js` — a branded dynamic OG social card (`next/og`,
  1200×630) for the whole site, so shared links show a real card instead of
  text. **Needs `npm run build` to confirm** (edge runtime / `next/og`); if it
  errors on build it can be removed without affecting anything else.

Prior note — the biggest open lever was server-rendering each chapter's
*body* (lesson prose + interview Q&A) into its own URL. The content lives in
the client engines (`public/*.js`) and rendering it server-side with per-chapter
routes is a real refactor that needs a running build to verify safely — best done
as a dedicated, runtime-verified effort. Approach: a prebuild step executes the
engines in a stubbed Node sandbox to emit static per-chapter HTML (committed as
data), which new `app/courses/[course]/[chapter]/page.js` routes render as
reading pages that link into the interactive app. The outline/data work this pass
(`lib/syllabus.js`) is the first building block of that.

### 4.2 Progress is `localStorage`-only, per-course — MEDIUM
Each course stores progress under its own key (`sqlingo_progress`, `qa_progress`,
`ba_progress`, … plus `*_celebrated`). Fits the no-signup ethos, but "track real
progress" breaks on browser-clear or device-switch, and there's no single
cross-course view. Consider an export/import ("resume code") or an opt-in sync.

### 4.3 Analytics is inconsistent — LOW
Only `app.js` and `ba.js` contain analytics; the other 7 course files have none.
Either add it everywhere or (better) centralize it out of the content files into
the layout/a shared module so coverage can't drift.

### 4.4 Architecture / maintainability — MEDIUM (root cause)
Courses are still 1,000–1,800-line monolith files mixing engine + content
(+ analytics in two). This is what let the courses drift in the first place and
what makes 4.1 harder. Same fix as the README's Stage 2.

---

## 5. Landing page notes

Copy and structure are strong and now accurate. Two suggestions remain
(both from the first scan, still valid):

1. **Show, don't tell.** The hero (`components/HeroVisual.js`) is decorative. The
   most persuasive asset — a real DB/Python running in the browser — isn't shown
   on the page selling it. A live mini-editor or a short screenshot/GIF would
   convert better.
2. **Signal course *type* on cards** if the interaction differs (live-code vs
   MCQ/scenario). `CourseCard` already supports badges; a "live code" vs
   "quiz-based" hint sets expectations before the click.

---

## 6. Recommended priority order

1. **P1 — Server-render chapter content** (finish SEO; enables §4.1, unblocks growth).
2. **P2 — Progress portability** (export/import or opt-in sync).
3. **P3 — Centralize + complete analytics.**
4. **P4 — Hero visual proof + course-type badges.**
5. **P5 — Stage 2 architecture refactor** (content → `lib/`, componentize) —
   underpins P1 and long-term maintainability.

---

## 7. Key files

| Concern | File(s) |
|---------|---------|
| Landing page + stats | `app/page.js` |
| Site metadata (metadataBase, OG) | `app/layout.js` |
| SEO | `app/sitemap.js`, `app/robots.js` |
| Course registry | `lib/courses.js` |
| Course card / hero | `components/CourseCard.js`, `components/HeroVisual.js` |
| Styles / responsive / a11y | `app/globals.css` |
| Course engines + content | `public/{app,ba,qa,devfund,python,django,fastapi,devops,capstone}.js` |
| Course page shells (empty content div) | `app/courses/*/page.js` |
