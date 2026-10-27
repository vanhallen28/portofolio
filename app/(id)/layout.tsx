import "../styles/site.css";
import { baseMetadata, PublicHtml, publicViewport } from "@/lib/layout";

export const metadata = baseMetadata;
export const viewport = publicViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicHtml lang="id">{children}</PublicHtml>;
}
