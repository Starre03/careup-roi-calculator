import { DEFAULTS, type CalculatorInputs } from './calculations';

const KEY_MAP: Array<[keyof CalculatorInputs, string]> = [
  ['organisatieNaam', 'o'],
  ['typeOrganisatie', 't'],
  ['aantalMedewerkers', 'n'],
  ['skillslabPerMedewerker', 'sl'],
  ['verlorenUren', 'u'],
  ['uurtarief', 'ut'],
  ['bijscholingsdagen', 'bd'],
  ['kostenPerBijscholingsdag', 'kpd'],
  ['careUpPrijsPerGebruiker', 'cup'],
  ['careUpLicentieOverride', 'col'],
  ['reductieVerlorenUren', 'ru'],
  ['reductieSkillslab', 'rs'],
  ['reductieBijscholing', 'rb'],
];

export const encodeInputsToQuery = (inputs: CalculatorInputs): string => {
  const params = new URLSearchParams();
  for (const [k, short] of KEY_MAP) {
    const v = inputs[k];
    const def = DEFAULTS[k];
    if (typeof v === 'number') {
      if (v !== def) params.set(short, String(Number(v.toFixed(3))));
    } else if (typeof v === 'string') {
      if (v && v !== def) params.set(short, v);
    }
  }
  return params.toString();
};

export const decodeQueryToInputs = (search: string): Partial<CalculatorInputs> => {
  const params = new URLSearchParams(search);
  const out: Partial<CalculatorInputs> = {};
  for (const [k, short] of KEY_MAP) {
    const v = params.get(short);
    if (v === null) continue;
    if (typeof DEFAULTS[k] === 'number') {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) (out as Record<string, unknown>)[k] = n;
    } else {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
};

export const writeInputsToUrl = (inputs: CalculatorInputs): void => {
  const qs = encodeInputsToQuery(inputs);
  const url = `${window.location.pathname}${qs ? '?' + qs : ''}${window.location.hash}`;
  window.history.replaceState(null, '', url);
};

export const buildShareUrl = (inputs: CalculatorInputs): string => {
  const qs = encodeInputsToQuery(inputs);
  const base = `${window.location.origin}${window.location.pathname}`;
  return qs ? `${base}?${qs}` : base;
};
