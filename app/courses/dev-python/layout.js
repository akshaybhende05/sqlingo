const title = "Python — real, live code in your browser | CareerLadder";
const description = "A free, hands-on Python course that runs real Python directly in your browser. Variables to OOP, JSON, and testing, building toward Django and FastAPI.";

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

export default function PythonLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="dev-python" />
    </>
  );
}
