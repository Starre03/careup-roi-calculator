import type { CalculatorInputs } from './calculations';

export type BranchePreset = Pick<
  CalculatorInputs,
  | 'skillslabPerMedewerker'
  | 'verlorenUren'
  | 'uurtarief'
  | 'bijscholingsdagen'
  | 'kostenPerBijscholingsdag'
  | 'urenPerBijscholingsdag'
  | 'reiskostenPerMedewerker'
>;

/**
 * Branchespecifieke defaults voor zorgsectoren in NL 2025-2026.
 * Bronnen: CAO VVT 2026, TMI Academy, V&VN, marktbenchmarks.
 *
 * Reiskosten zijn gebaseerd op CAO-vergoeding €0,23/km × geschat aantal
 * skillslab/cursus-bezoeken per jaar × gemiddelde retour-afstand.
 */
export const BRANCHE_PRESETS: Record<string, BranchePreset> = {
  VVT: {
    // Verspreide thuiszorg-locaties → veel reizen
    skillslabPerMedewerker: 125,
    verlorenUren: 3,
    uurtarief: 32,
    bijscholingsdagen: 1,
    kostenPerBijscholingsdag: 195,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 60,
  },
  Ziekenhuis: {
    // Intern lab → minder reizen, maar duurder personeel + meer dagen bijscholing
    skillslabPerMedewerker: 165,
    verlorenUren: 2,
    uurtarief: 42,
    bijscholingsdagen: 1.5,
    kostenPerBijscholingsdag: 240,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 25,
  },
  GGZ: {
    // Minder voorbehouden handelingen, gemiddelde reizen
    skillslabPerMedewerker: 95,
    verlorenUren: 2,
    uurtarief: 36,
    bijscholingsdagen: 0.75,
    kostenPerBijscholingsdag: 185,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 40,
  },
  Gehandicaptenzorg: {
    // Vergelijkbaar met VVT, woonvoorzieningen verspreid
    skillslabPerMedewerker: 115,
    verlorenUren: 3,
    uurtarief: 30,
    bijscholingsdagen: 1,
    kostenPerBijscholingsdag: 190,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 55,
  },
  Onderwijsinstelling: {
    // ANDERE KOSTENSTRUCTUUR — geen werkgeverskosten, wel praktijkuren in fysiek lab.
    // De velden worden hergebruikt als:
    //   skillslabPerMedewerker  = onderhoud/abonnement eigen skillslab per student/jaar
    //   bijscholingsdagen       = praktijkuren in fysiek skillslab per student/jaar
    //   kostenPerBijscholingsdag = kostprijs per uur fysiek lesuur (instructeur+materiaal/student)
    //   urenPerBijscholingsdag  = 0 (studenten worden niet doorbetaald)
    //   verlorenUren / reiskosten = 0 (intern lab, geen reizen)
    skillslabPerMedewerker: 70, // eigen lab abo/onderhoud per student/jaar
    verlorenUren: 0,
    uurtarief: 32, // niet relevant maar voor consistentie
    bijscholingsdagen: 60, // gemiddelde praktijkuren skillslab voor zorgopleiding
    kostenPerBijscholingsdag: 18, // kostprijs/student/uur (instructeur 1:8 + materiaal)
    urenPerBijscholingsdag: 0, // studenten worden niet doorbetaald
    reiskostenPerMedewerker: 0, // intern lab
  },
  Anders: {
    skillslabPerMedewerker: 125,
    verlorenUren: 3,
    uurtarief: 32,
    bijscholingsdagen: 1,
    kostenPerBijscholingsdag: 195,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 60,
  },
};

export const BRANCHE_OMSCHRIJVING: Record<string, string> = {
  VVT: 'Verpleging, verzorging & thuiszorg — verspreide locaties, hoge reiskosten, 1 dag bijscholing/jaar.',
  Ziekenhuis: 'Hogere uurtarieven (gespecialiseerd personeel), intern lab dus weinig reizen, meer bijscholingsdagen.',
  GGZ: 'Minder voorbehouden handelingen per medewerker, lagere bijscholingsfrequentie.',
  Gehandicaptenzorg: 'Verspreide woonvoorzieningen, vergelijkbaar met VVT qua reistijd en bijscholing.',
  Onderwijsinstelling: 'Studenten zorgopleiding — kosten zijn fysiek skillslab + instructeurs-uren, geen werkgeverskosten.',
  Anders: 'Generieke defaults op basis van VVT-branchegemiddeldes.',
};
