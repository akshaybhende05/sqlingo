export default function manifest() {
  return {
    name: "CareerLadder — Free, hands-on IT courses",
    short_name: "CareerLadder",
    description:
      "Learn the skills real IT jobs need, one hands-on course at a time. SQL, Business Analyst, QA, and a full Developer track. Free, no signup.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
