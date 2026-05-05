/**
 * CareUp ROI-calculator
 * ---------------------
 * Interactieve calculator voor zorgorganisaties die overwegen over te stappen
 * van fysiek skillslab + traditionele bijscholing naar CareUp Virtual Learning Lab.
 *
 * VERWACHTE TEST-UITKOMSTEN MET DEFAULTS
 * (Skillslab €110, Verloren uren 3 × €32 = €96, Bijscholing 1 × €175 = €175,
 *  CareUp €27,50, Reducties: uren 50%, skillslab 30%, bijscholing 40%)
 *
 * Per medewerker:
 *   Huidig:   €381    (€110 + €96 + €175)
 *   CareUp:   €257,50 (€27,50 licentie + €77 + €48 + €105)
 *   Besparing: €123,50
 *   ROI:      ~449% op licentie-investering
 *
 * Per organisatie (multiplicatief schaalt lineair):
 *   100 medewerkers:  Huidig €38.100  | CareUp €25.750  | Besparing €12.350  | ROI 449%
 *   500 medewerkers:  Huidig €190.500 | CareUp €128.750 | Besparing €61.750  | ROI 449%
 *   1500 medewerkers: Huidig €571.500 | CareUp €386.250 | Besparing €185.250 | ROI 449%
 *
 * Opmerking: oorspronkelijke spec noemde "ROI ~620%" maar dat veronderstelt
 * hogere reducties dan de gespecificeerde defaults (50/30/40%). Met de stated
 * defaults landt ROI op ~449%. Sales kan reducties verhogen voor agressievere
 * scenario's; defaults zijn conservatief gehouden.
 */

import { useState, useMemo } from 'react';
import { Download, Printer, Briefcase, Users2 } from 'lucide-react';
import { calculate, DEFAULTS, TYPE_ORGANISATIES, type CalculatorInputs } from './lib/calculations';
import { exportToExcel } from './lib/excelExport';
import { InputField } from './components/InputField';
import { ResultsPanel } from './components/ResultsPanel';

type Mode = 'sales' | 'bestuurder';

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULTS);
  const [mode, setMode] = useState<Mode>('sales');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const r = useMemo(() => calculate(inputs), [inputs]);
  const bestuurderModus = mode === 'bestuurder';

  const setI = <K extends keyof CalculatorInputs>(key: K, v: CalculatorInputs[K]) => {
    setInputs((s) => ({ ...s, [key]: v }));
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Header */}
      <header className="border-b border-surface-line bg-white no-print">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Logo-mark */}
              <div className="flex h-9 w-9 items-center justify-center rounded bg-careup-500 text-white">
                <span className="font-heading text-lg font-bold">C</span>
              </div>
              <div>
                <div className="font-heading text-lg font-bold text-careup-900 leading-tight">
                  CareUp <span className="text-careup-500">·</span>{' '}
                  <span className="text-careup-700">Virtual Learning Lab</span>
                </div>
                <div className="text-xs text-ink-muted">ROI-calculator voor zorgorganisaties</div>
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
                <InputField
                  type="select"
                  label="Type organisatie"
                  value={inputs.typeOrganisatie}
                  onChange={(v) => setI('typeOrganisatie', v)}
                  options={TYPE_ORGANISATIES}
                />
              </div>
              <div className="mt-4">
                <InputField
                  type="slider"
                  label="Aantal zorgmedewerkers met voorbehouden handelingen"
                  value={inputs.aantalMedewerkers}
                  onChange={(v) => setI('aantalMedewerkers', Math.round(v))}
                  min={25}
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
                  label="Skillslab-kosten per medewerker per jaar"
                  value={inputs.skillslabPerMedewerker}
                  onChange={(v) => setI('skillslabPerMedewerker', v)}
                  min={0}
                  max={300}
                  step={5}
                  format="euro"
                  unit="€"
                  tooltip="Branchegemiddelde NL 2025. Catharina Ziekenhuis €61,50 jaarabonnement, TMI bijscholing €229,95. Pas aan naar je werkelijke kosten."
                  hint=""
                />
                {!bestuurderModus && (
                  <div className="space-y-5">
                <InputField
                  type="slider"
                  label="Verloren werkuren per medewerker per jaar (door skillslab-planning)"
                  value={inputs.verlorenUren}
                  onChange={(v) => setI('verlorenUren', v)}
                  min={0}
                  max={12}
                  step={0.5}
                  format="number"
                  unit="uur"
                  tooltip="Reistijd, wachttijd en administratie rond fysieke skillslab-sessies. Hoger voor thuiszorg, lager voor organisaties met intern lab."
                />
                <InputField
                  type="slider"
                  label="Werkgeverskosten per uur"
                  value={inputs.uurtarief}
                  onChange={(v) => setI('uurtarief', v)}
                  min={22}
                  max={55}
                  step={1}
                  format="euro"
                  unit="€"
                  tooltip="Bruto uurloon CAO VVT 2026 (€18-26 voor verpleegkundige niveau 4) plus werkgeverslasten ~55% (sociale premies, vakantiegeld, eindejaarsuitkering, ORT). Voor ZZP-inhuur typisch €45-55."
                />
                <InputField
                  type="slider"
                  label="Bijscholingsdagen voorbehouden handelingen per medewerker per jaar"
                  value={inputs.bijscholingsdagen}
                  onChange={(v) => setI('bijscholingsdagen', v)}
                  min={0}
                  max={3}
                  step={0.25}
                  format="number"
                  unit="dag"
                  tooltip="VIG'ers moeten elke 3 jaar opnieuw getoetst worden, plus jaarlijkse opfris in praktijk. Default 1 dag/jaar conservatief."
                />
                <InputField
                  type="slider"
                  label="Kosten per externe bijscholingsdag"
                  value={inputs.kostenPerBijscholingsdag}
                  onChange={(v) => setI('kostenPerBijscholingsdag', v)}
                  min={50}
                  max={400}
                  step={5}
                  format="euro"
                  unit="€"
                  tooltip="Marktgemiddelde NL: TMI €230 incl. praktijk, externe trainer in groepsverband €54-€100, ROC-cursus €200-€300."
                />
                  </div>
                )}
                {bestuurderModus && (
                  <p className="text-xs text-ink-muted">
                    Verloren werkuren, uurtarief en bijscholing zijn op Nederlandse branchegemiddelden gezet. Schakel naar Sales-modus om deze aan te passen.
                  </p>
                )}
              </div>
            </section>

            {/* CareUp investering */}
            <section className="group-card">
              <h2 className="font-heading text-lg font-semibold text-careup-900">Investering in CareUp</h2>
              <div className="mt-4">
                <InputField
                  type="slider"
                  label="Prijs CareUp per gebruiker per jaar"
                  value={inputs.careUpPrijsPerGebruiker}
                  onChange={(v) => setI('careUpPrijsPerGebruiker', v)}
                  min={15}
                  max={50}
                  step={0.5}
                  format="euro"
                  unit="€"
                  tooltip="CareUp instellingstarief vanaf 25 medewerkers, met staffel naar beneden bij grotere volumes."
                />
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
                    <InputField
                      type="slider"
                      label="Reductie verloren werkuren met CareUp"
                      value={Math.round(inputs.reductieVerlorenUren * 100)}
                      onChange={(v) => setI('reductieVerlorenUren', v / 100)}
                      min={20}
                      max={80}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip="Medewerkers oefenen op werkplek of thuis, geen reistijd. Conservatieve aanname."
                    />
                    <InputField
                      type="slider"
                      label="Reductie skillslab-bezoeken"
                      value={Math.round(inputs.reductieSkillslab * 100)}
                      onChange={(v) => setI('reductieSkillslab', v / 100)}
                      min={0}
                      max={70}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip="CareUp vervangt fysiek skillslab niet volledig — praktijktoets blijft nodig. Wel minder oefenmomenten op locatie."
                    />
                    <InputField
                      type="slider"
                      label="Reductie externe bijscholingsdagen"
                      value={Math.round(inputs.reductieBijscholing * 100)}
                      onChange={(v) => setI('reductieBijscholing', v / 100)}
                      min={0}
                      max={70}
                      step={5}
                      format="percent"
                      unit="%"
                      tooltip="Theoretisch deel van bijscholing wordt gedekt door CareUp incl. accreditatie via V&VN."
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
            <div className="lg:sticky lg:top-6">
              <ResultsPanel r={r} bestuurderModus={bestuurderModus} />

              {/* Actieknoppen */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row no-print">
                <button onClick={() => exportToExcel(inputs, r)} className="btn-primary justify-center flex-1">
                  <Download className="h-4 w-4" /> Exporteer naar Excel
                </button>
                <button onClick={() => window.print()} className="btn-secondary justify-center flex-1">
                  <Printer className="h-4 w-4" /> Print / PDF
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Disclaimer */}
        <footer className="mt-12 border-t border-surface-line pt-6 text-xs text-ink-muted">
          <p className="max-w-4xl">
            <strong className="text-ink">Disclaimer:</strong> Deze calculator geeft een indicatie op basis van Nederlandse branchegemiddelden 2025-2026. De werkelijke besparing varieert per organisatie. We raden aan de uitkomst te valideren in een 90-dagen pilot met vaste prijs (€5.950).
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
            Verloren uren: {inputs.aantalMedewerkers} × {inputs.verlorenUren} u × {fmt(inputs.uurtarief)} = {fmt(r.huidigVerlorenUren)}
          </li>
          <li>
            Bijscholing: {inputs.aantalMedewerkers} × {inputs.bijscholingsdagen} × {fmt(inputs.kostenPerBijscholingsdag)} = {fmt(r.huidigBijscholing)}
          </li>
          <li className="pt-1 font-semibold text-ink">Totaal huidige kosten: {fmt(r.huidigeKosten)}</li>
        </ul>
      </div>
      <div className="rounded bg-careup-50 p-3">
        <div className="font-semibold text-careup-900">Met CareUp</div>
        <ul className="mt-1 space-y-0.5">
          <li>
            Licentie: {inputs.aantalMedewerkers} × {fmt(inputs.careUpPrijsPerGebruiker)} = {fmt(r.careUpLicentie)}
          </li>
          <li>
            Resterend skillslab ({Math.round((1 - inputs.reductieSkillslab) * 100)}%): {fmt(r.restSkillslab)}
          </li>
          <li>
            Resterende verloren uren ({Math.round((1 - inputs.reductieVerlorenUren) * 100)}%): {fmt(r.restVerlorenUren)}
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
