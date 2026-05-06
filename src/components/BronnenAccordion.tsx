import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface Bron {
  categorie: string;
  bron: string;
}

const BRONNEN: Bron[] = [
  {
    categorie: 'Skillslab-kosten',
    bron:
      'Catharina Ziekenhuis SkillsLab jaarabonnement: €61,50. TMI Academy bijscholing voorbehouden handelingen: €229,95. Branchegemiddelde NL 2025-2026: ~€125/medewerker/jaar voor VVT, €165 voor ziekenhuis.',
  },
  {
    categorie: 'Reiskostenvergoeding',
    bron:
      'CAO-norm 2026: €0,23 per kilometer woon-werk vanaf 10 km enkele reis. Voorbeeld VVT: 4 skillslab/cursus-bezoeken × 65 km retour × €0,23 = €60/medewerker/jaar.',
  },
  {
    categorie: 'Verloren werkdag bij bijscholing',
    bron:
      'Een hele dag externe bijscholing = 8 uur volledig doorbetaald loon waarin de medewerker geen productieve zorg verleent. Dit is vaak vergeten in ROI-berekeningen maar is de grootste indirecte kostenpost.',
  },
  {
    categorie: 'Bijscholingsdagen',
    bron:
      "V&VN richtlijn: VIG'ers en verzorgenden IG dienen elke 3 jaar opnieuw te worden getoetst op voorbehouden handelingen, met jaarlijkse opfrismomenten in de praktijk.",
  },
  {
    categorie: 'Kosten per bijscholingsdag',
    bron:
      'Marktgemiddelde NL 2025: TMI €230 incl. praktijktoets, externe trainer in groepsverband €54-€100/persoon, ROC-cursus €200-€300.',
  },
  {
    categorie: 'Werkgeverskosten per uur',
    bron:
      'CAO VVT 2026: bruto uurloon verpleegkundige niveau 4 €18-€26. Werkgeverslasten ~55% (sociale premies, vakantiegeld, eindejaarsuitkering, ORT-toeslagen). ZZP-inhuur typisch €45-55/uur.',
  },
  {
    categorie: 'Wettelijk scholingsbudget',
    bron: 'CAO VVT artikel 5.3 (2026): 2% van de loonsom verplicht beschikbaar voor scholing en deskundigheidsbevordering.',
  },
  {
    categorie: 'Voltijds uren per jaar',
    bron: '1664 uur (CAO VVT, 36 uur per week × 52 weken minus vakantie en feestdagen).',
  },
  {
    categorie: 'CareUp tarief',
    bron:
      'Individueel maandabo: €12,95/maand. Individueel jaarabo: €129,50/jaar (2 maanden gratis). Zakelijk/instellingstarief volgens volumestaffel 2025 — vaste prijs per band. Bron: careup.online/tarieven.',
  },
  {
    categorie: 'Compliance-kaders',
    bron:
      'IGJ: bewijslast bekwaamheid. BIG-herregistratie: elke 5 jaar. Wkkgz: zorgaanbieder moet kunnen aantonen dat medewerkers bekwaam zijn voor risicovolle handelingen. CareUp levert V&VN-geaccrediteerde toetsen, tentamens en certificaten — accreditatiepunten worden automatisch bijgeschreven in V&VN Kwaliteitsregister.',
  },
  {
    categorie: 'Reducties — onderbouwing',
    bron:
      'CareUp levert V&VN-geaccrediteerde toetsen, tentamens en BIG-punten. Daarmee vervangt het ~70% van skillslab-bezoeken en ~75% van bijscholingsdagen voor zorgsectoren. Periodieke fysieke praktijktoets door beoordelaar blijft vereist voor specifieke risicohandelingen. Voor onderwijs ligt vervanging lager (~15-35%) want studenten moeten skills voor het eerst fysiek leren.',
  },
];

export const BronnenAccordion = () => {
  const [open, setOpen] = useState(false);
  return (
    <section className="group-card no-print">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="font-heading text-lg font-semibold text-careup-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Bronnen &amp; aannames
        </h2>
        <span className="text-sm font-medium text-careup-600">
          {open ? '− verberg' : '+ toon'}
        </span>
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          <p className="rounded bg-careup-50 p-3 text-xs text-careup-800">
            Alle defaults zijn gebaseerd op publieke marktdata 2025-2026. Klik op een categorie
            voor de onderbouwing — zo zie je precies waar de cijfers vandaan komen.
          </p>
          <dl className="space-y-2.5 text-sm">
            {BRONNEN.map((b) => (
              <div
                key={b.categorie}
                className="rounded border border-surface-line bg-surface-alt p-3"
              >
                <dt className="font-semibold text-careup-900">{b.categorie}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-ink-soft">{b.bron}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-ink-muted">
            Werkelijke besparing varieert per organisatie. Validatie aanbevolen via een{' '}
            <a
              href="https://careup.online/contact"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-careup-700 hover:underline"
            >
              gratis 30-dagen demo
            </a>
            .
          </p>
        </div>
      )}
    </section>
  );
};
