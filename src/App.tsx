/**
 * CareUp ROI-calculator
 * ---------------------
 * Interactieve calculator voor zorgorganisaties die overwegen over te stappen
 * van fysiek skillslab + traditionele bijscholing naar CareUp Virtual Learning Lab.
 *
 * MARKTCONFORME DEFAULTS (VVT 2025-2026) — alle realistische kostenposten meegenomen
 *  - Skillslab abonnement:   €125/mw/jr     (Catharina €60-80, TMI €230, gemiddelde €125)
 *  - Reistijd skillslab:     3 u/mw × €32   (uurtarief = CAO VVT niv.4 + 55% wgv-lasten)
 *  - Reiskosten:             €60/mw/jr      (CAO €0,23/km × 4 bezoeken × 65 km retour)
 *  - Bijscholing cursus:     1 dag × €195   (gemiddelde TMI/ROC/in-house)
 *  - Bijscholing verloren werkdag: 8 u × €32 = €256/mw/jr   (volledig doorbetaald loon)
 *
 * REDUCTIES — onderbouwd op basis van wat CareUp daadwerkelijk vervangt:
 *  CareUp levert V&VN-geaccrediteerde toetsen + tentamens + BIG-herregistratiepunten.
 *  Daarmee vervangt het meeste theoretisch deel én oefenmomenten. Alleen periodieke
 *  praktijktoets door beoordelaar voor risicohandelingen (bv. infuus) blijft fysiek.
 *
 *  Zorg (VVT/Gehandicaptenzorg/GGZ/Anders):
 *    skillslab 70%, reistijd 80%, bijscholing 75%, reiskosten 80%
 *  Ziekenhuis (complexere handelingen → iets lager):
 *    skillslab 60%, reistijd 70%, bijscholing 65%, reiskosten 70%
 *  Onderwijs (studenten leren voor het eerst → fysieke praktijk cruciaal):
 *    skillslab 15%, reistijd 20%, bijscholing 35%, reiskosten 20%
 *
 * CAREUP VOLUMESTAFFEL 2025 (vaste prijs per band — zie lib/pricing.ts)
 *  Tot 10 mw   → €550 vast   (~€55/mw)    101-250 mw  → €6.125 vast   (~€35/mw)
 *  11-25       → €1.250 vast (~€50/mw)    251-500     → €11.250 vast  (~€30/mw)
 *  26-50       → €1.750 vast (~€45/mw)    501-1000    → €18.750 vast  (~€25/mw)
 *  51-100      → €3.000 vast (~€40/mw)    1001+       → €30.000 vast  (~€20/mw)
 *
 * VERWACHTE UITKOMSTEN PER ORGANISATIE (VVT defaults, nieuwe reducties 70/80/75/80%):
 *  100 mw  (€3.000 vast)  : Huidig €73.200    | Besparing ~€53.715 | ROI ~1.690%
 *  250 mw  (€6.125 vast)  : Huidig €183.000   | Besparing ~€135.230 | ROI ~2.107%
 *  500 mw  (€11.250 vast) : Huidig €366.000   | Besparing ~€269.450 | ROI ~2.295%
 *  1500 mw (€30.000 vast) : Huidig €1.098.000 | Besparing ~€811.350 | ROI ~2.604%
 *
 * Per medewerker (250 mw VVT):
 *   Huidig €732/jr → Met CareUp ~€191/jr → Besparing ~€541/mw/jr (~74%)
 *
 * Onderwijsinstelling (250 studenten, eigen reducties 15/20/35/20%):
 *   Huidig €287.500 | Besparing ~€96.738 | ROI ~1.480%
 *
 * Met de eerlijke vervangings-percentages (CareUp levert V&VN-accreditatie!)
 * wordt nu duidelijk waarom digitale oefenplatforms voor zorgorganisaties
 * zo aantrekkelijk zijn — niet alleen kosten van fysiek skillslab maar ook
 * de doorbetaalde werkdag bij elke bijscholing valt grotendeels weg.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { Download, Printer, Briefcase, Users2 } from 'lucide-react';
import { calculate, DEFAULTS, TYPE_ORGANISATIES, type CalculatorInputs } from './lib/calculations';
import { exportToExcel } from './lib/excelExport';
import { BRANCHE_PRESETS, BRANCHE_OMSCHRIJVING } from './lib/branchePresets';
import { careUpVolumeStaffel, careUpVasteJaarprijs, findStaffelBand, formatBandLabel } from './lib/pricing';
import { decodeQueryToInputs, writeInputsToUrl } from './lib/urlState';
import { InputField } from './components/InputField';
import { ResultsPanel } from './components/ResultsPanel';
import { ShareButton } from './components/ShareButton';
import { DemoCTA } from './components/DemoCTA';
import { BronnenAccordion } from './components/BronnenAccordion';
import { PrintReport } from './components/PrintReport';

type Mode = 'sales' | 'bestuurder';

const buildInitialInputs = (): CalculatorInputs => {
  if (typeof window === 'undefined') return DEFAULTS;
  const fromUrl = decodeQueryToInputs(window.location.search);
  const merged: CalculatorInputs = { ...DEFAULTS, ...fromUrl };
  // Als CareUp-prijs niet expliciet in URL stond, bereken vanuit staffel voor de geladen N
  if (fromUrl.careUpPrijsPerGebruiker === undefined) {
    merged.careUpPrijsPerGebruiker = careUpVolumeStaffel(merged.aantalMedewerkers);
  }
  return merged;
};

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(buildInitialInputs);
  const [mode, setMode] = useState<Mode>('sales');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [branchePresetApplied, setBranchePresetApplied] = useState(false);
  const branchePresetTimer = useRef<number | null>(null);

  const r = useMemo(() => calculate(inputs), [inputs]);
  const bestuurderModus = mode === 'bestuurder';
  const isOnderwijs = inputs.typeOrganisatie === 'Onderwijsinstelling';
  const persoonsLabel = isOnderwijs ? 'student' : 'medewerker';
  const persoonsLabelMv = isOnderwijs ? 'studenten' : 'medewerkers';

  // Sync inputs naar URL (replaceState — geen history-vervuiling)
  useEffect(() => {
    writeInputsToUrl(inputs);
  }, [inputs]);

  const setI = <K extends keyof CalculatorInputs>(key: K, v: CalculatorInputs[K]) => {
    setInputs((s) => ({ ...s, [key]: v }));
  };

  // Wanneer aantal medewerkers wijzigt: licentie volgt automatisch de staffel.
  // De informationele per-user prijs wordt opnieuw afgeleid (vaste prijs / N).
  const handleAantalChange = (nieuwAantal: number) => {
    nieuwAantal = Math.round(nieuwAantal);
    setInputs((s) => ({
      ...s,
      aantalMedewerkers: nieuwAantal,
      careUpPrijsPerGebruiker: careUpVolumeStaffel(nieuwAantal),
    }));
  };

  const staffelPrijs = careUpVolumeStaffel(inputs.aantalMedewerkers);
  const vasteBandPrijs = careUpVasteJaarprijs(inputs.aantalMedewerkers);
  const huidigeBand = findStaffelBand(inputs.aantalMedewerkers);
  const heeftOverride = !!(inputs.careUpLicentieOverride && inputs.careUpLicentieOverride > 0);

  const handleTypeChange = (type: string) => {
    const preset = BRANCHE_PRESETS[type];
    setInputs((s) => ({
      ...s,
      typeOrganisatie: type,
      ...(preset ?? {}),
    }));
    if (preset) {
      setBranchePresetApplied(true);
      if (branchePresetTimer.current) window.clearTimeout(branchePresetTimer.current);
      branchePresetTimer.current = window.setTimeout(() => setBranchePresetApplied(false), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Print-only rapport — verborgen op scherm, zichtbaar bij print/PDF */}
      <PrintReport inputs={inputs} r={r} />

      {/* Header */}
      <header className="border-b border-surface-line bg-white no-print">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/careup-logo.png"
                alt="CareUp · Virtual Learning Lab"
                className="h-12 w-auto"
                width={300}
                height={97}
              />
              <div className="hidden sm:block border-l border-surface-line pl-4">
                <div className="text-sm font-semibold text-careup-900 leading-tight">
                  ROI-calculator
                </div>
                <div className="text-xs text-ink-muted">voor zorgorganisaties</div>
              </div>
            </div>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-surface-line bg-white no-print">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="heading-display text-3xl sm:text-4xl">
            Wat bespaar je met CareUp?
          </h1>
          <p className="mt-2 max-w-3xl text-ink-soft">
            Reken voor je eigen organisatie uit wat je bespaart op skillslab-kosten, verloren werkuren en externe bijscholing — door over te stappen op het Virtual Learning Lab voor voorbehouden handelingen.
          </p>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Linker kolom: inputs */}
          <div className="space-y-5 lg:col-span-7">
            {/* Organisatie */}
            <section className="group-card">
              <h2 className="font-heading text-lg font-semibold text-careup-900">Jouw organisatie</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  type="text"
                  label="Naam organisatie"
                  value={inputs.organisatieNaam}
                  onChange={(v) => setI('organisatieNaam', v)}
                  placeholder="bv. Zorggroep Almere"
                  hint="Verschijnt op het Excel-rapport"
                />
                <div>
                  <InputField
                    type="select"
                    label="Type organisatie"
                    value={inputs.typeOrganisatie}
                    onChange={handleTypeChange}
                    options={TYPE_ORGANISATIES}
                    hint={BRANCHE_OMSCHRIJVING[inputs.typeOrganisatie]}
                  />
                  {branchePresetApplied && (
                    <p className="mt-1 text-xs font-medium text-savings">
                      ✓ Aannames aangepast aan {inputs.typeOrganisatie}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? 'Aantal studenten zorg-/welzijnsopleiding'
                      : 'Aantal zorgmedewerkers met voorbehouden handelingen'
                  }
                  value={inputs.aantalMedewerkers}
                  onChange={handleAantalChange}
                  min={5}
                  max={5000}
                  step={5}
                  format="number"
                  unit=""
                />
              </div>
            </section>

            {/* Huidige kosten */}
            <section className="group-card">
              <h2 className="font-heading text-lg font-semibold text-careup-900">Huidige kosten</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Defaults zijn Nederlandse branchegemiddelden 2025-2026. Pas aan naar je werkelijke cijfers.
              </p>
              <div className="mt-4 space-y-5">
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? `Skillslab-onderhoud/abonnement per ${persoonsLabel} per jaar`
                      : `Skillslab-kosten per ${persoonsLabel} per jaar`
                  }
                  value={inputs.skillslabPerMedewerker}
                  onChange={(v) => setI('skillslabPerMedewerker', v)}
                  min={0}
                  max={400}
                  step={5}
                  format="euro"
                  unit="€"
                  tooltip={
                    isOnderwijs
                      ? 'Eigen skillslab onderhoud, materialen-abonnement of huur per student per jaar. Voor zorgopleidingen typisch €60-€120/student.'
                      : 'Jaarabonnement of toegang tot fysieke skillslab. Catharina Ziekenhuis €61,50, TMI bijscholing €229,95. Branchegemiddelde NL 2025-2026 ~€125 voor VVT, hoger voor ziekenhuis.'
                  }
                  realisticMax={isOnderwijs ? 150 : 250}
                  hint=""
                />
                {!bestuurderModus && (
                  <div className="space-y-5">
                {!isOnderwijs && (
                  <>
                <InputField
                  type="slider"
                  label="Reistijd skillslab-bezoeken (uren per medewerker per jaar)"
                  value={inputs.verlorenUren}
                  onChange={(v) => setI('verlorenUren', v)}
                  min={0}
                  max={12}
                  step={0.5}
                  format="number"
                  unit="uur"
                  tooltip="Alleen reistijd + wachttijd + administratie rond fysieke skillslab-sessies. Hoger voor thuiszorg (~3-5u), lager voor organisaties met intern lab (~1-2u). Bijscholingsdagen tellen apart mee."
                  realisticMax={8}
                  warningMessage="Meer dan 8 uur reistijd/jaar is hoger dan gangbaar — alleen bijscholingsdagen tellen apart mee."
                />
                <InputField
                  type="slider"
                  label="Reiskosten per medewerker per jaar"
                  value={inputs.reiskostenPerMedewerker}
                  onChange={(v) => setI('reiskostenPerMedewerker', v)}
                  min={0}
                  max={250}
                  step={5}
                  format="euro"
                  unit="€"
                  tooltip="Reiskostenvergoeding voor skillslab- en bijscholingsbezoeken. CAO-norm €0,23/km. Voorbeeld: 4 bezoeken × 65 km retour = €60/jr. VVT/thuiszorg hoger door verspreide locaties; ziekenhuis lager door intern lab."
                  realisticMax={150}
                />
                <InputField
                  type="slider"
                  label="Werkgeverskosten per uur"
                  value={inputs.uurtarief}
                  onChange={(v) => setI('uurtarief', v)}
                  min={22}
                  max={60}
                  step={1}
                  format="euro"
                  unit="€"
                  tooltip="Bruto uurloon CAO VVT 2026 (€18-26 voor verpleegkundige niv. 4) + werkgeverslasten ~55% (sociale premies, vakantiegeld, eindejaarsuitkering, ORT). Ziekenhuis-personeel hoger (€42), ZZP-inhuur €45-60."
                  realisticMin={25}
                  realisticMax={50}
                  warningMessage="Werkgeverskosten buiten €25-€50/uur zijn ongebruikelijk voor zorg — controleer of je inclusief werkgeverslasten rekent."
                />
                  </>
                )}
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? 'Praktijkuren fysiek skillslab per student per jaar'
                      : 'Bijscholingsdagen voorbehouden handelingen per medewerker per jaar'
                  }
                  value={inputs.bijscholingsdagen}
                  onChange={(v) => setI('bijscholingsdagen', v)}
                  min={0}
                  max={isOnderwijs ? 200 : 3}
                  step={isOnderwijs ? 5 : 0.25}
                  format="number"
                  unit={isOnderwijs ? 'uur' : 'dag'}
                  tooltip={
                    isOnderwijs
                      ? 'Aantal contacturen in fysiek skillslab per student per studiejaar. HBO-V/MBO-zorg typisch 40-80 uur, plus extra voor specialisaties.'
                      : "VIG'ers moeten elke 3 jaar opnieuw getoetst worden, plus jaarlijkse opfris in praktijk. Default 1 dag/jaar conservatief — V&VN-richtlijn."
                  }
                />
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? 'Kostprijs per uur fysiek skillslab (per student)'
                      : 'Kosten per externe bijscholingsdag'
                  }
                  value={inputs.kostenPerBijscholingsdag}
                  onChange={(v) => setI('kostenPerBijscholingsdag', v)}
                  min={isOnderwijs ? 5 : 50}
                  max={isOnderwijs ? 80 : 400}
                  step={isOnderwijs ? 1 : 5}
                  format="euro"
                  unit="€"
                  tooltip={
                    isOnderwijs
                      ? 'Kostprijs per student per uur fysiek skillslab: instructeur (€50/u, ratio ~1:8 = €6/student) + materiaal/verbruik (€8-12/u) + lab-overhead. Default €18 conservatief.'
                      : 'Cursusprijs zelf (excl. salaris). Marktgemiddelde NL: TMI €230 incl. praktijktoets, externe trainer in groepsverband €54-€100, ROC-cursus €200-€300, in-house trainer ~€150.'
                  }
                  realisticMax={isOnderwijs ? 50 : 300}
                  warningMessage={
                    isOnderwijs
                      ? 'Boven €50/u skillslab-kostprijs is uitzonderlijk hoog voor zorgopleidingen.'
                      : 'Cursussen boven €300/dag zijn ongebruikelijk — check of je niet per ongeluk meerdere dagen meerekent.'
                  }
                />
                {!isOnderwijs && (
                  <InputField
                    type="slider"
                    label="Werkdaguren doorbetaald per bijscholingsdag"
                    value={inputs.urenPerBijscholingsdag}
                    onChange={(v) => setI('urenPerBijscholingsdag', v)}
                    min={4}
                    max={10}
                    step={0.5}
                    format="number"
                    unit="uur"
                    tooltip="Een hele werkdag bijscholing = 8 uur doorbetaald loon (medewerker werkt niet, maar je betaalt wel salaris). Eventueel + vervangingskosten ZZP. Default 8u — dit is vaak vergeten in ROI-berekeningen."
                    realisticMin={6}
                    realisticMax={9}
                  />
                )}
                  </div>
                )}
                {bestuurderModus && (
                  <p className="text-xs text-ink-muted">
                    {isOnderwijs
                      ? 'Praktijkuren-aantal en kostprijs zijn op gemiddeldes voor zorgopleidingen gezet. Schakel naar Sales-modus om deze aan te passen.'
                      : 'Reiskosten, reistijd, uurtarief en bijscholingsdetails zijn op Nederlandse branchegemiddelden gezet. Schakel naar Sales-modus om deze aan te passen.'}
                  </p>
                )}
              </div>
            </section>

            {/* CareUp investering — vaste staffel-prijs */}
            <section className="group-card">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-careup-900">Investering in CareUp</h2>
                <a
                  href="https://careup.online/tarieven"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-careup-600 hover:text-careup-700 hover:underline"
                >
                  careup.online/tarieven ↗
                </a>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="badge">Individueel jaarabo: €129,50</span>
                <span className="badge">Maandelijks: €12,95</span>
              </div>

              {/* Hoofd: vaste band-prijs uit staffel */}
              <div className="mt-3 rounded border border-savings/30 bg-savings-light p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-savings-dark">
                  CareUp volumestaffel 2025 — band {formatBandLabel(huidigeBand)}
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-serif text-2xl font-semibold text-savings-dark">
                    €{vasteBandPrijs.toLocaleString('nl-NL')}
                  </span>
                  <span className="text-sm text-savings-dark">
                    per jaar — vaste licentie ({inputs.aantalMedewerkers} {persoonsLabelMv})
                  </span>
                </div>
                <div className="mt-2 text-xs text-savings-dark/80">
                  Komt neer op €{staffelPrijs.toLocaleString('nl-NL', { maximumFractionDigits: 2 })}/{persoonsLabel}/jaar.
                  Bij {inputs.aantalMedewerkers + 1} {persoonsLabelMv} val je in de volgende staffel-band.
                </div>
              </div>

              {/* Override mogelijkheid voor afwijkende contracten */}
              <div className="mt-3">
                {!heeftOverride ? (
                  <button
                    type="button"
                    onClick={() => setI('careUpLicentieOverride', vasteBandPrijs)}
                    className="text-xs font-medium text-careup-700 hover:text-careup-800 hover:underline"
                  >
                    + Eigen contract-tarief invullen (afwijkend van staffel)
                  </button>
                ) : (
                  <div className="rounded border border-careup-200 bg-careup-50 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-careup-800">
                        Override: eigen contract-tarief
                      </span>
                      <button
                        type="button"
                        onClick={() => setI('careUpLicentieOverride', 0)}
                        className="text-xs font-medium text-careup-700 hover:text-careup-800 hover:underline"
                      >
                        ↺ terug naar staffel
                      </button>
                    </div>
                    <div className="mt-2">
                      <InputField
                        type="slider"
                        label="Totaal jaarbedrag CareUp-licentie"
                        value={inputs.careUpLicentieOverride ?? vasteBandPrijs}
                        onChange={(v) => setI('careUpLicentieOverride', v)}
                        min={Math.max(100, Math.round(vasteBandPrijs * 0.3))}
                        max={Math.round(vasteBandPrijs * 2)}
                        step={50}
                        format="euro"
                        unit="€"
                        tooltip="Vul hier het bedrag in dat in jullie offerte van CareUp staat — bijvoorbeeld bij maatwerkafspraken of meerjarige contracten."
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Geavanceerd */}
            {!bestuurderModus && (
              <section className="group-card">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h2 className="font-heading text-lg font-semibold text-careup-900">
                    Geavanceerde aannames
                  </h2>
                  <span className="text-sm font-medium text-careup-600">
                    {advancedOpen ? '− verberg' : '+ toon'}
                  </span>
                </button>
                {advancedOpen && (
                  <div className="mt-4 space-y-5">
                    <p className="rounded bg-careup-50 p-3 text-xs text-careup-800">
                      <strong>Wat vervangt CareUp?</strong> CareUp levert V&VN-geaccrediteerde toetsen, tentamens, BIG-herregistratiepunten en certificaten. Daarmee vervalt het overgrote deel van fysieke skillslab-oefeningen en bijscholingsdagen. Alleen voor specifieke risicohandelingen (bv. infuus inbrengen) blijft een periodieke fysieke praktijktoets door een beoordelaar nodig.
                      {isOnderwijs && (
                        <>
                          <br />
                          <strong className="block mt-2">Voor onderwijs ligt dit anders:</strong>
                          studenten moeten skills voor het eerst leren — fysieke oefening blijft cruciaal, CareUp is aanvulling op practicum.
                        </>
                      )}
                    </p>
                    <InputField
                      type="slider"
                      label="Reductie reistijd skillslab-bezoeken"
                      value={Math.round(inputs.reductieVerlorenUren * 100)}
                      onChange={(v) => setI('reductieVerlorenUren', v / 100)}
                      min={0}
                      max={95}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip="Door virtueel oefenen + zelfstudie vervalt de meeste reistijd. Medewerker oefent op werkplek of thuis, op eigen tempo. Alleen periodieke praktijktoets vereist nog reistijd."
                    />
                    <InputField
                      type="slider"
                      label="Reductie skillslab-bezoeken"
                      value={Math.round(inputs.reductieSkillslab * 100)}
                      onChange={(v) => setI('reductieSkillslab', v / 100)}
                      min={0}
                      max={95}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip="Oefenmomenten gaan virtueel; V&VN-geaccrediteerde toetsen worden via CareUp afgenomen. Alleen voor specifieke handelingen blijft een fysieke praktijkbeoordeling vereist (bv. 1× per 3 jaar). Reductie 60-80% realistisch voor zorg, lager voor onderwijs."
                    />
                    <InputField
                      type="slider"
                      label="Reductie externe bijscholingsdagen"
                      value={Math.round(inputs.reductieBijscholing * 100)}
                      onChange={(v) => setI('reductieBijscholing', v / 100)}
                      min={0}
                      max={95}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip="CareUp dekt theorie + toetsen + accreditatiepunten via V&VN — meeste fysieke bijscholingsdagen kunnen vervallen of zelfstudie worden. Reductie geldt op zowel cursusprijs als doorbetaalde werkdag."
                    />
                    <InputField
                      type="slider"
                      label="Reductie reiskosten"
                      value={Math.round(inputs.reductieReiskosten * 100)}
                      onChange={(v) => setI('reductieReiskosten', v / 100)}
                      min={0}
                      max={95}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip="Minder fysieke skillslab/cursus-bezoeken = lagere reiskostenvergoeding. Alleen voor jaarlijkse praktijktoetsen blijven enkele reizen nodig."
                    />
                  </div>
                )}
              </section>
            )}

            {/* Toon berekeningen */}
            {!bestuurderModus && (
              <section className="group-card">
                <button
                  type="button"
                  onClick={() => setShowCalc((v) => !v)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h2 className="font-heading text-lg font-semibold text-careup-900">
                    Toon berekeningen
                  </h2>
                  <span className="text-sm font-medium text-careup-600">
                    {showCalc ? '− verberg' : '+ toon'}
                  </span>
                </button>
                {showCalc && <CalculationBreakdown inputs={inputs} r={r} />}
              </section>
            )}
          </div>

          {/* Rechter kolom: results */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-6 space-y-4">
              <ResultsPanel r={r} inputs={inputs} bestuurderModus={bestuurderModus} />

              {/* Demo CTA — lead conversie */}
              <DemoCTA besparing={r.besparing} organisatieNaam={inputs.organisatieNaam} />

              {/* Actieknoppen */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 no-print">
                <button
                  onClick={() => exportToExcel(inputs, r)}
                  className="btn-secondary justify-center"
                >
                  <Download className="h-4 w-4" /> Excel
                </button>
                <ShareButton inputs={inputs} />
                <button onClick={() => window.print()} className="btn-secondary justify-center">
                  <Printer className="h-4 w-4" /> PDF
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Bronnen accordeon — onderaan voor wie de cijfers wil naslaan */}
        <div className="mt-6">
          <BronnenAccordion />
        </div>

        {/* Disclaimer */}
        <footer className="mt-12 border-t border-surface-line pt-6 text-xs text-ink-muted no-print">
          <p className="max-w-4xl">
            <strong className="text-ink">Disclaimer:</strong> Deze calculator geeft een indicatie op basis van Nederlandse branchegemiddelden 2025-2026. De werkelijke besparing varieert per organisatie. Wil je dit valideren? Vraag een <a href="https://careup.online/organisatie-demo/" target="_blank" rel="noreferrer" className="font-medium text-careup-700 hover:underline">gratis 30-dagen demo</a> aan en test CareUp met je eigen team.
          </p>
          <p className="mt-3">
            CareUp · Virtual Learning Lab voor zorgprofessionals · Defaults gebaseerd op publieke marktdata (Catharina Ziekenhuis, TMI Academy, CAO VVT 2026).
          </p>
        </footer>
      </main>
    </div>
  );
}

const ModeToggle = ({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) => (
  <div className="inline-flex items-center rounded border border-surface-line bg-surface-panel p-1">
    <ToggleBtn active={mode === 'sales'} onClick={() => onChange('sales')} icon={<Briefcase className="h-3.5 w-3.5" />}>
      Sales-modus
    </ToggleBtn>
    <ToggleBtn active={mode === 'bestuurder'} onClick={() => onChange('bestuurder')} icon={<Users2 className="h-3.5 w-3.5" />}>
      Bestuurder-modus
    </ToggleBtn>
  </div>
);

const ToggleBtn = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all',
      active ? 'bg-white text-careup-700 shadow-soft' : 'text-ink-muted hover:text-careup-700',
    ].join(' ')}
    style={{ fontFamily: 'Quicksand, system-ui, sans-serif' }}
  >
    {icon}
    {children}
  </button>
);

const CalculationBreakdown = ({
  inputs,
  r,
}: {
  inputs: CalculatorInputs;
  r: ReturnType<typeof calculate>;
}) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <div className="mt-4 space-y-3 text-sm text-ink-soft">
      <div className="rounded bg-surface-panel p-3">
        <div className="font-semibold text-ink">Huidige kosten ({inputs.aantalMedewerkers} medewerkers)</div>
        <ul className="mt-1 space-y-0.5">
          <li>
            Skillslab: {inputs.aantalMedewerkers} × {fmt(inputs.skillslabPerMedewerker)} = {fmt(r.huidigSkillslab)}
          </li>
          <li>
            Reistijd: {inputs.aantalMedewerkers} × {inputs.verlorenUren} u × {fmt(inputs.uurtarief)} = {fmt(r.huidigVerlorenUren)}
          </li>
          <li>
            Reiskosten: {inputs.aantalMedewerkers} × {fmt(inputs.reiskostenPerMedewerker)} = {fmt(r.huidigReiskosten)}
          </li>
          <li>
            Bijscholing — cursus: {inputs.aantalMedewerkers} × {inputs.bijscholingsdagen} × {fmt(inputs.kostenPerBijscholingsdag)} = {fmt(r.huidigBijscholingCursus)}
          </li>
          <li>
            Bijscholing — verloren werkdag: {inputs.aantalMedewerkers} × {inputs.bijscholingsdagen} × {inputs.urenPerBijscholingsdag} u × {fmt(inputs.uurtarief)} = {fmt(r.huidigBijscholingVerlorenDag)}
          </li>
          <li className="pt-1 font-semibold text-ink">Totaal huidige kosten: {fmt(r.huidigeKosten)}</li>
        </ul>
      </div>
      <div className="rounded bg-careup-50 p-3">
        <div className="font-semibold text-careup-900">Met CareUp</div>
        <ul className="mt-1 space-y-0.5">
          <li>
            Licentie (vaste staffel-prijs voor {inputs.aantalMedewerkers} medewerkers): {fmt(r.careUpLicentie)}
          </li>
          <li>
            Resterend skillslab ({Math.round((1 - inputs.reductieSkillslab) * 100)}%): {fmt(r.restSkillslab)}
          </li>
          <li>
            Resterende reistijd ({Math.round((1 - inputs.reductieVerlorenUren) * 100)}%): {fmt(r.restVerlorenUren)}
          </li>
          <li>
            Resterende reiskosten ({Math.round((1 - inputs.reductieReiskosten) * 100)}%): {fmt(r.restReiskosten)}
          </li>
          <li>
            Resterende bijscholing ({Math.round((1 - inputs.reductieBijscholing) * 100)}%): {fmt(r.restBijscholing)}
          </li>
          <li className="pt-1 font-semibold text-careup-900">Totaal met CareUp: {fmt(r.metCareUpKosten)}</li>
        </ul>
      </div>
    </div>
  );
};
