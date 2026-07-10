import "./globals.css";

const title = "CareerLadder — Free, hands-on IT courses";
const description = "Learn the skills real IT jobs need, one hands-on course at a time. SQL today, Business Analysis and more on the way. Free, no signup.";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
