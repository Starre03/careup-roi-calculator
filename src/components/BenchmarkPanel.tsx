import { TrendingUp, Minus, ArrowDown, ArrowUp } from 'lucide-react';
import type { CalculatorInputs, CalculatorResults } from '../lib/calculations';
import { calculate } from '../lib/calculations';
import { BRANCHE_PRESETS } from '../lib/branchePresets';
import { careUpVolumeStaffel } from '../lib/pricing';
import { formatEuro } from '../lib/formatters';

interface Props {
  inputs: CalculatorInputs;
  r: CalculatorResults;
}

/**
 * Benchmark — vergelijkt jouw scenario met de branche-default voor dezelfde
 * organisatie-grootte. Geeft de prospect context: "zit je hoger of lager?"
 */
export const BenchmarkPanel = ({ inputs, r }: Props) => {
  const preset = BRANCHE_PRESETS[inputs.typeOrganisatie] ?? BRANCHE_PRESETS.Anders;

  // Branche-default scenario: zelfde aantal medewerkers, alle defaults uit preset
  const benchmarkInputs: CalculatorInputs = {
    ...inputs,
    ...preset,
    careUpPrijsPerGebruiker: careUpVolumeStaffel(inputs.aantalMedewerkers),
  };
  const benchmark = calculate(benchmarkInputs);

  const huidigDelta = benchmark.huidigPerMedewerker > 0
    ? ((r.huidigPerMedewerker - benchmark.huidigPerMedewerker) / benchmark.huidigPerMedewerker) * 100
    : 0;

  const besparingDelta = benchmark.besparing > 0
    ? ((r.besparing - benchmark.besparing) / benchmark.besparing) * 100
    : 0;

  const persoonsLabel = inputs.typeOrganisatie === 'Onderwijsinstelling' ? 'student' : 'medewerker';

  // Threshold: meer dan 10% afwijking is meldwaardig
  const significantHuidig = Math.abs(huidigDelta) >= 5;
  const significantBesparing = Math.abs(besparingDelta) >= 5;

  return (
    <div className="group-card">
      <h3 className="text-base font-semibold text-careup-900 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" /> Vergelijking met branche-gemiddelde
      </h3>
      <p className="mt-1 text-xs text-ink-muted">
        Hoe verhoudt jouw scenario zich tot een gemiddelde {inputs.typeOrganisatie} van{' '}
        {inputs.aantalMedewerkers} {persoonsLabel}s?
      </p>

      <div className="mt-3 space-y-2.5">
        {/* Huidige kosten per medewerker */}
        <div className="rounded bg-surface-panel px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-ink-muted">Huidige kosten / {persoonsLabel}</span>
            <span className="font-semibold tabular-nums text-ink">
              {formatEuro(r.huidigPerMedewerker)} / {formatEuro(benchmark.huidigPerMedewerker)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <DeltaBadge value={huidigDelta} significant={significantHuidig} invertColors />
            <span className="text-ink-muted">
              {significantHuidig
                ? huidigDelta > 0
                  ? 'Je betaalt meer dan gemiddeld — ruimte voor optimalisatie'
                  : 'Je zit onder branche-gemiddelde'
                : 'In lijn met branche-gemiddelde'}
            </span>
          </div>
        </div>

        {/* Besparing */}
        <div className="rounded bg-savings-light px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-savings-dark">Jaarlijkse besparing</span>
            <span className="font-semibold tabular-nums text-savings-dark">
              {formatEuro(r.besparing)} / {formatEuro(benchmark.besparing)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <DeltaBadge value={besparingDelta} significant={significantBesparing} />
            <span className="text-savings-dark">
              {significantBesparing
                ? besparingDelta > 0
                  ? `Hoger besparingspotentieel dan vergelijkbare ${inputs.typeOrganisatie}`
                  : `Lager dan branchegemiddelde — check de aannames`
                : `Vergelijkbaar met andere ${inputs.typeOrganisatie}-organisaties van deze grootte`}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Branche-gemiddelde gebaseerd op{' '}
        <span className="font-medium">{inputs.typeOrganisatie}</span> defaults voor{' '}
        {inputs.aantalMedewerkers} {persoonsLabel}s — staffeltarief inbegrepen.
      </p>
    </div>
  );
};

const DeltaBadge = ({
  value,
  significant,
  invertColors = false,
}: {
  value: number;
  significant: boolean;
  invertColors?: boolean;
}) => {
  if (!significant) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-line px-2 py-0.5 font-semibold text-ink">
        <Minus className="h-3 w-3" /> ±{Math.abs(value).toFixed(0)}%
      </span>
    );
  }
  const positive = value > 0;
  // invertColors=true → "hoger" = slecht (bv. hogere kosten); positive = rood
  // invertColors=false → "hoger" = goed (bv. hogere besparing); positive = groen
  const goodIsPositive = !invertColors;
  const isGood = positive === goodIsPositive;
  const cls = isGood
    ? 'bg-savings-light text-savings-dark'
    : 'bg-loss-light text-loss';
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${cls}`}>
      {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(0)}%
    </span>
  );
};
