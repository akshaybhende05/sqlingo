import { courses } from "../lib/courses";

const BASE_URL = "https://careerladder.io";

export default function sitemap() {
  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/courses`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const courseRoutes = courses
    .filter((c) => c.status === "available" && c.href)
    .map((c) => ({
      url: `${BASE_URL}${c.href}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...staticRoutes, ...courseRoutes];
}
