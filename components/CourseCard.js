import Link from "next/link";

const BADGES = {
  available: { cls: "badge-live", label: "Available now" },
  "in-progress": { cls: "badge-soon", label: "In progress" },
  "coming-soon": { cls: "badge-soon", label: "Coming soon" },
  planned: { cls: "badge-planned", label: "Planned" },
};

export default function CourseCard({ course }) {
  const badge = BADGES[course.status] || BADGES.planned;
  return (
    <div className="course-card">
      <span className={`course-badge ${badge.cls}`}>{badge.label}</span>
      <h3>{course.name}</h3>
      <p className="course-tagline">{course.tagline}</p>
      <p className="course-desc">{course.description}</p>
      {course.chapters ? (
        <p className="course-meta">
          {course.chaptersLive ? `${course.chaptersLive} of ${course.chapters} chapters live` : `${course.chapters} chapters`}
        </p>
      ) : null}
      {course.href ? (
        <Link href={course.href} className="course-cta">
          {course.status === "available" ? "Start learning →" : "Take a look →"}
        </Link>
      ) : (
        <span className="course-cta course-cta-disabled">Notify me when it's ready</span>
      )}
    </div>
  );
}
