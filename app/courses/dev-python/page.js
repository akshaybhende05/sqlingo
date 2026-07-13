"use client";
import { useEffect } from "react";

export default function PythonCourse() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Course engines share one global script scope and each declares the same top-level
    // names (manifest, lessons, order, go, ...). If a different course engine is already
    // loaded in this tab (e.g. via the Back button, then opening another course), loading
    // this one throws a redeclaration error and the page hangs on the loader. Reload once
    // so this engine boots into a clean scope.
    if (window.__ccEngine && window.__ccEngine !== "python") { window.location.reload(); return; }
    window.__ccEngine = "python";
    if (window.__pythonBooted) {
      // Returning to this route via client-side navigation: the engine script (and the
      // Pyodide runtime it loaded) is already alive in this tab, it just needs to
      // re-render into the freshly mounted DOM, not reload the Python engine itself.
      window.__pythonReinit && window.__pythonReinit();
      return;
    }
    window.__pythonBooted = true;
    const s = document.createElement("script");
    s.src = "/python.js";
    document.body.appendChild(s);
  }, []);

  return (
    <>
      <a href="#content" className="skip-link">Skip to content</a>
      <div className="loader" id="loader">
        <div className="sp"></div>
        <p>Loading the course... (starting the Python engine, this can take a few seconds the first time)</p>
      </div>
      <div className="course-shell">
        <aside className="sidebar" id="sidebar">
          <div className="brand">
            <a href="/courses" className="back-to-hub">&larr; All courses</a>
            <h1>Dev <span>Python</span></h1>
            <p>Real Python, running live in your browser, building toward Django and FastAPI.</p>
            <div className="course-prog">
              <div className="course-prog-label" id="courseProg"></div>
              <div className="course-prog-bar"><div className="course-prog-fill" id="courseProgFill" style={{ width: "0%" }}></div></div>
              <button type="button" className="course-prog-reset" onClick={() => window.resetProgress && window.resetProgress()}>Reset progress</button>
              <p className="course-prog-note">Saved to this device only.</p>
            </div>
          </div>
          <div className="nav-search-wrap">
            <input
              type="text"
              id="navSearch"
              className="nav-search"
              placeholder="Search chapters..."
              onInput={(e) => window.filterNav && window.filterNav(e.target.value)}
              aria-label="Search chapters"
            />
          </div>
          <div className="nav-pinned">
            <div className="nav-item nav-pinned-item" id="nav-cheatsheet" onClick={() => window.go && window.go("cheatsheet")}>
              <span className="ch">&equiv;</span> Cheat sheet
            </div>
            <div className="nav-item nav-pinned-item" id="nav-interview" onClick={() => window.go && window.go("interview")}>
              <span className="ch">?</span> Interview Q&amp;A
            </div>
          </div>
          <nav id="nav"></nav>
          <div className="nav-empty" id="navEmpty" style={{ display: "none" }}>No chapters match.</div>
        </aside>
        <div className="nav-overlay" id="navOverlay" onClick={() => window.closeMenu && window.closeMenu()}></div>
        <div className="main">
          <div className="topbar">
            <button className="menu-btn" id="menuBtn" onClick={() => window.toggleMenu && window.toggleMenu()} aria-label="Open chapter menu">&#9776;</button>
            <div className="crumb" id="crumb"></div>
            <div className="progress-mini">
              <span className="label" id="progLabel">0 / 5</span>
              <div className="bar"><div className="fill" id="progFill" style={{ width: "0%" }}></div></div>
            </div>
          </div>
          <div className="content" id="content" tabIndex={-1}></div>
        </div>
      </div>
    </>
  );
}
