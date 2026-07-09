import "./globals.css";

export const metadata = {
  title: "SQLingo — Learn SQL, properly",
  description: "An interactive SQL handbook with a real in-browser database.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
