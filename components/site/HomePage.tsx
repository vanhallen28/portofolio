import type { Content, Lang } from "@/lib/content/types";
import { SiteScript } from "@/components/motion/SiteScript";
import { Hero } from "./Hero";
import { About, Contact, Faq, Process, Services, Testimonials } from "./Sections";
import { SiteShell } from "./SiteShell";
import { Works } from "./Works";

export function HomePage({ content, lang }: { content: Content; lang: Lang }) {
  return (
    <SiteShell content={content} lang={lang} idHref="/" enHref="/en" onHome>
      <main id="isi" className="view view-home" data-view="home">
        <Hero content={content} lang={lang} />
        <Works content={content} lang={lang} />
        <Services content={content} lang={lang} />
        <Process content={content} lang={lang} />
        <Testimonials content={content} lang={lang} />
        <About content={content} lang={lang} />
        <Faq content={content} lang={lang} />
        <Contact content={content} lang={lang} />
      </main>
      <SiteScript page="home" />
    </SiteShell>
  );
}
