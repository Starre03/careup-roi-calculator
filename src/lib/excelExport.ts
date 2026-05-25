import * as XLSX from 'xlsx';
import type { CalculatorInputs, CalculatorResults } from './calculations';
import { todayISO } from './formatters';
import type { Locale } from './i18n';

export const exportToExcel = (inputs: CalculatorInputs, r: CalculatorResults, locale: Locale = 'nl'): void => {
  const wb = XLSX.utils.book_new();
  const tx = (nl: string, en: string) => (locale === 'nl' ? nl : en);
  const datum = todayISO();
  const naam = inputs.organisatieNaam || tx('Onbekend', 'Unknown');

  // Tab 1: Samenvatting
  const samenvatting: (string | number)[][] = [
    [tx('CareUp ROI-calculator — Samenvatting', 'CareUp ROI calculator — Summary')],
    [],
    [tx('Organisatie', 'Organization'), naam],
    [tx('Type', 'Type'), inputs.typeOrganisatie],
    [tx('Aantal medewerkers', 'Number of employees'), inputs.aantalMedewerkers],
    [tx('Datum rapport', 'Report date'), datum],
    [],
    [tx('HOOFDCIJFERS (per jaar)', 'KEY FIGURES (per year)')],
    [tx('Huidige kosten', 'Current costs'), round(r.huidigeKosten)],
    [tx('Kosten met CareUp', 'Costs with CareUp'), round(r.metCareUpKosten)],
    [tx('Jaarlijkse besparing', 'Annual savings'), round(r.besparing)],
    [tx('ROI op licentie', 'ROI on license'), `${round(r.roi)}%`],
    [
      tx('Terugverdientijd (maanden)', 'Payback period (months)'),
      r.terugverdientijdMaanden !== null ? round(r.terugverdientijdMaanden, 1) : tx('n.v.t.', 'n/a'),
    ],
    [],
    [tx('PER MEDEWERKER', 'PER EMPLOYEE')],
    [tx('Huidige kosten per medewerker', 'Current costs per employee'), round(r.huidigPerMedewerker)],
    [tx('CareUp kosten per medewerker', 'CareUp costs per employee'), round(r.metCareUpPerMedewerker)],
    [],
    [tx('CUMULATIEF', 'CUMULATIVE')],
    [tx('Besparing 3 jaar', 'Savings over 3 years'), round(r.cumulatief3jaar)],
    [],
    [tx('SCHOLINGSBUDGET', 'TRAINING BUDGET')],
    [tx('Wettelijk budget (2% loonsom)', 'Statutory budget (2% payroll)'), round(r.scholingsbudgetTotaal)],
    [tx('CareUp als % van budget', 'CareUp as % of budget'), `${round(r.pctScholingsbudget, 1)}%`],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(samenvatting);
  ws1['!cols'] = [{ wch: 38 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws1, tx('Samenvatting', 'Summary'));

  // Tab 2: Berekening
  const berekening: (string | number)[][] = [
    [tx('Berekening — alle inputs en tussenstappen', 'Calculation — all inputs and intermediate steps')],
    [],
    [tx('INPUTS', 'INPUTS')],
    [tx('Aantal medewerkers (N)', 'Number of employees (N)'), inputs.aantalMedewerkers],
    [tx('Skillslab-kosten per medewerker per jaar', 'Skills lab costs per employee per year'), inputs.skillslabPerMedewerker],
    [tx('Reistijd skillslab-bezoeken (u/mw/jr)', 'Travel time for skills lab visits (h/employee/year)'), inputs.verlorenUren],
    [tx('Reiskosten per medewerker per jaar', 'Travel costs per employee per year'), inputs.reiskostenPerMedewerker],
    [tx('Werkgeverskosten per uur', 'Employer cost per hour'), inputs.uurtarief],
    [tx('Bijscholingsdagen per medewerker per jaar', 'Training days per employee per year'), inputs.bijscholingsdagen],
    [tx('Kosten per externe bijscholingsdag', 'Cost per external training day'), inputs.kostenPerBijscholingsdag],
    [tx('Werkdaguren doorbetaald per bijscholingsdag', 'Paid working hours per training day'), inputs.urenPerBijscholingsdag],
    [
      tx('CareUp licentie (vaste staffel-prijs)', 'CareUp license (fixed tier price)'),
      inputs.careUpLicentieOverride && inputs.careUpLicentieOverride > 0
        ? `${round(inputs.careUpLicentieOverride)} (${tx('eigen contract-tarief', 'custom contract price')})`
        : `${round(r.careUpLicentie)} (${tx('CareUp volumestaffel 2025', 'CareUp volume tier 2025')})`,
    ],
    [tx('Reductie reistijd', 'Reduction in travel time'), `${round(inputs.reductieVerlorenUren * 100)}%`],
    [tx('Reductie skillslab-bezoeken', 'Reduction in skills lab visits'), `${round(inputs.reductieSkillslab * 100)}%`],
    [tx('Reductie bijscholingsdagen', 'Reduction in training days'), `${round(inputs.reductieBijscholing * 100)}%`],
    [tx('Reductie reiskosten', 'Reduction in travel costs'), `${round(inputs.reductieReiskosten * 100)}%`],
    [],
    [tx('HUIDIGE KOSTEN (uitsplitsing)', 'CURRENT COSTS (breakdown)')],
    [tx('Skillslab totaal = N × skillslab', 'Skills lab total = N × skills lab'), round(r.huidigSkillslab)],
    [tx('Reistijd totaal = N × uren × tarief', 'Travel time total = N × hours × rate'), round(r.huidigVerlorenUren)],
    [tx('Reiskosten totaal = N × reiskosten/mw', 'Travel costs total = N × travel costs/employee'), round(r.huidigReiskosten)],
    [tx('Bijscholing cursus = N × dagen × kosten/dag', 'Training course = N × days × cost/day'), round(r.huidigBijscholingCursus)],
    [tx('Bijscholing verloren werkdag = N × dagen × uren × tarief', 'Training lost workday = N × days × hours × rate'), round(r.huidigBijscholingVerlorenDag)],
    [tx('Som huidige kosten', 'Sum current costs'), round(r.huidigeKosten)],
    [],
    [tx('KOSTEN MET CAREUP (uitsplitsing)', 'COSTS WITH CAREUP (breakdown)')],
    [tx('CareUp licentie = vaste staffel-prijs', 'CareUp license = fixed tier price'), round(r.careUpLicentie)],
    [tx('Resterend skillslab = huidig × (1-reductie)', 'Remaining skills lab = current × (1-reduction)'), round(r.restSkillslab)],
    [tx('Resterende reistijd', 'Remaining travel time'), round(r.restVerlorenUren)],
    [tx('Resterende reiskosten', 'Remaining travel costs'), round(r.restReiskosten)],
    [tx('Resterende bijscholing (cursus + verloren werkdag)', 'Remaining training (course + lost workday)'), round(r.restBijscholing)],
    [tx('Som met CareUp', 'Sum with CareUp'), round(r.metCareUpKosten)],
    [],
    [tx('UITKOMSTEN', 'OUTCOMES')],
    [tx('Besparing = Huidig - Met CareUp', 'Savings = Current - With CareUp'), round(r.besparing)],
    [tx('ROI = Besparing / Licentie × 100%', 'ROI = Savings / License × 100%'), `${round(r.roi)}%`],
    [
      tx('Terugverdientijd = Licentie / Besparing × 12', 'Payback period = License / Savings × 12'),
      r.terugverdientijdMaanden !== null
        ? `${round(r.terugverdientijdMaanden, 1)} ${tx('maanden', 'months')}`
        : tx('n.v.t.', 'n/a'),
    ],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(berekening);
  ws2['!cols'] = [{ wch: 50 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws2, tx('Berekening', 'Calculation'));

  // Tab 3: Bronnen
  const bronnen: string[][] = [
    [tx('Bronnen & Aannames — geverifieerde marktdata 2025-2026', 'Sources & Assumptions — verified market data 2025-2026')],
    [],
    [tx('Categorie', 'Category'), tx('Bron / Citaat', 'Source / Quote')],
    [
      'Skillslab-kosten',
      'Catharina Ziekenhuis SkillsLab jaarabonnement: €61,50. TMI Academy bijscholing voorbehouden handelingen: €229,95. Branchegemiddelde NL 2025-2026: ~€125/medewerker/jaar voor VVT, €165 voor ziekenhuis.',
    ],
    [
      'Reiskostenvergoeding',
      'CAO-norm 2026: €0,23 per kilometer woon-werk vanaf 10 km enkele reis. Voorbeeld VVT: 4 skillslab/cursus-bezoeken × 65 km retour × €0,23 = €60/medewerker/jaar.',
    ],
    [
      'Verloren werkdag bij bijscholing',
      'Een hele dag externe bijscholing = 8 uur volledig doorbetaald loon waarin de medewerker geen productieve zorg verleent. Dit is vaak vergeten in ROI-berekeningen maar is de grootste indirecte kostenpost.',
    ],
    [
      'Bijscholingsdagen',
      'V&VN richtlijn: VIG\'ers en verzorgenden IG dienen elke 3 jaar opnieuw te worden getoetst op voorbehouden handelingen, met jaarlijkse opfrismomenten in de praktijk.',
    ],
    [
      'Kosten per bijscholingsdag',
      'Marktgemiddelde NL 2025: TMI €230 incl. praktijktoets, externe trainer in groepsverband €54-€100/persoon, ROC-cursus €200-€300.',
    ],
    [
      'Werkgeverskosten per uur',
      'CAO VVT 2026: bruto uurloon verpleegkundige niveau 4 €18-€26. Werkgeverslasten ~55% (sociale premies, vakantiegeld, eindejaarsuitkering, ORT-toeslagen). ZZP-inhuur typisch €45-55/uur.',
    ],
    [
      'Wettelijk scholingsbudget',
      'CAO VVT artikel 5.3 (2026): 2% van de loonsom verplicht beschikbaar voor scholing en deskundigheidsbevordering.',
    ],
    [
      'Voltijds uren per jaar',
      '1664 uur (CAO VVT, 36 uur per week × 52 weken minus vakantie en feestdagen).',
    ],
    [
      'CareUp tarief',
      'Individueel maandabo: €12,95/maand. Individueel jaarabo: €129,50/jaar (2 maanden gratis). Zakelijk/instellingstarief: custom — typisch €25-€50/gebruiker/jaar bij volume. Bron: careup.online/tarieven.',
    ],
    [
      'Compliance-kaders',
      'IGJ: bewijslast bekwaamheid. BIG-herregistratie: elke 5 jaar. Wkkgz: zorgaanbieder moet kunnen aantonen dat medewerkers bekwaam zijn voor risicovolle handelingen. CareUp levert V&VN-geaccrediteerde toetsen, tentamens en certificaten — accreditatiepunten worden automatisch bijgeschreven in V&VN Kwaliteitsregister.',
    ],
    [
      'Reducties — onderbouwing',
      'CareUp levert V&VN-geaccrediteerde toetsen, tentamens en alle BIG-herregistratiepunten. Alle benodigde accreditatiepunten worden volledig via CareUp behaald — een aparte fysieke praktijktoets is daarmee niet meer nodig. Voor zorgsectoren vervangt CareUp ~85% van skillslab-bezoeken en ~85% van bijscholingsdagen. Voor onderwijs ligt vervanging lager (~15-35%) want studenten moeten skills voor het eerst fysiek leren.',
    ],
    [
      'Disclaimer',
      'Deze calculator geeft een indicatie op basis van Nederlandse branchegemiddelden 2025-2026. Werkelijke besparing varieert per organisatie. Validatie aanbevolen via een gratis 30-dagen demo (zie careup.online).',
    ],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(bronnen);
  ws3['!cols'] = [{ wch: 28 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(wb, ws3, tx('Bronnen & Aannames', 'Sources'));

  const safeNaam = naam.replace(/[^a-zA-Z0-9-_]/g, '_') || 'Onbekend';
  const filename = `CareUp-ROI-${safeNaam}-${datum}.xlsx`;
  XLSX.writeFile(wb, filename);
};

const round = (n: number, decimals = 0): number => {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
};
