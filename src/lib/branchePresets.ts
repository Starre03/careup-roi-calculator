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
    // Trainen handelingen zelf, intern, minimale externe kosten
    skillslabPerMedewerker: 70,
    verlorenUren: 1,
    uurtarief: 38,
    bijscholingsdagen: 0.5,
    kostenPerBijscholingsdag: 165,
    urenPerBijscholingsdag: 8,
    reiskostenPerMedewerker: 20,
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
  Onderwijsinstelling: 'Trainen handelingen zelf — intern lab, minimale externe kosten.',
  Anders: 'Generieke defaults op basis van VVT-branchegemiddeldes.',
};
