import { courses } from "../lib/courses";
import sql from "../lib/content/sql.json";
import ba from "../lib/content/business-analyst.json";
import qa from "../lib/content/qa.json";
import devfund from "../lib/content/dev-fundamentals.json";
import python from "../lib/content/dev-python.json";
import django from "../lib/content/dev-django.json";
import fastapi from "../lib/content/dev-fastapi.json";
import devops from "../lib/content/dev-devops.json";
import capstone from "../lib/content/dev-capstone.json";

const BASE_URL = "https://careerladder.io";

const CONTENT = {
  sql, "business-analyst": ba, qa, "dev-fundamentals": devfund,
  "dev-python": python, "dev-django": django, "dev-fastapi": fastapi,
  "dev-devops": devops, "dev-capstone": capstone,
};

export default function sitemap() {
  const now = new Date();
  const staticRoutes = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/courses`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const available = courses.filter((c) => c.status === "available" && c.href);

  const courseRoutes = available.map((c) => ({
    url: `${BASE_URL}${c.href}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Every server-rendered per-chapter reading page.
  const chapterRoutes = available.flatMap((c) => {
    const data = CONTENT[c.slug];
    if (!data) return [];
    const entries = [...data.chapters, ...(data.extras || [])];
    return entries.map((ch) => ({
      url: `${BASE_URL}${c.href}/${ch.n}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  });

  // Note: /progress and /certificate are intentionally excluded — they are
  // per-user utility pages marked noindex.
  return [...staticRoutes, ...courseRoutes, ...chapterRoutes];
}
