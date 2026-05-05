export interface CalculatorInputs {
  organisatieNaam: string;
  typeOrganisatie: string;
  aantalMedewerkers: number;

  // Skillslab — fysieke oefenfaciliteit + reistijd
  skillslabPerMedewerker: number; // jaarlijkse abonnementskosten/lab-toegang per medewerker
  verlorenUren: number; // reistijd + administratie skillslab-bezoeken per jaar (uren)

  // Bijscholing — externe cursusdagen
  bijscholingsdagen: number; // dagen per medewerker per jaar
  kostenPerBijscholingsdag: number; // tarief externe cursus (excl. salaris)
  urenPerBijscholingsdag: number; // typisch 8 — volledige werkdag doorbetaald

  // Reizen — naar skillslab + bijscholingslocatie
  reiskostenPerMedewerker: number; // totale reiskostenvergoeding per medewerker per jaar (€)

  // Loonkosten
  uurtarief: number; // werkgeverskosten per uur (bruto + lasten)

  // CareUp investering
  careUpPrijsPerGebruiker: number; // per gebruiker per jaar

  // Reducties — fractie van de huidige kosten die vervalt bij overstap
  reductieVerlorenUren: number; // 0..1
  reductieSkillslab: number; // 0..1
  reductieBijscholing: number; // 0..1
  reductieReiskosten: number; // 0..1 — meestal gelijk aan reductie verloren uren
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
  huidigBijscholing: number; // cursuskosten + verloren werkdag samen
  huidigBijscholingCursus: number; // alleen cursusprijs
  huidigBijscholingVerlorenDag: number; // alleen 8u/dag × tarief
  huidigReiskosten: number;

  // Splitsing CareUp-situatie
  careUpLicentie: number;
  restSkillslab: number;
  restVerlorenUren: number;
  restBijscholing: number;
  restReiskosten: number;

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

  // Huidige kosten — uitgesplitst per categorie
  const huidigSkillslab = N * i.skillslabPerMedewerker;
  const huidigVerlorenUren = N * i.verlorenUren * i.uurtarief;
  const huidigBijscholingCursus = N * i.bijscholingsdagen * i.kostenPerBijscholingsdag;
  const huidigBijscholingVerlorenDag =
    N * i.bijscholingsdagen * i.urenPerBijscholingsdag * i.uurtarief;
  const huidigBijscholing = huidigBijscholingCursus + huidigBijscholingVerlorenDag;
  const huidigReiskosten = N * i.reiskostenPerMedewerker;

  const huidigeKosten =
    huidigSkillslab + huidigVerlorenUren + huidigBijscholing + huidigReiskosten;

  // CareUp situatie
  const careUpLicentie = N * i.careUpPrijsPerGebruiker;
  const restSkillslab = huidigSkillslab * (1 - i.reductieSkillslab);
  const restVerlorenUren = huidigVerlorenUren * (1 - i.reductieVerlorenUren);
  const restBijscholing = huidigBijscholing * (1 - i.reductieBijscholing);
  const restReiskosten = huidigReiskosten * (1 - i.reductieReiskosten);
  const metCareUpKosten =
    careUpLicentie + restSkillslab + restVerlorenUren + restBijscholing + restReiskosten;

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
    huidigBijscholingCursus,
    huidigBijscholingVerlorenDag,
    huidigReiskosten,
    careUpLicentie,
    restSkillslab,
    restVerlorenUren,
    restBijscholing,
    restReiskosten,
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

  // VVT marktconforme defaults 2025-2026
  skillslabPerMedewerker: 125, // gemiddelde NL: Catharina €60-80 abo, TMI €230 incl. praktijk
  verlorenUren: 3, // reistijd skillslab-bezoeken per jaar

  bijscholingsdagen: 1, // 1 dag/jr — V&VN richtlijn jaarlijkse opfris
  kostenPerBijscholingsdag: 195, // gemiddelde TMI €230, ROC €200-300, in-house €150
  urenPerBijscholingsdag: 8, // volledige werkdag doorbetaald

  reiskostenPerMedewerker: 60, // 4 bezoeken × ~65 km retour × €0,23 = ~€60/jr (CAO-norm)

  uurtarief: 32, // CAO VVT verpleegkundige niv. 4 + 55% wgv-lasten

  careUpPrijsPerGebruiker: 24.5, // staffel band 101-250 = €6.125 vast / 250 = €24,50

  reductieVerlorenUren: 0.5,
  reductieSkillslab: 0.3,
  reductieBijscholing: 0.4,
  reductieReiskosten: 0.5, // schaalt mee met verloren uren (= minder bezoeken)
};

export const TYPE_ORGANISATIES = [
  'VVT',
  'Ziekenhuis',
  'GGZ',
  'Gehandicaptenzorg',
  'Onderwijsinstelling',
  'Anders',
];
