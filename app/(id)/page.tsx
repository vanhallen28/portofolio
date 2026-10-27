import { HomePage } from "@/components/site/HomePage";
import { getPublicContent } from "@/lib/content/get";
import { homeMetadata, personJsonLd } from "@/lib/seo";

export const generateMetadata = () => homeMetadata("id");

export default async function Page() {
  const [content, jsonLd] = await Promise.all([getPublicContent(), personJsonLd("id")]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <HomePage content={content} lang="id" />
    </>
  );
}
