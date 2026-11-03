import "../styles/site.css";
import { getPublicContent } from "@/lib/content/get";
import { baseMetadata, PublicHtml, publicViewport } from "@/lib/layout";

export const metadata = baseMetadata;
export const viewport = publicViewport;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { settings } = await getPublicContent();
  return <PublicHtml lang="id" ads={settings.ads}>{children}</PublicHtml>;
}
