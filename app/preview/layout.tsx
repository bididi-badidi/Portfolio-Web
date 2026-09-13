import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Portfolio preview · Zi Shen Chan",
  description: "AI, harness engineering, and human-centered software. An interactive portfolio preview.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
