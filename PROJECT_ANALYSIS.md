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

**Partially mitigated this pass:** the landing FAQ adds real server-rendered
body text, and the new `Organization`/`WebSite`/`ItemList`/`Course`/`FAQPage`
JSON-LD gives crawlers accurate structured data for the site and every course.
This meaningfully improves the SEO posture in the interim, but does not replace
server-rendering the actual lesson prose.

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
