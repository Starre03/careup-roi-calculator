import { Building2, Hospital, GraduationCap, Heart } from 'lucide-react';
import type { CalculatorInputs } from '../lib/calculations';
import { DEFAULTS } from '../lib/calculations';
import { BRANCHE_PRESETS } from '../lib/branchePresets';
import { careUpVolumeStaffel } from '../lib/pricing';

interface Scenario {
  label: string;
  type: keyof typeof BRANCHE_PRESETS;
  aantal: number;
  icon: typeof Building2;
  beschrijving: string;
}

const SCENARIOS: Scenario[] = [
  {
    label: 'VVT — 250 medewerkers',
    type: 'VVT',
    aantal: 250,
    icon: Heart,
    beschrijving: 'Verpleging, verzorging & thuiszorg',
  },
  {
    label: 'Ziekenhuis — 1.500 medewerkers',
    type: 'Ziekenhuis',
    aantal: 1500,
    icon: Hospital,
    beschrijving: 'Algemeen of academisch ziekenhuis',
  },
  {
    label: 'Gehandicaptenzorg — 400 medewerkers',
    type: 'Gehandicaptenzorg',
    aantal: 400,
    icon: Building2,
    beschrijving: 'Verspreide woonvoorzieningen',
  },
  {
    label: 'Onderwijs — 400 studenten',
    type: 'Onderwijsinstelling',
    aantal: 400,
    icon: GraduationCap,
    beschrijving: 'HBO-V / MBO-zorgopleiding',
  },
];

interface Props {
  onLoad: (inputs: CalculatorInputs) => void;
}

/**
 * Quick-load knoppen — laden in één klik een compleet scenario.
 * Handig voor sales-demos en als snel startpunt voor prospects.
 */
export const ScenarioPresets = ({ onLoad }: Props) => {
  const apply = (s: Scenario) => {
    const preset = BRANCHE_PRESETS[s.type];
    const inputs: CalculatorInputs = {
      ...DEFAULTS,
      typeOrganisatie: s.type,
      aantalMedewerkers: s.aantal,
      ...preset,
      careUpPrijsPerGebruiker: careUpVolumeStaffel(s.aantal),
      careUpLicentieOverride: 0,
    };
    onLoad(inputs);
  };

  return (
    <div className="rounded border border-careup-200 bg-careup-50/50 p-4 no-print">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-careup-800">
        Snel laden — voorbeeldscenario's
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SCENARIOS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => apply(s)}
              className="group flex items-start gap-2.5 rounded border border-surface-line bg-white px-3 py-2.5 text-left transition-all hover:border-careup-400 hover:shadow-soft"
            >
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-careup-600 group-hover:text-careup-700" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink group-hover:text-careup-800">
                  {s.label}
                </div>
                <div className="text-xs text-ink-muted">{s.beschrijving}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
