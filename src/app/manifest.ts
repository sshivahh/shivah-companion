import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shivah Companion",
    short_name: "Companion",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f4f7",
    theme_color: "#f2f4f7",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
