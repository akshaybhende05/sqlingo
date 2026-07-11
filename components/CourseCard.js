import Link from "next/link";

const STATUS = {
  available: { cls: "is-available", label: "Available now" },
  "in-progress": { cls: "is-soon", label: "In progress" },
  "coming-soon": { cls: "is-soon", label: "Coming soon" },
  planned: { cls: "is-planned", label: "Planned" },
};

const PRACTICE_BADGES = {
  "live-code": { cls: "practice-badge-live", label: "Live code", title: "Runs a real interpreter or database in your browser; every exercise is auto-graded against real output." },
  guided: { cls: "practice-badge-guided", label: "Guided practice", title: "Graded multiple-choice plus write-it-yourself exercises you compare against a model answer — no in-browser server/database to run live, so it's checked this way instead." },
  mixed: { cls: "practice-badge-live", label: "Live code + guided", title: "Core business logic runs as real, live, auto-graded Python; framework, container, and deployment decisions are guided design/config practice, since those can't run live in a browser tab." },
};

export default function CourseCard({ course }) {
  const status = STATUS[course.status] || STATUS.planned;
  const practice = PRACTICE_BADGES[course.practiceMode];
  return (
    <div className="course-card">
      <div className="course-card-top">
        <span className={`course-status ${status.cls}`}>
          <span className="course-status-dot" />
          {status.label}
        </span>
        {practice ? (
          <span className={`practice-badge ${practice.cls}`} title={practice.title}>{practice.label}</span>
        ) : null}
      </div>
      <h3>{course.name}</h3>
      <p className="course-tagline">{course.tagline}</p>
      <p className="course-desc">{course.description}</p>
      <div className="course-card-foot">
        {course.chapters ? (
          <p className="course-meta">
            {course.chaptersLive ? `${course.chaptersLive} of ${course.chapters} chapters live` : `${course.chapters} chapters`}
          </p>
        ) : <span />}
        {course.href ? (
          <Link href={course.href} className="course-cta">
            {course.status === "available" ? "Start learning" : "Take a look"}
            <span className="course-cta-arrow" aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className="course-cta course-cta-disabled">Notify me when it&apos;s ready</span>
        )}
      </div>
    </div>
  );
}
