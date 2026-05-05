import { TrendingUp } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CalculatorResults } from '../lib/calculations';
import { formatEuro } from '../lib/formatters';

interface Props {
  r: CalculatorResults;
  jaren?: number;
}

export const MultiYearProjection = ({ r, jaren = 5 }: Props) => {
  const data = Array.from({ length: jaren }, (_, i) => {
    const jaarIdx = i + 1;
    const cumulatief = r.besparing * jaarIdx;
    return {
      jaar: `Jaar ${jaarIdx}`,
      besparing: Math.round(r.besparing),
      cumulatief: Math.round(cumulatief),
    };
  });

  const totaal = r.besparing * jaren;
  const positief = r.besparing > 0;

  return (
    <div className="group-card">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-careup-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Projectie {jaren} jaar
        </h3>
        <div className="text-right">
          <div className="text-xs text-ink-muted">Totaal {jaren} jaar</div>
          <div
            className="font-serif text-lg font-semibold"
            style={{ color: positief ? '#2d6e3e' : '#a83232' }}
          >
            {formatEuro(Math.abs(totaal))}
          </div>
        </div>
      </div>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
            <XAxis
              dataKey="jaar"
              tick={{ fontSize: 11, fill: '#7a8189', fontFamily: 'Roboto' }}
              axisLine={{ stroke: '#eeeeee' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#7a8189', fontFamily: 'Roboto' }}
              tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
              axisLine={{ stroke: '#eeeeee' }}
            />
            <RTooltip
              cursor={{ fill: 'rgba(105,200,231,0.06)' }}
              contentStyle={{
                borderRadius: 4,
                border: '1px solid #eeeeee',
                fontSize: 12,
                fontFamily: 'Roboto',
              }}
              formatter={(v: number, name: string) => [
                formatEuro(v),
                name === 'besparing' ? 'Besparing dat jaar' : 'Cumulatieve besparing',
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'Roboto', paddingTop: 8 }}
              formatter={(v) => (v === 'besparing' ? 'Per jaar' : 'Cumulatief')}
            />
            <Bar
              dataKey="besparing"
              fill="#69c8e7"
              radius={[3, 3, 0, 0]}
              name="besparing"
            />
            <Line
              type="monotone"
              dataKey="cumulatief"
              stroke="#2d6e3e"
              strokeWidth={2}
              dot={{ r: 4, fill: '#2d6e3e' }}
              name="cumulatief"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
