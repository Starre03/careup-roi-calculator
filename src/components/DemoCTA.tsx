import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  besparing: number;
  organisatieNaam: string;
}

/**
 * Lead-conversie CTA — direct na de besparing-kaart.
 * Linkt naar het contact-/demoformulier op careup.online.
 */
export const DemoCTA = ({ besparing, organisatieNaam }: Props) => {
  // careup.online heeft een algemeen contactformulier waar de demo aangevraagd kan worden
  const url = 'https://careup.online/contact';
  const positief = besparing > 0;

  return (
    <div className="rounded border border-careup-200 bg-gradient-to-br from-careup-50 to-white p-5 shadow-soft no-print">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-careup-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-base font-semibold text-careup-900">
            {positief
              ? 'Wil je deze besparing realiseren?'
              : 'Test CareUp 30 dagen vrijblijvend'}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {positief
              ? `${organisatieNaam || 'Jouw organisatie'} kan met CareUp Virtual Learning Lab deze cijfers in de praktijk valideren met een gratis 30-dagen demo. Geen verplichtingen, eigen team, eigen content.`
              : 'Vraag een gratis 30-dagen demo aan en ervaar zelf wat CareUp doet voor je team.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="btn-primary justify-center"
            >
              Plan een demo
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://careup.online"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary justify-center"
            >
              Meer over CareUp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
