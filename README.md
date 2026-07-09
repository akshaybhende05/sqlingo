# SQLingo (Next.js)

Interactive SQL handbook. The learning engine (SQLite via sql.js), all 29 chapters,
glossary, query tool and practice checker live in `public/app.js`; the React shell in
`app/page.js` renders the layout and boots the engine.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy to Vercel
```bash
npm i -g vercel    # once
vercel             # from this folder, follow prompts
```
Or push to GitHub and "Import Project" at vercel.com. No env vars, no backend needed.

## How it is structured (Stage 1 migration)
- `app/layout.js`   — html shell + global CSS + metadata
- `app/globals.css` — all styles (the locked v3 design)
- `app/page.js`     — client component: renders the sidebar/topbar/content shell, then loads sql.js and the app engine
- `public/app.js`   — the framework (engine, editor, glossary, practice) + `manifest` + `lessons` objects

## Next refactor step (Stage 2, optional, incremental)
Move each `lessons['NN']` object from `public/app.js` into `lib/lessons/NN.js`,
turn the query editor / result grid / practice / glossary into React components,
and expose one route per chapter (`app/[chapter]/page.js`) for per-chapter URLs and code-splitting.
