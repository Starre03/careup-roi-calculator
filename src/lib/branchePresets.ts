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
  | 'reductieSkillslab'
  | 'reductieVerlorenUren'
  | 'reductieBijscholing'
  | 'reductieReiskosten'
>;

/**
 * Branchespecifieke defaults voor zorgsectoren in NL 2025-2026.
 * Bronnen: CAO VVT 2026, TMI Academy, V&VN, marktbenchmarks.
 *
 * Reiskosten zijn gebaseerd op CAO-vergoeding €0,23/km × geschat aantal
 * skillslab/cursus-bezoeken per jaar × gemiddelde retour-afstand.
 */
/**
 * REDUCTIES — wat vervangt CareUp daadwerkelijk?
 *
 * CareUp levert V&VN-geaccrediteerde toetsen + tentamens, BIG-herregistratie-punten,
 * en certificaten. Voor zorgsectoren betekent dit dat het overgrote deel van
 * fysieke bijscholing en oefenmomenten vervangen kan worden door virtuele simulatie.
 *
 * Wat blijft fysiek nodig:
 *  - Periodieke praktijktoets door beoordelaar voor echte risicohandelingen (bv. infuus)
 *  - In sommige organisaties: jaarlijks moment hands-on demo
 *
 * Voor onderwijs ligt het anders: studenten moeten skills voor het EERST leren.
 * Daar is fysieke oefening cruciaal — CareUp is aanvulling, niet vervanging.
 */

export const BRANCHE_PRESETS: Record<string, BranchePreset> = {
  VVT: {
    skillslabPerMedewerker: 125,
    verlorenUren: 3,
    uurtarief: 32,
    bijscholingsdagen: 1,
    kostenPerBijscholingsdag: 195,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 60,
    // CareUp levert accreditatie → meeste skillslab + bijscholing kan vervallen
    reductieSkillslab: 0.7,
    reductieVerlorenUren: 0.8,
    reductieBijscholing: 0.75,
    reductieReiskosten: 0.8,
  },
  Ziekenhuis: {
    skillslabPerMedewerker: 165,
    verlorenUren: 2,
    uurtarief: 42,
    bijscholingsdagen: 1.5,
    kostenPerBijscholingsdag: 240,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 25,
    // Iets lager — meer complexe handelingen die fysieke beoordeling vereisen (OK, IC)
    reductieSkillslab: 0.6,
    reductieVerlorenUren: 0.7,
    reductieBijscholing: 0.65,
    reductieReiskosten: 0.7,
  },
  GGZ: {
    skillslabPerMedewerker: 95,
    verlorenUren: 2,
    uurtarief: 36,
    bijscholingsdagen: 0.75,
    kostenPerBijscholingsdag: 185,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 40,
    reductieSkillslab: 0.7,
    reductieVerlorenUren: 0.75,
    reductieBijscholing: 0.75,
    reductieReiskosten: 0.75,
  },
  Gehandicaptenzorg: {
    skillslabPerMedewerker: 115,
    verlorenUren: 3,
    uurtarief: 30,
    bijscholingsdagen: 1,
    kostenPerBijscholingsdag: 190,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 55,
    reductieSkillslab: 0.7,
    reductieVerlorenUren: 0.8,
    reductieBijscholing: 0.75,
    reductieReiskosten: 0.8,
  },
  Onderwijsinstelling: {
    // ANDERE KOSTENSTRUCTUUR — geen werkgeverskosten, wel praktijkuren in fysiek lab.
    // Velden hergebruikt: skillslab = lab-onderhoud/student, bijscholingsdagen = praktijkuren,
    // kosten/dag = kostprijs/uur, urenPerBijscholingsdag = 0 (geen loon-doorbetaling).
    skillslabPerMedewerker: 70,
    verlorenUren: 0,
    uurtarief: 32,
    bijscholingsdagen: 60,
    kostenPerBijscholingsdag: 18,
    urenPerBijscholingsdag: 0,
    reiskostenPerMedewerker: 0,
    // VOOR ONDERWIJS LAGER: studenten moeten skills FYSIEK aanleren.
    // CareUp is aanvulling op practicum, niet vervanging.
    reductieSkillslab: 0.15, // lab-onderhoud blijft grotendeels nodig
    reductieVerlorenUren: 0.2,
    reductieBijscholing: 0.35, // 35% van praktijkuren kan virtueel (theorie + voorbereiding)
    reductieReiskosten: 0.2,
  },
  Anders: {
    skillslabPerMedewerker: 125,
    verlorenUren: 3,
    uurtarief: 32,
    bijscholingsdagen: 1,
    kostenPerBijscholingsdag: 195,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 60,
    reductieSkillslab: 0.7,
    reductieVerlorenUren: 0.8,
    reductieBijscholing: 0.75,
    reductieReiskosten: 0.8,
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
