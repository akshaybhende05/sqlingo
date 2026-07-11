import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import CourseCard from "../../components/CourseCard";
import { courses } from "../../lib/courses";

export const metadata = {
  title: "Courses — CareerLadder",
  description: "Nine free, hands-on IT courses: SQL, Business Analyst, QA, and a full six-course Developer track (Fundamentals, Python, Django, FastAPI, DevOps, and a Capstone). Graded practice, no signup.",
};

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
      </main>
      <SiteFooter />
    </>
  );
}
