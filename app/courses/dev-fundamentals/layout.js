const title = "Developer Fundamentals — How software actually works | CareerLadder";
const description = "A free, hands-on course on what software is, the SDLC, how the internet works, and the servers, reverse proxies, containers, and serverless concepts that confuse even experienced developers.";

export const metadata = {
  alternates: { canonical: "/courses/dev-fundamentals" },
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

export default function DevFundamentalsLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="dev-fundamentals" />
    </>
  );
}
