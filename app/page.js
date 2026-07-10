"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined" || window.__sqlingoBooted) return;
    window.__sqlingoBooted = true;
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "/app.js";
      document.body.appendChild(s2);
    };
    document.body.appendChild(s1);
  }, []);

  return (
    <>
      <a href="#content" className="skip-link">Skip to content</a>
      <div className="loader" id="loader">
        <div className="sp"></div>
        <p>Warming up the database...</p>
      </div>
      <aside className="sidebar" id="sidebar">
        <div className="brand">
          <h1>SQL<span>ingo</span></h1>
          <p>SQL explained the way a senior would, over chai.</p>
          <div className="course-prog">
            <div className="course-prog-label" id="courseProg"></div>
            <div className="course-prog-bar"><div className="course-prog-fill" id="courseProgFill" style={{ width: "0%" }}></div></div>
            <button type="button" className="course-prog-reset" onClick={() => window.resetProgress && window.resetProgress()}>Reset progress</button>
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
            <span className="ch">≡</span> Cheat sheet
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
    </>
  );
}
