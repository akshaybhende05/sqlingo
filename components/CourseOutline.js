import Link from "next/link";
import { syllabus } from "../lib/syllabus";
import { courses } from "../lib/courses";

// Server-rendered, crawlable outline of every chapter in a course. Puts real,
// keyword-rich content and internal links into the HTML (content in a collapsed
// <details> is still indexed).
export default function CourseOutline({ slug }) {
  const groups = syllabus[slug];
  const course = courses.find((c) => c.slug === slug);
  if (!groups || !course) return null;
  const total = groups.reduce((a, g) => a + g.chapters.length, 0);

  return (
    <details className="outline">
      <summary>
        <span className="outline-name">{course.name} — {course.tagline}</span>
        <span className="outline-meta">{total} chapters</span>
      </summary>
      <div className="outline-body">
        <p className="outline-desc">{course.description}</p>
        {groups.map((g) => (
          <div className="outline-group" key={g.part}>
            <h4>{g.part}</h4>
            <ul>
              {g.chapters.map((ch) => (
                <li key={ch.n}>
                  <Link href={`${course.href}/${ch.n}`}>{ch.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link href={course.href} className="outline-cta">Start {course.name} →</Link>
      </div>
    </details>
  );
}
