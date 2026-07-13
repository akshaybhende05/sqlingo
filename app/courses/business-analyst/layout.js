const title = "BA Track — Business Analyst course | CareerLadder";
const description = "A free, hands-on Business Analyst course: requirements, RACI, root-cause analysis, as-is/to-be, and more, built the same way as SQLingo.";

export const metadata = {
  alternates: { canonical: "/courses/business-analyst" },
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

export default function BaLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="business-analyst" />
    </>
  );
}
