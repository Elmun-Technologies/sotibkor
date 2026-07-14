import type { MetadataRoute } from "next";
import { getMessages } from "@/i18n";

const t = getMessages();

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${t.app.name} — ${t.app.tagline}`,
    short_name: t.app.name,
    description: t.app.comingSoonDesc,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0e",
    theme_color: "#0b0b0e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
