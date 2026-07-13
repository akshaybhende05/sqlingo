const title = "FastAPI — build a fast, modern API | CareerLadder";
const description = "A free, hands-on FastAPI course: path operations, Pydantic validation, async basics, dependency injection, auth, CORS, automatic docs, and testing, building TastyGo's API.";

export const metadata = {
  alternates: { canonical: "/courses/dev-fastapi" },
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

export default function FastApiLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="dev-fastapi" />
    </>
  );
}
