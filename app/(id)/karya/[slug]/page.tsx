import { CaseRoute, caseParams } from "@/lib/case-route";
import { caseMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = caseParams;

export async function generateMetadata({ params }: Props) {
  return caseMetadata((await params).slug, "id");
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CaseRoute slug={slug} lang="id" />;
}
