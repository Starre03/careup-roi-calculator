import { AlertTriangle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface BaseProps {
  label: string;
  tooltip?: string;
  hint?: string;
}

interface SliderProps extends BaseProps {
  type: 'slider';
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: 'euro' | 'number' | 'percent';
  /** Toont een waarschuwing als value buiten deze realistische range valt */
  realisticMin?: number;
  realisticMax?: number;
  warningMessage?: string;
}

interface NumberInputProps extends BaseProps {
  type: 'number';
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface TextProps extends BaseProps {
  type: 'text';
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

interface SelectProps extends BaseProps {
  type: 'select';
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

type Props = SliderProps | NumberInputProps | TextProps | SelectProps;

const formatValue = (v: number, format: SliderProps['format']) => {
  if (format === 'euro')
    return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
  if (format === 'percent') return `${v}`;
  return new Intl.NumberFormat('nl-NL').format(v);
};

export const InputField = (props: Props) => {
  const labelEl = (
    <label className="label-base mb-1 flex items-center">
      <span>{props.label}</span>
      {props.tooltip && <Tooltip text={props.tooltip} />}
    </label>
  );

  if (props.type === 'text') {
    return (
      <div>
        {labelEl}
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className="input-base"
        />
        {props.hint && <p className="hint-base mt-1">{props.hint}</p>}
      </div>
    );
  }

  if (props.type === 'select') {
    return (
      <div>
        {labelEl}
        <select
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="input-base cursor-pointer"
        >
          {props.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {props.hint && <p className="hint-base mt-1">{props.hint}</p>}
      </div>
    );
  }

  if (props.type === 'number') {
    return (
      <div>
        {labelEl}
        <div className="flex items-center gap-2">
          {props.unit && <span className="text-sm text-ink-muted">{props.unit}</span>}
          <input
            type="number"
            value={props.value}
            min={props.min}
            max={props.max}
            step={props.step}
            onChange={(e) => props.onChange(parseFloat(e.target.value) || 0)}
            className="input-base"
          />
        </div>
        {props.hint && <p className="hint-base mt-1">{props.hint}</p>}
      </div>
    );
  }

  // slider
  return (
    <div>
      {labelEl}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={props.value}
          onChange={(e) => props.onChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <div className="flex items-center gap-1 rounded border border-surface-line bg-surface-alt px-2 py-1">
          {props.unit && props.format === 'euro' && (
            <span className="text-xs text-ink-muted">€</span>
          )}
          <input
            type="number"
            value={props.value}
            min={props.min}
            max={props.max}
            step={props.step ?? 1}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              if (!isNaN(n)) props.onChange(n);
            }}
            className="w-20 bg-transparent text-right text-sm font-medium text-ink outline-none"
          />
          {props.unit && props.format === 'percent' && (
            <span className="text-xs text-ink-muted">%</span>
          )}
          {props.unit && props.format === 'number' && props.unit !== '' && (
            <span className="text-xs text-ink-muted">{props.unit}</span>
          )}
        </div>
      </div>
      {props.hint && (
        <p className="hint-base mt-1">
          Typische range: {formatValue(props.min, props.format)}–{formatValue(props.max, props.format)}
          {props.format === 'euro' ? ' €' : ''} {props.hint && `· ${props.hint}`}
        </p>
      )}
      {(() => {
        const tooLow = props.realisticMin !== undefined && props.value < props.realisticMin;
        const tooHigh = props.realisticMax !== undefined && props.value > props.realisticMax;
        if (!tooLow && !tooHigh) return null;
        const fmt = (n: number) =>
          props.format === 'euro'
            ? `€${formatValue(n, props.format)}`
            : props.format === 'percent'
              ? `${n}%`
              : formatValue(n, props.format);
        const defaultMsg = tooHigh
          ? `Deze waarde ligt boven het Nederlandse branche-gemiddelde (typisch ${fmt(props.realisticMax!)} of lager).`
          : `Deze waarde ligt onder het Nederlandse branche-gemiddelde (typisch ${fmt(props.realisticMin!)} of hoger).`;
        return (
          <p className="mt-1.5 flex items-start gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{props.warningMessage ?? defaultMsg}</span>
          </p>
        );
      })()}
    </div>
  );
};
