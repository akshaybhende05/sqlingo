const title = "QA Track — Software Testing course | CareerLadder";
const description = "A free, hands-on QA course: test design, bug reports, API and SQL-backed testing, automation basics, and more, built the same way as SQLingo.";

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "CareerLadder",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

import CourseSchema from "../../../components/CourseSchema";

export default function QaLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="qa" />
    </>
  );
}
