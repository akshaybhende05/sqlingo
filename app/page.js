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
      <div className="loader" id="loader">
        <div className="sp"></div>
        <p>Warming up the database...</p>
      </div>
      <aside className="sidebar" id="sidebar">
        <div className="brand">
          <h1>SQL<span>ingo</span></h1>
          <p>SQL explained the way a senior would, over chai.</p>
          <div className="course-prog" id="courseProg"></div>
        </div>
        <nav id="nav"></nav>
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
        <div className="content" id="content"></div>
      </div>
    </>
  );
}
