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
import { Download, Printer, Briefcase, Users2, RotateCcw, Languages } from 'lucide-react';
import { calculate, DEFAULTS, type CalculatorInputs } from './lib/calculations';
import { exportToExcel } from './lib/excelExport';
import {
  organizationTypeOptions,
  translations,
  type AppCopy,
  type CalculationCopy,
  type LanguageCopy,
  type Locale,
} from './lib/i18n';
import { BRANCHE_PRESETS, BRANCHE_OMSCHRIJVING } from './lib/branchePresets';
import {
  careUpVolumeStaffel,
  careUpVasteJaarprijs,
  careUpEffectievePrijs,
  findStaffelBand,
  formatBandLabel,
  isIndividueelGoedkoper,
  INDIVIDUEEL_JAARABO,
} from './lib/pricing';
import { decodeQueryToInputs, writeInputsToUrl } from './lib/urlState';
import { InputField } from './components/InputField';
import { ResultsPanel } from './components/ResultsPanel';
import { ShareButton } from './components/ShareButton';
import { DemoCTA } from './components/DemoCTA';
import { BronnenAccordion } from './components/BronnenAccordion';
import { FAQAccordion } from './components/FAQAccordion';
import { ScenarioPresets } from './components/ScenarioPresets';
import { EmailButton } from './components/EmailButton';
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
  const [locale, setLocale] = useState<Locale>('nl');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [branchePresetApplied, setBranchePresetApplied] = useState(false);
  const branchePresetTimer = useRef<number | null>(null);

  const r = useMemo(() => calculate(inputs), [inputs]);
  const t = translations[locale];
  const bestuurderModus = mode === 'bestuurder';
  const isOnderwijs = inputs.typeOrganisatie === 'Onderwijsinstelling';
  const persoonsLabel = isOnderwijs ? 'student' : locale === 'nl' ? 'medewerker' : 'employee';
  const persoonsLabelMv = isOnderwijs ? (locale === 'nl' ? 'studenten' : 'students') : locale === 'nl' ? 'medewerkers' : 'employees';

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
  const effectievePrijs = careUpEffectievePrijs(inputs.aantalMedewerkers);
  const individueelGoedkoper = isIndividueelGoedkoper(inputs.aantalMedewerkers);
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

  const handleReset = () => {
    setInputs({
      ...DEFAULTS,
      careUpPrijsPerGebruiker: careUpVolumeStaffel(DEFAULTS.aantalMedewerkers),
    });
  };

  const handleLoadScenario = (preset: CalculatorInputs) => {
    // Behoud organisatienaam als die al ingevuld is
    setInputs((s) => ({
      ...preset,
      organisatieNaam: s.organisatieNaam || preset.organisatieNaam,
    }));
    setBranchePresetApplied(true);
    if (branchePresetTimer.current) window.clearTimeout(branchePresetTimer.current);
    branchePresetTimer.current = window.setTimeout(() => setBranchePresetApplied(false), 3500);
  };

  return (
    <div className="min-h-screen bg-surface-alt" lang={locale}>
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
                <div className="text-xs text-ink-muted">{t.app.subtitle}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                title={locale === 'nl' ? 'Alle waarden terug naar VVT-defaults' : 'Reset all values to VVT defaults'}
                className="inline-flex items-center gap-1 rounded border border-surface-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-careup-400 hover:text-careup-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <ModeToggle mode={mode} onChange={setMode} copy={t.app} />
              <LanguageToggle locale={locale} onChange={setLocale} copy={t.language} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-surface-line bg-white no-print">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="heading-display text-3xl sm:text-4xl">
            {t.app.heroTitle}
          </h1>
          <p className="mt-2 max-w-3xl text-ink-soft">
            {t.app.heroText}
          </p>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Linker kolom: inputs (op mobiel ONDER de resultaten) */}
          <div className="order-2 space-y-5 lg:order-1 lg:col-span-7">
            {/* Snel-laden scenario's */}
            <ScenarioPresets onLoad={handleLoadScenario} />

            {/* Organisatie */}
            <section className="group-card">
              <h2 className="font-heading text-lg font-semibold text-careup-900">{t.app.organization}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  type="text"
                  label={t.app.organizationName}
                  value={inputs.organisatieNaam}
                  onChange={(v) => setI('organisatieNaam', v)}
                  placeholder={t.app.organizationPlaceholder}
                  hint={t.app.organizationHint}
                  locale={locale}
                />
                <div>
                  <InputField
                    type="select"
                    label={t.app.organizationType}
                    value={inputs.typeOrganisatie}
                    onChange={handleTypeChange}
                    options={organizationTypeOptions(locale)}
                    hint={BRANCHE_OMSCHRIJVING[inputs.typeOrganisatie]}
                    locale={locale}
                  />
                  {branchePresetApplied && (
                    <p className="mt-1 text-xs font-medium text-savings">
                      {locale === 'nl' ? '✓ Aannames aangepast aan' : '✓ Assumptions adjusted for'} {inputs.typeOrganisatie}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? locale === 'nl'
                        ? 'Aantal studenten zorg-/welzijnsopleiding'
                        : 'Number of healthcare/social care students'
                      : t.app.employeesLabel
                  }
                  value={inputs.aantalMedewerkers}
                  onChange={handleAantalChange}
                  min={1}
                  max={5000}
                  step={1}
                  format="number"
                  unit=""
                  locale={locale}
                />
              </div>
            </section>

            {/* Huidige kosten */}
            <section className="group-card">
              <h2 className="font-heading text-lg font-semibold text-careup-900">{t.app.currentCosts}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {t.app.currentCostsHint}
              </p>
              <div className="mt-4 space-y-5">
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? locale === 'nl'
                        ? `Skillslab-onderhoud/abonnement per ${persoonsLabel} per jaar`
                        : `Skills lab maintenance/subscription per ${persoonsLabel} per year`
                      : locale === 'nl'
                        ? `Skillslab-kosten per ${persoonsLabel} per jaar`
                        : `Skills lab costs per ${persoonsLabel} per year`
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
                      ? locale === 'nl'
                        ? 'Eigen skillslab onderhoud, materialen-abonnement of huur per student per jaar. Voor zorgopleidingen typisch €60-€120/student.'
                        : 'Own skills lab maintenance, materials subscription or rental per student per year. For healthcare education typically €60-€120/student.'
                      : locale === 'nl'
                        ? 'Jaarabonnement of toegang tot fysieke skillslab. Catharina Ziekenhuis €61,50, TMI bijscholing €229,95. Branchegemiddelde NL 2025-2026 ~€125 voor VVT, hoger voor ziekenhuis.'
                        : 'Annual subscription or access to a physical skills lab. Catharina Hospital €61.50, TMI training €229.95. Dutch sector average 2025-2026 ~€125 for VVT, higher for hospitals.'
                  }
                  realisticMax={isOnderwijs ? 150 : 250}
                  hint=""
                  locale={locale}
                />
                {!bestuurderModus && (
                  <div className="space-y-5">
                {!isOnderwijs && (
                  <>
                <InputField
                  type="slider"
                  label={locale === 'nl' ? 'Reistijd skillslab-bezoeken (uren per medewerker per jaar)' : 'Travel time for skills lab visits (hours per employee per year)'}
                  value={inputs.verlorenUren}
                  onChange={(v) => setI('verlorenUren', v)}
                  min={0}
                  max={12}
                  step={0.5}
                  format="number"
                  unit={t.app.hourUnit}
                  tooltip={locale === 'nl' ? 'Alleen reistijd + wachttijd + administratie rond fysieke skillslab-sessies. Hoger voor thuiszorg (~3-5u), lager voor organisaties met intern lab (~1-2u). Bijscholingsdagen tellen apart mee.' : 'Only travel time, waiting time and administration around physical skills lab sessions. Higher for home care (~3-5h), lower for organizations with an internal lab (~1-2h). Training days are counted separately.'}
                  realisticMax={8}
                  warningMessage={locale === 'nl' ? 'Meer dan 8 uur reistijd/jaar is hoger dan gangbaar — alleen bijscholingsdagen tellen apart mee.' : 'More than 8 travel hours/year is above the usual range; training days are counted separately.'}
                  locale={locale}
                />
                <InputField
                  type="slider"
                  label={locale === 'nl' ? 'Reiskosten per medewerker per jaar' : 'Travel costs per employee per year'}
                  value={inputs.reiskostenPerMedewerker}
                  onChange={(v) => setI('reiskostenPerMedewerker', v)}
                  min={0}
                  max={250}
                  step={5}
                  format="euro"
                  unit="€"
                  tooltip={locale === 'nl' ? 'Reiskostenvergoeding voor skillslab- en bijscholingsbezoeken. CAO-norm €0,23/km. Voorbeeld: 4 bezoeken × 65 km retour = €60/jr. VVT/thuiszorg hoger door verspreide locaties; ziekenhuis lager door intern lab.' : 'Travel reimbursement for skills lab and training visits. CAO norm €0.23/km. Example: 4 visits x 65 km return = €60/year. VVT/home care higher due to distributed locations; hospitals lower due to internal labs.'}
                  realisticMax={150}
                  locale={locale}
                />
                <InputField
                  type="slider"
                  label={t.app.hourlyCostLabel}
                  value={inputs.uurtarief}
                  onChange={(v) => setI('uurtarief', v)}
                  min={22}
                  max={60}
                  step={1}
                  format="euro"
                  unit="€"
                  tooltip={locale === 'nl' ? 'Bruto uurloon CAO VVT 2026 (€18-26 voor verpleegkundige niv. 4) + werkgeverslasten ~55% (sociale premies, vakantiegeld, eindejaarsuitkering, ORT). Ziekenhuis-personeel hoger (€42), ZZP-inhuur €45-60.' : 'Gross hourly wage under CAO VVT 2026 (€18-26 for level 4 nurses) + employer costs of about 55%. Hospital staff is higher (€42), freelance hiring €45-60.'}
                  realisticMin={25}
                  realisticMax={50}
                  warningMessage={locale === 'nl' ? 'Werkgeverskosten buiten €25-€50/uur zijn ongebruikelijk voor zorg — controleer of je inclusief werkgeverslasten rekent.' : 'Employer costs outside €25-€50/hour are unusual for healthcare; check that employer costs are included.'}
                  locale={locale}
                />
                  </>
                )}
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? locale === 'nl'
                        ? 'Praktijkuren fysiek skillslab per student per jaar'
                        : 'Physical skills lab practice hours per student per year'
                      : t.app.trainingDaysLabel
                  }
                  value={inputs.bijscholingsdagen}
                  onChange={(v) => setI('bijscholingsdagen', v)}
                  min={0}
                  max={isOnderwijs ? 200 : 3}
                  step={isOnderwijs ? 5 : 0.25}
                  format="number"
                  unit={isOnderwijs ? t.app.hourUnit : t.app.dayUnit}
                  tooltip={
                    isOnderwijs
                      ? locale === 'nl'
                        ? 'Aantal contacturen in fysiek skillslab per student per studiejaar. HBO-V/MBO-zorg typisch 40-80 uur, plus extra voor specialisaties.'
                        : 'Number of contact hours in a physical skills lab per student per academic year. Healthcare programs typically use 40-80 hours, plus extra for specializations.'
                      : t.app.trainingDaysTooltip
                  }
                  locale={locale}
                />
                <InputField
                  type="slider"
                  label={
                    isOnderwijs
                      ? locale === 'nl'
                        ? 'Kostprijs per uur fysiek skillslab (per student)'
                        : 'Cost per physical skills lab hour (per student)'
                      : t.app.trainingCostLabel
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
                      ? locale === 'nl'
                        ? 'Kostprijs per student per uur fysiek skillslab: instructeur (€50/u, ratio ~1:8 = €6/student) + materiaal/verbruik (€8-12/u) + lab-overhead. Default €18 conservatief.'
                        : 'Cost per student per physical skills lab hour: instructor (€50/h, ratio ~1:8 = €6/student) + materials (€8-12/h) + lab overhead. Default €18 is conservative.'
                      : locale === 'nl'
                        ? 'Cursusprijs zelf (excl. salaris). Marktgemiddelde NL: TMI €230 incl. praktijktoets, externe trainer in groepsverband €54-€100, ROC-cursus €200-€300, in-house trainer ~€150.'
                        : 'Course price itself (excluding salary). Dutch market average: TMI €230 incl. practical assessment, external group trainer €54-€100, ROC course €200-€300, in-house trainer ~€150.'
                  }
                  realisticMax={isOnderwijs ? 50 : 300}
                  warningMessage={
                    isOnderwijs
                      ? locale === 'nl'
                        ? 'Boven €50/u skillslab-kostprijs is uitzonderlijk hoog voor zorgopleidingen.'
                        : 'Above €50/h is exceptionally high for healthcare education skills lab costs.'
                      : locale === 'nl'
                        ? 'Cursussen boven €300/dag zijn ongebruikelijk — check of je niet per ongeluk meerdere dagen meerekent.'
                        : 'Courses above €300/day are unusual; check that multiple days are not being counted by accident.'
                  }
                  locale={locale}
                />
                {!isOnderwijs && (
                  <InputField
                    type="slider"
                    label={locale === 'nl' ? 'Werkdaguren doorbetaald per bijscholingsdag' : 'Paid working hours per training day'}
                    value={inputs.urenPerBijscholingsdag}
                    onChange={(v) => setI('urenPerBijscholingsdag', v)}
                    min={4}
                    max={10}
                    step={0.5}
                    format="number"
                    unit={t.app.hourUnit}
                    tooltip={locale === 'nl' ? 'Een hele werkdag bijscholing = 8 uur doorbetaald loon (medewerker werkt niet, maar je betaalt wel salaris). Eventueel + vervangingskosten ZZP. Default 8u — dit is vaak vergeten in ROI-berekeningen.' : 'A full training day = 8 paid hours while the employee is not providing care. Potentially plus replacement costs. Default 8h; this is often forgotten in ROI calculations.'}
                    realisticMin={6}
                    realisticMax={9}
                    locale={locale}
                  />
                )}
                  </div>
                )}
                {bestuurderModus && (
                  <p className="text-xs text-ink-muted">
                    {isOnderwijs
                      ? locale === 'nl'
                        ? 'Praktijkuren-aantal en kostprijs zijn op gemiddeldes voor zorgopleidingen gezet. Schakel naar Sales-modus om deze aan te passen.'
                        : 'Practice hours and cost price are set to healthcare education averages. Switch to Sales mode to adjust them.'
                      : locale === 'nl'
                        ? 'Reiskosten, reistijd, uurtarief en bijscholingsdetails zijn op Nederlandse branchegemiddelden gezet. Schakel naar Sales-modus om deze aan te passen.'
                        : 'Travel costs, travel time, hourly rate and training details are set to Dutch sector averages. Switch to Sales mode to adjust them.'}
                  </p>
                )}
              </div>
            </section>

            {/* CareUp investering — vaste staffel-prijs */}
            <section className="group-card">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-careup-900">{t.app.investment}</h2>
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

              {/* Hoofd: laat het tarief zien dat daadwerkelijk gefactureerd wordt */}
              {individueelGoedkoper ? (
                <div className="mt-3 rounded border border-savings/30 bg-savings-light p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-savings-dark">
                    {locale === 'nl' ? 'Individueel jaarabo — voordeligst voor jouw aantal' : 'Individual annual subscription - cheapest for your number'}
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-serif text-2xl font-semibold text-savings-dark">
                      €{effectievePrijs.toLocaleString('nl-NL', { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-savings-dark">
                      {locale === 'nl' ? 'per jaar' : 'per year'} — €{INDIVIDUEEL_JAARABO.toLocaleString('nl-NL', {
                        minimumFractionDigits: 2,
                      })}/{persoonsLabel} × {inputs.aantalMedewerkers} {persoonsLabelMv}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-savings-dark/80">
                    {locale === 'nl'
                      ? `Voor minder dan 5 ${persoonsLabelMv} is het individuele jaarabo voordeliger dan de instellingstaffel (€${vasteBandPrijs.toLocaleString('nl-NL')} vast). Vanaf 5 ${persoonsLabelMv} schakelt de calculator automatisch over op het instellingstarief.`
                      : `For fewer than 5 ${persoonsLabelMv}, the individual annual subscription is cheaper than the institutional tier (€${vasteBandPrijs.toLocaleString('nl-NL')} fixed). From 5 ${persoonsLabelMv}, the calculator automatically switches to institutional pricing.`}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded border border-savings/30 bg-savings-light p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-savings-dark">
                    {locale === 'nl' ? 'CareUp volumestaffel 2025' : 'CareUp volume tiers 2025'} — {locale === 'nl' ? 'band' : 'tier'} {formatBandLabel(huidigeBand)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-serif text-2xl font-semibold text-savings-dark">
                      €{vasteBandPrijs.toLocaleString('nl-NL')}
                    </span>
                    <span className="text-sm text-savings-dark">
                      {locale === 'nl' ? 'per jaar — vaste licentie' : 'per year - fixed license'} ({inputs.aantalMedewerkers} {persoonsLabelMv})
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-savings-dark/80">
                    {locale === 'nl'
                      ? `Komt neer op €${staffelPrijs.toLocaleString('nl-NL', { maximumFractionDigits: 2 })}/${persoonsLabel}/jaar. Bij ${inputs.aantalMedewerkers + 1} ${persoonsLabelMv} val je in de volgende staffel-band.`
                      : `Equals €${staffelPrijs.toLocaleString('nl-NL', { maximumFractionDigits: 2 })}/${persoonsLabel}/year. At ${inputs.aantalMedewerkers + 1} ${persoonsLabelMv}, you move into the next pricing tier.`}
                  </div>
                </div>
              )}

              {/* Override mogelijkheid voor afwijkende contracten */}
              <div className="mt-3">
                {!heeftOverride ? (
                  <button
                    type="button"
                    onClick={() => setI('careUpLicentieOverride', effectievePrijs)}
                    className="text-xs font-medium text-careup-700 hover:text-careup-800 hover:underline"
                  >
                    {locale === 'nl' ? '+ Eigen contract-tarief invullen (afwijkend van staffel)' : '+ Enter custom contract price (different from tier)'}
                  </button>
                ) : (
                  <div className="rounded border border-careup-200 bg-careup-50 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-careup-800">
                        {locale === 'nl' ? 'Override: eigen contract-tarief' : 'Override: custom contract price'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setI('careUpLicentieOverride', 0)}
                        className="text-xs font-medium text-careup-700 hover:text-careup-800 hover:underline"
                      >
                        {locale === 'nl' ? '↺ terug naar staffel' : '↺ back to tier'}
                      </button>
                    </div>
                    <div className="mt-2">
                      <InputField
                        type="slider"
                        label={locale === 'nl' ? 'Totaal jaarbedrag CareUp-licentie' : 'Total annual CareUp license amount'}
                        value={inputs.careUpLicentieOverride ?? effectievePrijs}
                        onChange={(v) => setI('careUpLicentieOverride', v)}
                        min={Math.max(50, Math.round(effectievePrijs * 0.3))}
                        max={Math.round(Math.max(effectievePrijs, vasteBandPrijs) * 2)}
                        step={Math.max(10, Math.round(effectievePrijs / 50) * 10)}
                        format="euro"
                        unit="€"
                        tooltip={locale === 'nl' ? 'Vul hier het bedrag in dat in jullie offerte van CareUp staat — bijvoorbeeld bij maatwerkafspraken of meerjarige contracten.' : 'Enter the amount from your CareUp quote, for example for custom agreements or multi-year contracts.'}
                        locale={locale}
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
                    {t.app.advanced}
                  </h2>
                  <span className="text-sm font-medium text-careup-600">
                    {advancedOpen ? t.app.hide : t.app.show}
                  </span>
                </button>
                {advancedOpen && (
                  <div className="mt-4 space-y-5">
                    <p className="rounded bg-careup-50 p-3 text-xs text-careup-800">
                      <strong>{locale === 'nl' ? 'Wat vervangt CareUp?' : 'What does CareUp replace?'}</strong>{' '}
                      {locale === 'nl'
                        ? 'CareUp levert V&VN-geaccrediteerde toetsen, tentamens, BIG-herregistratiepunten en certificaten. Medewerkers halen alle benodigde accreditatiepunten voor BIG-herregistratie volledig via CareUp — fysieke bijscholing en skillslab-bezoeken zijn daarmee grotendeels overbodig.'
                        : 'CareUp provides V&VN-accredited assessments, exams, BIG re-registration points and certificates. Employees earn all required accreditation points for BIG re-registration through CareUp, making physical training and skills lab visits largely unnecessary.'}
                      {isOnderwijs && (
                        <>
                          <br />
                          <strong className="block mt-2">{locale === 'nl' ? 'Voor onderwijs ligt dit anders:' : 'For education this is different:'}</strong>
                          {locale === 'nl'
                            ? 'studenten moeten skills voor het eerst leren — fysieke oefening blijft cruciaal, CareUp is aanvulling op practicum.'
                            : 'students are learning skills for the first time, so physical practice remains essential and CareUp supplements the practical training.'}
                        </>
                      )}
                    </p>
                    <InputField
                      type="slider"
                      label={locale === 'nl' ? 'Reductie reistijd skillslab-bezoeken' : 'Reduction in travel time for skills lab visits'}
                      value={Math.round(inputs.reductieVerlorenUren * 100)}
                      onChange={(v) => setI('reductieVerlorenUren', v / 100)}
                      min={0}
                      max={100}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip={locale === 'nl' ? 'Medewerkers oefenen en toetsen op werkplek of thuis via CareUp — reistijd naar skillslab of bijscholingslocatie vervalt volledig.' : 'Employees practice and take assessments at work or at home via CareUp, removing travel time to skills lab or training locations.'}
                      locale={locale}
                    />
                    <InputField
                      type="slider"
                      label={t.app.skillslabReduction}
                      value={Math.round(inputs.reductieSkillslab * 100)}
                      onChange={(v) => setI('reductieSkillslab', v / 100)}
                      min={0}
                      max={100}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip={locale === 'nl' ? 'CareUp neemt V&VN-geaccrediteerde toetsen en tentamens af — alle benodigde accreditatiepunten worden bijgeschreven in het V&VN Kwaliteitsregister. Fysieke skillslab-abonnementen zijn daarmee niet meer nodig.' : 'CareUp handles V&VN-accredited assessments and exams; all required accreditation points are added to the V&VN Quality Register. Physical skills lab subscriptions are therefore no longer needed.'}
                      locale={locale}
                    />
                    <InputField
                      type="slider"
                      label={t.app.trainingReduction}
                      value={Math.round(inputs.reductieBijscholing * 100)}
                      onChange={(v) => setI('reductieBijscholing', v / 100)}
                      min={0}
                      max={100}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip={locale === 'nl' ? 'CareUp dekt theorie, toetsen en BIG-herregistratiepunten volledig via V&VN-accreditatie. Externe bijscholingsdagen — inclusief de doorbetaalde verloren werkdag — vervallen grotendeels.' : 'CareUp fully covers theory, assessments and BIG re-registration points through V&VN accreditation. External training days, including paid lost workdays, largely disappear.'}
                      locale={locale}
                    />
                    <InputField
                      type="slider"
                      label={locale === 'nl' ? 'Reductie reiskosten' : 'Reduction in travel costs'}
                      value={Math.round(inputs.reductieReiskosten * 100)}
                      onChange={(v) => setI('reductieReiskosten', v / 100)}
                      min={0}
                      max={100}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip={locale === 'nl' ? 'Omdat medewerkers niet meer naar skillslab of externe bijscholing reizen, vervalt de reiskostenvergoeding nagenoeg volledig.' : 'Because employees no longer travel to skills lab or external training, travel reimbursement almost fully disappears.'}
                      locale={locale}
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
                    {t.app.showCalculations}
                  </h2>
                  <span className="text-sm font-medium text-careup-600">
                    {showCalc ? t.app.hide : t.app.show}
                  </span>
                </button>
                {showCalc && <CalculationBreakdown inputs={inputs} r={r} locale={locale} copy={t.calculations} />}
              </section>
            )}
          </div>

          {/* Rechter kolom: results (op mobiel BOVEN de inputs voor directe feedback) */}
          <aside className="order-1 lg:order-2 lg:col-span-5">
            <div className="lg:sticky lg:top-6 space-y-4">
              <ResultsPanel r={r} inputs={inputs} bestuurderModus={bestuurderModus} copy={t.results} />

              {/* Demo CTA — lead conversie */}
              <DemoCTA besparing={r.besparing} organisatieNaam={inputs.organisatieNaam} />

              {/* Actieknoppen */}
              <div className="grid grid-cols-2 gap-2 no-print">
                <button
                  onClick={() => exportToExcel(inputs, r, locale)}
                  className="btn-secondary justify-center"
                >
                  <Download className="h-4 w-4" /> Excel
                </button>
                <button onClick={() => window.print()} className="btn-secondary justify-center">
                  <Printer className="h-4 w-4" /> PDF
                </button>
                <ShareButton inputs={inputs} />
                <EmailButton inputs={inputs} r={r} />
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ + Bronnen accordeon — onderaan voor wie meer wil weten */}
        <div className="mt-6 space-y-4">
          <FAQAccordion />
          <BronnenAccordion />
        </div>

        {/* Disclaimer */}
        <footer className="mt-12 border-t border-surface-line pt-6 text-xs text-ink-muted no-print">
          <p className="max-w-4xl">
            <strong className="text-ink">{t.app.disclaimerLabel}</strong>{' '}
            {locale === 'nl'
              ? 'Deze calculator geeft een indicatie op basis van Nederlandse branchegemiddelden 2025-2026. De werkelijke besparing varieert per organisatie. Wil je dit valideren? Vraag een '
              : 'This calculator provides an estimate based on Dutch sector averages for 2025-2026. Actual savings vary by organization. Want to validate this? Request a '}
            <a href="https://careup.online/organisatie-demo/" target="_blank" rel="noreferrer" className="font-medium text-careup-700 hover:underline">
              {locale === 'nl' ? 'gratis 30-dagen demo' : 'free 30-day demo'}
            </a>
            {locale === 'nl' ? ' aan en test CareUp met je eigen team.' : ' and test CareUp with your own team.'}
          </p>
          <p className="mt-3">
            {t.app.footerText}
          </p>
        </footer>
      </main>
    </div>
  );
}

const ModeToggle = ({
  mode,
  onChange,
  copy,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  copy: AppCopy;
}) => (
  <div className="inline-flex items-center rounded border border-surface-line bg-surface-panel p-1">
    <ToggleBtn active={mode === 'sales'} onClick={() => onChange('sales')} icon={<Briefcase className="h-3.5 w-3.5" />}>
      {copy.salesMode}
    </ToggleBtn>
    <ToggleBtn active={mode === 'bestuurder'} onClick={() => onChange('bestuurder')} icon={<Users2 className="h-3.5 w-3.5" />}>
      {copy.executiveMode}
    </ToggleBtn>
  </div>
);

const LanguageToggle = ({
  locale,
  onChange,
  copy,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  copy: LanguageCopy;
}) => (
  <div className="inline-flex items-center rounded border border-surface-line bg-surface-panel p-1" aria-label={copy.label}>
    <ToggleBtn active={locale === 'nl'} onClick={() => onChange('nl')} icon={<Languages className="h-3.5 w-3.5" />}>
      {copy.nl}
    </ToggleBtn>
    <ToggleBtn active={locale === 'en'} onClick={() => onChange('en')} icon={<Languages className="h-3.5 w-3.5" />}>
      {copy.en}
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
  locale,
  copy,
}: {
  inputs: CalculatorInputs;
  r: ReturnType<typeof calculate>;
  locale: Locale;
  copy: CalculationCopy;
}) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <div className="mt-4 space-y-3 text-sm text-ink-soft">
      <div className="rounded bg-surface-panel p-3">
        <div className="font-semibold text-ink">
          {copy.currentCosts} ({inputs.aantalMedewerkers} {copy.employees})
        </div>
        <ul className="mt-1 space-y-0.5">
          <li>
            {copy.skillslab}: {inputs.aantalMedewerkers} × {fmt(inputs.skillslabPerMedewerker)} = {fmt(r.huidigSkillslab)}
          </li>
          <li>
            {locale === 'nl' ? 'Reistijd' : 'Travel time'}: {inputs.aantalMedewerkers} × {inputs.verlorenUren} u × {fmt(inputs.uurtarief)} = {fmt(r.huidigVerlorenUren)}
          </li>
          <li>
            {locale === 'nl' ? 'Reiskosten' : 'Travel costs'}: {inputs.aantalMedewerkers} × {fmt(inputs.reiskostenPerMedewerker)} = {fmt(r.huidigReiskosten)}
          </li>
          <li>
            {locale === 'nl' ? 'Bijscholing — cursus' : 'Training - course'}: {inputs.aantalMedewerkers} × {inputs.bijscholingsdagen} × {fmt(inputs.kostenPerBijscholingsdag)} = {fmt(r.huidigBijscholingCursus)}
          </li>
          <li>
            {locale === 'nl' ? 'Bijscholing — verloren werkdag' : 'Training - lost workday'}: {inputs.aantalMedewerkers} × {inputs.bijscholingsdagen} × {inputs.urenPerBijscholingsdag} u × {fmt(inputs.uurtarief)} = {fmt(r.huidigBijscholingVerlorenDag)}
          </li>
          <li className="pt-1 font-semibold text-ink">{copy.totalCurrentCosts}: {fmt(r.huidigeKosten)}</li>
        </ul>
      </div>
      <div className="rounded bg-careup-50 p-3">
        <div className="font-semibold text-careup-900">{copy.withCareUp}</div>
        <ul className="mt-1 space-y-0.5">
          <li>
            {copy.license} ({locale === 'nl' ? 'vaste staffel-prijs voor' : 'fixed tier price for'} {inputs.aantalMedewerkers} {copy.employees}): {fmt(r.careUpLicentie)}
          </li>
          <li>
            {copy.remainingSkillslab} ({Math.round((1 - inputs.reductieSkillslab) * 100)}%): {fmt(r.restSkillslab)}
          </li>
          <li>
            {locale === 'nl' ? 'Resterende reistijd' : 'Remaining travel time'} ({Math.round((1 - inputs.reductieVerlorenUren) * 100)}%): {fmt(r.restVerlorenUren)}
          </li>
          <li>
            {locale === 'nl' ? 'Resterende reiskosten' : 'Remaining travel costs'} ({Math.round((1 - inputs.reductieReiskosten) * 100)}%): {fmt(r.restReiskosten)}
          </li>
          <li>
            {copy.remainingTraining} ({Math.round((1 - inputs.reductieBijscholing) * 100)}%): {fmt(r.restBijscholing)}
          </li>
          <li className="pt-1 font-semibold text-careup-900">{copy.totalWithCareUp}: {fmt(r.metCareUpKosten)}</li>
        </ul>
      </div>
    </div>
  );
};
