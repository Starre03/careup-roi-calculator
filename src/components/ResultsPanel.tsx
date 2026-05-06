import { TrendingUp, TrendingDown, Users, Award, BadgeCheck, Wallet } from 'lucide-react';
import { MultiYearProjection } from './MultiYearProjection';
import { BenchmarkPanel } from './BenchmarkPanel';
import { CO2Panel } from './CO2Panel';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  CartesianGrid,
} from 'recharts';
import type { CalculatorInputs, CalculatorResults } from '../lib/calculations';
import { formatEuro, formatPercent } from '../lib/formatters';
import { CountUp } from './CountUp';

interface Props {
  r: CalculatorResults;
  inputs: CalculatorInputs;
  bestuurderModus: boolean;
}

export const ResultsPanel = ({ r, inputs, bestuurderModus }: Props) => {
  const positief = r.besparing > 0;
  const accentColor = positief ? '#2d6e3e' : '#a83232';

  const chartData = [
    { naam: 'Huidige situatie', kosten: r.huidigeKosten },
    { naam: 'Met CareUp', kosten: r.metCareUpKosten },
  ];

  return (
    <div className="space-y-4">
      {/* Hoofdkaart — besparing */}
      <div className="group-card">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted">
          {positief ? <TrendingUp className="h-4 w-4 text-savings" /> : <TrendingDown className="h-4 w-4 text-loss" />}
          <span>{positief ? 'Jaarlijkse besparing' : 'Jaarlijks tekort'}</span>
        </div>
        <div className="mt-2" style={{ color: accentColor }}>
          <CountUp
            value={Math.abs(r.besparing)}
            format={(n) => formatEuro(n)}
            className="heading-display block text-4xl leading-tight sm:text-5xl"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-ink-muted">ROI op licentie: </span>
            <span className="font-semibold" style={{ color: accentColor }}>
              <CountUp value={r.roi} format={(n) => formatPercent(n, 0)} />
            </span>
          </div>
          {r.terugverdientijdMaanden !== null && (
            <div>
              <span className="text-ink-muted">Terugverdientijd: </span>
              <span className="font-semibold text-ink">
                <CountUp
                  value={r.terugverdientijdMaanden}
                  format={(n) => `${n.toFixed(1)} maanden`}
                />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Kosten-vergelijking + chart */}
      <div className="group-card">
        <h3 className="text-base font-semibold text-careup-900">Kosten per jaar</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded bg-surface-panel px-3 py-2">
            <div className="text-xs text-ink-muted">Huidige situatie</div>
            <div className="mt-1 font-serif text-lg font-semibold text-ink">
              <CountUp value={r.huidigeKosten} format={(n) => formatEuro(n)} />
            </div>
          </div>
          <div className="rounded bg-careup-50 px-3 py-2">
            <div className="text-xs text-careup-700">Met CareUp</div>
            <div className="mt-1 font-serif text-lg font-semibold text-careup-800">
              <CountUp value={r.metCareUpKosten} format={(n) => formatEuro(n)} />
            </div>
          </div>
        </div>
        <div className="mt-4 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
              <XAxis
                dataKey="naam"
                tick={{ fontSize: 11, fill: '#7a8189', fontFamily: 'Roboto' }}
                axisLine={{ stroke: '#eeeeee' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#7a8189', fontFamily: 'Roboto' }}
                tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                axisLine={{ stroke: '#eeeeee' }}
              />
              <RTooltip
                cursor={{ fill: 'rgba(105,200,231,0.08)' }}
                contentStyle={{
                  borderRadius: 4,
                  border: '1px solid #eeeeee',
                  fontSize: 12,
                  fontFamily: 'Roboto',
                }}
                formatter={(v: number) => formatEuro(v)}
              />
              <Bar dataKey="kosten" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#7a8189' : '#69c8e7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!bestuurderModus && (
        <div className="group-card">
          <h3 className="text-base font-semibold text-careup-900 flex items-center gap-2">
            <Users className="h-4 w-4" /> Per medewerker per jaar
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-ink-muted">Nu</div>
              <div className="mt-1 font-serif text-lg font-semibold text-ink">
                <CountUp value={r.huidigPerMedewerker} format={(n) => formatEuro(n, 0)} />
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Met CareUp</div>
              <div className="mt-1 font-serif text-lg font-semibold text-careup-700">
                <CountUp value={r.metCareUpPerMedewerker} format={(n) => formatEuro(n, 0)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {!bestuurderModus && <BenchmarkPanel inputs={inputs} r={r} />}

      <MultiYearProjection r={r} jaren={5} />

      <CO2Panel inputs={inputs} r={r} />

      {!bestuurderModus && (
        <div className="group-card">
          <h3 className="text-base font-semibold text-careup-900 flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Past binnen scholingsbudget
          </h3>
          <div className="mt-2">
            <span className="font-serif text-2xl font-semibold text-careup-700">
              <CountUp value={r.pctScholingsbudget} format={(n) => formatPercent(n, 1)} />
            </span>
            <span className="ml-2 text-sm text-ink-muted">van wettelijk 2% loonsom-budget</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Wettelijk budget: {formatEuro(r.scholingsbudgetTotaal)} per jaar (CAO VVT art. 5.3)
          </p>
        </div>
      )}

      {/* Compliance-blok — altijd zichtbaar */}
      <div className="group-card">
        <h3 className="text-base font-semibold text-careup-900 flex items-center gap-2">
          <BadgeCheck className="h-4 w-4" /> Wat je krijgt naast de besparing
        </h3>
        <ul className="mt-3 space-y-3 text-sm text-ink-soft">
          <li className="flex gap-2">
            <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-careup-500" />
            <span>
              <strong className="text-ink">IGJ-bewijslast:</strong> bij toezicht lever je direct aantoonbaar bekwaamheidsbewijs — toetsresultaten en accreditatiepunten worden automatisch bijgeschreven in het V&VN Kwaliteitsregister.
            </span>
          </li>
          <li className="flex gap-2">
            <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-careup-500" />
            <span>
              <strong className="text-ink">BIG-herregistratie volledig geregeld</strong> — alle benodigde accreditatiepunten worden via CareUp behaald. Een aparte fysieke toets of bijscholingsdag is daarmee niet meer nodig. Medewerkers zien realtime hun punten, certificaten en herregistratie-deadlines.
            </span>
          </li>
          <li className="flex gap-2">
            <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-careup-500" />
            <span>
              <strong className="text-ink">Wkkgz-naleving:</strong> de wet eist dat je kunt aantonen dat medewerkers bekwaam zijn voor risicovolle handelingen. CareUp levert hiervoor volledig bewijs incl. V&VN-geaccrediteerde toetsen, tentamens en bekwaamheidsverklaringen.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
