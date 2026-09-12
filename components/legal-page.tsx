import { PageHeader } from '@/components/page-header';
import type { LegalPage } from '@/data/legal';

/** Rendu commun des pages legales (confidentialite, conditions). */
export function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <>
      <PageHeader title={page.title} subtitle={page.intro} />
      <div className="container max-w-3xl py-12">
        {page.sections.map((section) => (
          <section key={section.heading} className="mb-9">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            {section.body.map((paragraph, index) => (
              <p key={index} className="mt-3 leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <p className="rounded-2xl border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          {page.pending}
        </p>
      </div>
    </>
  );
}
