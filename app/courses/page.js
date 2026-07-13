import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import CourseCard from "../../components/CourseCard";
import CourseOutline from "../../components/CourseOutline";
import { courses } from "../../lib/courses";

export const metadata = {
  title: "Courses — CareerLadder",
  description: "Nine free, hands-on IT courses: SQL, Business Analyst, QA, and a full six-course Developer track (Fundamentals, Python, Django, FastAPI, DevOps, and a Capstone). Graded practice, no signup.",
  alternates: { canonical: "/courses" },
};

const available = courses.filter((c) => c.status === "available" && c.href);
const totalChapters = available.reduce((a, c) => a + (c.chapters || 0), 0);

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <main className="hub-main">
        <section className="hub-section">
          <div className="eyebrow">All courses</div>
          <h1 className="hub-title">Pick a track, start today</h1>
          <p className="hub-lead">Every course is free, hands-on, and built to the same depth: real practice, not just video watching.</p>
          <div className="course-grid">
            {courses.map((c) => <CourseCard course={c} key={c.slug} />)}
          </div>
        </section>

        <section className="hub-section" style={{ paddingTop: 8 }}>
          <h2 className="section-h">What every course covers</h2>
          <p className="hub-lead" style={{ fontSize: 15 }}>
            {totalChapters} chapters across {available.length} hands-on courses. Expand any course to see its full
            chapter-by-chapter outline.
          </p>
          <div className="outline-list">
            {available.map((c) => <CourseOutline slug={c.slug} key={c.slug} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
