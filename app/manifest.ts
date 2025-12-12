import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LetterMeet",
    short_name: "LetterMeet",
    description: "LetterMeet helps you send lightweight meet-up requests.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/letter-seal.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
