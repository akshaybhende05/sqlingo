const title = "DevOps — ship it, and keep it running | CareerLadder";
const description = "A free, hands-on DevOps course: Linux basics, Docker and Docker Compose, nginx as a real reverse proxy and load balancer, CI/CD with GitHub Actions, cloud/infrastructure basics, and monitoring, deploying TastyGo for real.";

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

export default function DevOpsLayout({ children }) {
  return (
    <>
      {children}
      <CourseSchema slug="dev-devops" />
    </>
  );
}
