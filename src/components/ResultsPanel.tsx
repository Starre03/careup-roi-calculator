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
import type { ResultsCopy } from '../lib/i18n';
import { CountUp } from './CountUp';

interface Props {
  r: CalculatorResults;
  inputs: CalculatorInputs;
  bestuurderModus: boolean;
  copy: ResultsCopy;
}

export const ResultsPanel = ({ r, inputs, bestuurderModus, copy }: Props) => {
  const positief = r.besparing > 0;
  const accentColor = positief ? '#2d6e3e' : '#a83232';

  const chartData = [
    { naam: copy.currentSituation, kosten: r.huidigeKosten },
    { naam: copy.withCareUp, kosten: r.metCareUpKosten },
  ];

  return (
    <div className="space-y-4">
      {/* Hoofdkaart — besparing */}
      <div className="group-card">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted">
          {positief ? <TrendingUp className="h-4 w-4 text-savings" /> : <TrendingDown className="h-4 w-4 text-loss" />}
          <span>{positief ? copy.annualSavings : copy.annualDeficit}</span>
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
            <span className="text-ink-muted">{copy.roiOnLicense}: </span>
            <span className="font-semibold" style={{ color: accentColor }}>
              <CountUp value={r.roi} format={(n) => formatPercent(n, 0)} />
            </span>
          </div>
          {r.terugverdientijdMaanden !== null && (
            <div>
              <span className="text-ink-muted">{copy.payback}: </span>
              <span className="font-semibold text-ink">
                <CountUp
                  value={r.terugverdientijdMaanden}
                  format={(n) => `${n.toFixed(1)} ${copy.months}`}
                />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Kosten-vergelijking + chart */}
      <div className="group-card">
        <h3 className="text-base font-semibold text-careup-900">{copy.costsPerYear}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded bg-surface-panel px-3 py-2">
            <div className="text-xs text-ink-muted">{copy.currentSituation}</div>
            <div className="mt-1 font-serif text-lg font-semibold text-ink">
              <CountUp value={r.huidigeKosten} format={(n) => formatEuro(n)} />
            </div>
          </div>
          <div className="rounded bg-careup-50 px-3 py-2">
            <div className="text-xs text-careup-700">{copy.withCareUp}</div>
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
            <Users className="h-4 w-4" /> {copy.perEmployeePerYear}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-ink-muted">{copy.now}</div>
              <div className="mt-1 font-serif text-lg font-semibold text-ink">
                <CountUp value={r.huidigPerMedewerker} format={(n) => formatEuro(n, 0)} />
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">{copy.withCareUp}</div>
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
            <Wallet className="h-4 w-4" /> {copy.fitsTrainingBudget}
          </h3>
          <div className="mt-2">
            <span className="font-serif text-2xl font-semibold text-careup-700">
              <CountUp value={r.pctScholingsbudget} format={(n) => formatPercent(n, 1)} />
            </span>
            <span className="ml-2 text-sm text-ink-muted">{copy.ofLegalBudget}</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            {copy.legalBudget}: {formatEuro(r.scholingsbudgetTotaal)} {copy.perYear} ({copy.caoReference})
          </p>
        </div>
      )}

      {/* Compliance-blok — altijd zichtbaar */}
      <div className="group-card">
        <h3 className="text-base font-semibold text-careup-900 flex items-center gap-2">
          <BadgeCheck className="h-4 w-4" /> {copy.benefitsTitle}
        </h3>
        <ul className="mt-3 space-y-3 text-sm text-ink-soft">
          <li className="flex gap-2">
            <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-careup-500" />
            <span>
              <strong className="text-ink">{copy.igjTitle}</strong> {copy.igjText}
            </span>
          </li>
          <li className="flex gap-2">
            <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-careup-500" />
            <span>
              <strong className="text-ink">{copy.bigTitle}</strong> {copy.bigText}
            </span>
          </li>
          <li className="flex gap-2">
            <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-careup-500" />
            <span>
              <strong className="text-ink">{copy.wkkgzTitle}</strong> {copy.wkkgzText}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
