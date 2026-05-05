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
    ['Verloren werkuren per medewerker per jaar', inputs.verlorenUren],
    ['Werkgeverskosten per uur', inputs.uurtarief],
    ['Bijscholingsdagen per medewerker per jaar', inputs.bijscholingsdagen],
    ['Kosten per externe bijscholingsdag', inputs.kostenPerBijscholingsdag],
    ['CareUp prijs per gebruiker per jaar', inputs.careUpPrijsPerGebruiker],
    ['Reductie verloren werkuren', `${round(inputs.reductieVerlorenUren * 100)}%`],
    ['Reductie skillslab-bezoeken', `${round(inputs.reductieSkillslab * 100)}%`],
    ['Reductie bijscholingsdagen', `${round(inputs.reductieBijscholing * 100)}%`],
    [],
    ['HUIDIGE KOSTEN (uitsplitsing)'],
    ['Skillslab totaal = N × skillslab', round(r.huidigSkillslab)],
    ['Verloren uren totaal = N × uren × tarief', round(r.huidigVerlorenUren)],
    ['Bijscholing totaal = N × dagen × kosten/dag', round(r.huidigBijscholing)],
    ['Som huidige kosten', round(r.huidigeKosten)],
    [],
    ['KOSTEN MET CAREUP (uitsplitsing)'],
    ['CareUp licentie = N × prijs', round(r.careUpLicentie)],
    ['Resterend skillslab = huidig × (1-reductie)', round(r.restSkillslab)],
    ['Resterende verloren uren', round(r.restVerlorenUren)],
    ['Resterende bijscholing', round(r.restBijscholing)],
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
      'Catharina Ziekenhuis SkillsLab jaarabonnement: €61,50. TMI Academy bijscholing voorbehouden handelingen: €229,95. Branchegemiddelde NL 2025: ~€110/medewerker/jaar.',
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
      'Instellingstarief vanaf 25 medewerkers: vanaf €27,50/gebruiker/jaar. Staffel naar beneden bij grotere volumes.',
    ],
    [
      'Compliance-kaders',
      'IGJ (Inspectie Gezondheidszorg en Jeugd): bewijslast bekwaamheid. BIG-herregistratie: elke 5 jaar. Wkkgz: zorgaanbieder moet kunnen aantonen dat medewerkers bekwaam zijn voor risicovolle handelingen. V&VN Kwaliteitsregister: accreditatiepunten registratie.',
    ],
    [
      'Disclaimer',
      'Deze calculator geeft een indicatie op basis van Nederlandse branchegemiddelden 2025-2026. Werkelijke besparing varieert per organisatie. Aanbevolen: validatie via een 90-dagen pilot met vaste prijs (€5.950).',
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
