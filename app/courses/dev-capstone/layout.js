const title = "Capstone Project — build TastyGo's backend | CareerLadder";
const description = "The final Developer course: design an API surface, write and test real Python business logic live in your browser, wire it into Django or FastAPI, containerize it with Docker, and plan its deployment, monitoring, and security — one real, connected portfolio project.";

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

export default function CapstoneLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="dev-capstone" />
    </>
  );
}
