import "../styles/site.css";
import "./admin.css";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin portofolio" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F6F6F4" };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fontVariables} adm-html`}>
      <body className="adm-body">{children}</body>
    </html>
  );
}
