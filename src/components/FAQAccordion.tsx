import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface QA {
  vraag: string;
  antwoord: string;
}

const FAQ: QA[] = [
  {
    vraag: 'Vervangt CareUp echt onze fysieke skillslab volledig?',
    antwoord:
      'Ja — CareUp levert V&VN-geaccrediteerde toetsen, tentamens en alle BIG-herregistratiepunten. Medewerkers oefenen voorbehouden handelingen in 3D-simulatie en behalen hun accreditatiepunten volledig digitaal. Daarmee kun je het fysieke skillslab-abonnement opzeggen en externe bijscholingsdagen schrappen.',
  },
  {
    vraag: 'Hoe zit het met BIG-herregistratie en accreditatiepunten?',
    antwoord:
      'CareUp is V&VN-geaccrediteerd. Alle behaalde punten worden automatisch bijgeschreven in het V&VN Kwaliteitsregister. Medewerkers zien realtime hun status, certificaten en herregistratie-deadlines (verplicht elke 5 jaar voor BIG). Geen losse administratie, geen losse cursusbewijzen — alles centraal.',
  },
  {
    vraag: 'Kunnen we IGJ-toezicht aantonen met CareUp?',
    antwoord:
      'Volledig. IGJ verwacht bewijslast van bekwaamheid voor risicovolle handelingen (Wkkgz). CareUp levert per medewerker: toetsresultaten, behaalde accreditatiepunten, bekwaamheidsverklaringen en activiteitenlogs. Alles direct exporteerbaar als PDF voor inspectie of audit.',
  },
  {
    vraag: 'Hoe lang duurt implementatie?',
    antwoord:
      'Snel: een paar dagen tot een paar weken afhankelijk van organisatie-grootte. CareUp werkt browser-based, geen installaties. Onboarding van medewerkers gebeurt via een eigen organisatie-omgeving. Je kunt 30 dagen vrijblijvend testen — zonder verplichtingen.',
  },
  {
    vraag: 'Wat als onze medewerkers niet handig zijn met techniek?',
    antwoord:
      'CareUp is gebouwd voor zorgprofessionals — niet voor IT-experts. De interface is in het Nederlands, de simulaties zijn intuïtief (zoals een spel), en er is uitgebreide ondersteuning. In de praktijk gaan ervaren medewerkers én jonge collega\'s er even goed mee om.',
  },
  {
    vraag: 'Hoe weten we dat de cijfers in deze calculator kloppen?',
    antwoord:
      'Alle defaults komen uit publieke marktdata 2025-2026: CAO VVT, V&VN-richtlijnen, TMI Academy, ROC-tarieven, Catharina Ziekenhuis. Klik op "Bronnen & aannames" hieronder voor de complete onderbouwing per regel. Voor zekerheid valideer je het beste met je eigen cijfers — of vraag een gratis 30-dagen demo aan om met je eigen team te testen.',
  },
  {
    vraag: 'Geldt CareUp ook voor specialistische afdelingen (OK, IC, SEH)?',
    antwoord:
      'Ja, met die kanttekening dat hoogcomplexe handelingen (bv. arteriële lijn, beademing) vaak een eigen praktijk-component houden in het ziekenhuis zelf. Voor algemene voorbehouden handelingen (injecties, katheterisatie, wondzorg) dekt CareUp het volledige bekwaamheidstraject. De Ziekenhuis-preset rekent daarom met iets lagere reducties (80%) dan VVT (85%).',
  },
];

export const FAQAccordion = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="group-card no-print">
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="font-heading text-lg font-semibold text-careup-900 flex items-center gap-2">
          <HelpCircle className="h-4 w-4" /> Veelgestelde vragen
        </h2>
        <span className="text-sm font-medium text-careup-600">
          {showAll ? '− verberg' : '+ toon'}
        </span>
      </button>
      {showAll && (
        <div className="mt-4 space-y-2">
          {FAQ.map((qa, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded border border-surface-line bg-surface-alt"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left"
                >
                  <span className="text-sm font-semibold text-careup-900">{qa.vraag}</span>
                  <ChevronDown
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 text-careup-600 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-surface-line px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
                    {qa.antwoord}
                  </div>
                )}
              </div>
            );
          })}
          <p className="pt-2 text-xs text-ink-muted">
            Andere vraag?{' '}
            <a
              href="https://careup.online/organisatie-demo/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-careup-700 hover:underline"
            >
              Plan een gesprek
            </a>{' '}
            — of test 30 dagen vrijblijvend.
          </p>
        </div>
      )}
    </section>
  );
};
