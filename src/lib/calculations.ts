export interface CalculatorInputs {
  organisatieNaam: string;
  typeOrganisatie: string;
  aantalMedewerkers: number;
  skillslabPerMedewerker: number;
  verlorenUren: number;
  uurtarief: number;
  bijscholingsdagen: number;
  kostenPerBijscholingsdag: number;
  careUpPrijsPerGebruiker: number;
  reductieVerlorenUren: number; // 0..1
  reductieSkillslab: number; // 0..1
  reductieBijscholing: number; // 0..1
}

export interface CalculatorResults {
  // Totalen
  huidigeKosten: number;
  metCareUpKosten: number;
  besparing: number;
  roi: number; // %
  terugverdientijdMaanden: number | null;

  // Splitsing huidige kosten
  huidigSkillslab: number;
  huidigVerlorenUren: number;
  huidigBijscholing: number;

  // Splitsing CareUp-situatie
  careUpLicentie: number;
  restSkillslab: number;
  restVerlorenUren: number;
  restBijscholing: number;

  // Per medewerker
  huidigPerMedewerker: number;
  metCareUpPerMedewerker: number;

  // Cumulatief
  cumulatief3jaar: number;

  // Scholingsbudget
  scholingsbudgetTotaal: number;
  pctScholingsbudget: number; // %
}

const FTE_UREN_PER_JAAR = 1664;
const SCHOLINGSBUDGET_PCT = 0.02;

export const calculate = (i: CalculatorInputs): CalculatorResults => {
  const N = i.aantalMedewerkers;

  const huidigSkillslab = N * i.skillslabPerMedewerker;
  const huidigVerlorenUren = N * i.verlorenUren * i.uurtarief;
  const huidigBijscholing = N * i.bijscholingsdagen * i.kostenPerBijscholingsdag;
  const huidigeKosten = huidigSkillslab + huidigVerlorenUren + huidigBijscholing;

  const careUpLicentie = N * i.careUpPrijsPerGebruiker;
  const restSkillslab = huidigSkillslab * (1 - i.reductieSkillslab);
  const restVerlorenUren = huidigVerlorenUren * (1 - i.reductieVerlorenUren);
  const restBijscholing = huidigBijscholing * (1 - i.reductieBijscholing);
  const metCareUpKosten = careUpLicentie + restSkillslab + restVerlorenUren + restBijscholing;

  const besparing = huidigeKosten - metCareUpKosten;
  const roi = careUpLicentie > 0 ? (besparing / careUpLicentie) * 100 : 0;
  const terugverdientijdMaanden =
    besparing > 0 ? (careUpLicentie / besparing) * 12 : null;

  const huidigPerMedewerker = N > 0 ? huidigeKosten / N : 0;
  const metCareUpPerMedewerker = N > 0 ? metCareUpKosten / N : 0;
  const cumulatief3jaar = besparing * 3;

  const scholingsbudgetTotaal = N * i.uurtarief * FTE_UREN_PER_JAAR * SCHOLINGSBUDGET_PCT;
  const pctScholingsbudget =
    scholingsbudgetTotaal > 0 ? (careUpLicentie / scholingsbudgetTotaal) * 100 : 0;

  return {
    huidigeKosten,
    metCareUpKosten,
    besparing,
    roi,
    terugverdientijdMaanden,
    huidigSkillslab,
    huidigVerlorenUren,
    huidigBijscholing,
    careUpLicentie,
    restSkillslab,
    restVerlorenUren,
    restBijscholing,
    huidigPerMedewerker,
    metCareUpPerMedewerker,
    cumulatief3jaar,
    scholingsbudgetTotaal,
    pctScholingsbudget,
  };
};

export const DEFAULTS: CalculatorInputs = {
  organisatieNaam: '',
  typeOrganisatie: 'VVT',
  aantalMedewerkers: 250,
  skillslabPerMedewerker: 110,
  verlorenUren: 3,
  uurtarief: 32,
  bijscholingsdagen: 1,
  kostenPerBijscholingsdag: 175,
  careUpPrijsPerGebruiker: 27.5,
  reductieVerlorenUren: 0.5,
  reductieSkillslab: 0.3,
  reductieBijscholing: 0.4,
};

export const TYPE_ORGANISATIES = [
  'VVT',
  'Ziekenhuis',
  'GGZ',
  'Gehandicaptenzorg',
  'Onderwijsinstelling',
  'Anders',
];
