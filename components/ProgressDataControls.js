"use client";
import { useEffect, useRef, useState } from "react";
import { courses } from "../lib/courses";

const TRACKED = courses.filter((c) => c.progressKey);
const NAME_KEY = "cc_learner_name";

// Keys we own and are willing to back up / restore. Keeps restore from writing
// arbitrary localStorage from an untrusted file.
function ownedKeys() {
  const keys = new Set([NAME_KEY]);
  TRACKED.forEach((c) => {
    keys.add(c.progressKey);
    keys.add(c.progressKey.replace("_progress", "_celebrated"));
  });
  return keys;
}

export default function ProgressDataControls() {
  const [hasData, setHasData] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const any = TRACKED.some((c) => localStorage.getItem(c.progressKey)) || localStorage.getItem(NAME_KEY);
    setHasData(!!any);
  }, []);

  function backup() {
    const data = {};
    ownedKeys().forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    });
    const payload = { app: "careerladder", version: 1, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `careerladder-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded. Keep the file somewhere safe.");
  }

  function onRestoreFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = parsed && parsed.data;
        if (!data || typeof data !== "object") throw new Error("bad file");
        if (!window.confirm("Restore this backup? It replaces the progress currently in this browser.")) return;
        const allowed = ownedKeys();
        let restored = 0;
        Object.keys(data).forEach((k) => {
          if (allowed.has(k) && typeof data[k] === "string") {
            localStorage.setItem(k, data[k]);
            restored++;
          }
        });
        if (restored === 0) throw new Error("nothing to restore");
        window.location.reload();
      } catch (_) {
        setMsg("That doesn't look like a CareerLadder backup file.");
      }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (!window.confirm("Clear all saved progress and your name from this browser? This can't be undone.")) return;
    try {
      ownedKeys().forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    window.location.reload();
  }

  return (
    <div className="data-controls">
      <div className="data-controls-row">
        {hasData && (
          <button type="button" className="btn-secondary" onClick={backup}>Back up my progress</button>
        )}
        <button type="button" className="btn-secondary" onClick={() => fileRef.current && fileRef.current.click()}>
          Restore from backup
        </button>
        {hasData && (
          <button type="button" className="btn-secondary data-clear" onClick={clearAll}>Clear all my progress</button>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onRestoreFile} style={{ display: "none" }} />
      </div>
      {msg && <p className="data-controls-msg">{msg}</p>}
    </div>
  );
}
