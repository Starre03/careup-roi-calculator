import * as XLSX from 'xlsx';
import type { CalculatorInputs, CalculatorResults } from './calculations';
import { todayISO } from './formatters';

export const exportToExcel = (inputs: CalculatorInputs, r: CalculatorResults): void => {
  const wb = XLSX.utils.book_new();
  const datum = todayISO();
  const naam = inputs.organisatieNaam || 'Onbekend';

  // Tab 1: Samenvatting
  const samenvatting: (string | number)[][] = [
    ['CareUp ROI-calculator — Samenvatting'],
    [],
    ['Organisatie', naam],
    ['Type', inputs.typeOrganisatie],
    ['Aantal medewerkers', inputs.aantalMedewerkers],
    ['Datum rapport', datum],
    [],
    ['HOOFDCIJFERS (per jaar)'],
    ['Huidige kosten', round(r.huidigeKosten)],
    ['Kosten met CareUp', round(r.metCareUpKosten)],
    ['Jaarlijkse besparing', round(r.besparing)],
    ['ROI op licentie', `${round(r.roi)}%`],
    [
      'Terugverdientijd (maanden)',
      r.terugverdientijdMaanden !== null ? round(r.terugverdientijdMaanden, 1) : 'n.v.t.',
    ],
    [],
    ['PER MEDEWERKER'],
    ['Huidige kosten per medewerker', round(r.huidigPerMedewerker)],
    ['CareUp kosten per medewerker', round(r.metCareUpPerMedewerker)],
    [],
    ['CUMULATIEF'],
    ['Besparing 3 jaar', round(r.cumulatief3jaar)],
    [],
    ['SCHOLINGSBUDGET'],
    ['Wettelijk budget (2% loonsom)', round(r.scholingsbudgetTotaal)],
    ['CareUp als % van budget', `${round(r.pctScholingsbudget, 1)}%`],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(samenvatting);
  ws1['!cols'] = [{ wch: 38 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Samenvatting');

  // Tab 2: Berekening
  const berekening: (string | number)[][] = [
    ['Berekening — alle inputs en tussenstappen'],
    [],
    ['INPUTS'],
    ['Aantal medewerkers (N)', inputs.aantalMedewerkers],
    ['Skillslab-kosten per medewerker per jaar', inputs.skillslabPerMedewerker],
    ['Reistijd skillslab-bezoeken (u/mw/jr)', inputs.verlorenUren],
    ['Reiskosten per medewerker per jaar', inputs.reiskostenPerMedewerker],
    ['Werkgeverskosten per uur', inputs.uurtarief],
    ['Bijscholingsdagen per medewerker per jaar', inputs.bijscholingsdagen],
    ['Kosten per externe bijscholingsdag', inputs.kostenPerBijscholingsdag],
    ['Werkdaguren doorbetaald per bijscholingsdag', inputs.urenPerBijscholingsdag],
    [
      'CareUp licentie (vaste staffel-prijs)',
      inputs.careUpLicentieOverride && inputs.careUpLicentieOverride > 0
        ? `${round(inputs.careUpLicentieOverride)} (eigen contract-tarief)`
        : `${round(r.careUpLicentie)} (CareUp volumestaffel 2025)`,
    ],
    ['Reductie reistijd', `${round(inputs.reductieVerlorenUren * 100)}%`],
    ['Reductie skillslab-bezoeken', `${round(inputs.reductieSkillslab * 100)}%`],
    ['Reductie bijscholingsdagen', `${round(inputs.reductieBijscholing * 100)}%`],
    ['Reductie reiskosten', `${round(inputs.reductieReiskosten * 100)}%`],
    [],
    ['HUIDIGE KOSTEN (uitsplitsing)'],
    ['Skillslab totaal = N × skillslab', round(r.huidigSkillslab)],
    ['Reistijd totaal = N × uren × tarief', round(r.huidigVerlorenUren)],
    ['Reiskosten totaal = N × reiskosten/mw', round(r.huidigReiskosten)],
    ['Bijscholing cursus = N × dagen × kosten/dag', round(r.huidigBijscholingCursus)],
    ['Bijscholing verloren werkdag = N × dagen × uren × tarief', round(r.huidigBijscholingVerlorenDag)],
    ['Som huidige kosten', round(r.huidigeKosten)],
    [],
    ['KOSTEN MET CAREUP (uitsplitsing)'],
    ['CareUp licentie = vaste staffel-prijs', round(r.careUpLicentie)],
    ['Resterend skillslab = huidig × (1-reductie)', round(r.restSkillslab)],
    ['Resterende reistijd', round(r.restVerlorenUren)],
    ['Resterende reiskosten', round(r.restReiskosten)],
    ['Resterende bijscholing (cursus + verloren werkdag)', round(r.restBijscholing)],
    ['Som met CareUp', round(r.metCareUpKosten)],
    [],
    ['UITKOMSTEN'],
    ['Besparing = Huidig - Met CareUp', round(r.besparing)],
    ['ROI = Besparing / Licentie × 100%', `${round(r.roi)}%`],
    [
      'Terugverdientijd = Licentie / Besparing × 12',
      r.terugverdientijdMaanden !== null
        ? `${round(r.terugverdientijdMaanden, 1)} maanden`
        : 'n.v.t.',
    ],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(berekening);
  ws2['!cols'] = [{ wch: 50 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Berekening');

  // Tab 3: Bronnen
  const bronnen: string[][] = [
    ['Bronnen & Aannames — geverifieerde marktdata 2025-2026'],
    [],
    ['Categorie', 'Bron / Citaat'],
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
      'CareUp levert V&VN-geaccrediteerde toetsen, tentamens en BIG-punten. Daarmee vervangt het ~70% van skillslab-bezoeken en ~75% van bijscholingsdagen voor zorgsectoren. Periodieke fysieke praktijktoets door beoordelaar blijft vereist voor specifieke risicohandelingen. Voor onderwijs ligt vervanging lager (~15-35%) want studenten moeten skills voor het eerst fysiek leren.',
    ],
    [
      'Disclaimer',
      'Deze calculator geeft een indicatie op basis van Nederlandse branchegemiddelden 2025-2026. Werkelijke besparing varieert per organisatie. Validatie aanbevolen via een gratis 30-dagen demo (zie careup.online).',
    ],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(bronnen);
  ws3['!cols'] = [{ wch: 28 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Bronnen & Aannames');

  const safeNaam = naam.replace(/[^a-zA-Z0-9-_]/g, '_') || 'Onbekend';
  const filename = `CareUp-ROI-${safeNaam}-${datum}.xlsx`;
  XLSX.writeFile(wb, filename);
};

const round = (n: number, decimals = 0): number => {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
};
