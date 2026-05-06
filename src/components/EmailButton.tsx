import { Mail } from 'lucide-react';
import type { CalculatorInputs, CalculatorResults } from '../lib/calculations';
import { buildShareUrl } from '../lib/urlState';
import { formatEuro, formatPercent } from '../lib/formatters';

interface Props {
  inputs: CalculatorInputs;
  r: CalculatorResults;
}

export const EmailButton = ({ inputs, r }: Props) => {
  const handleClick = () => {
    const url = buildShareUrl(inputs);
    const naam = inputs.organisatieNaam || inputs.typeOrganisatie;
    const subject = `CareUp ROI-rapport — ${naam}`;
    const body = [
      `Berekening van wat ${naam} bespaart met CareUp Virtual Learning Lab:`,
      ``,
      `• Jaarlijkse besparing: ${formatEuro(r.besparing)}`,
      `• ROI op licentie: ${formatPercent(r.roi)}`,
      r.terugverdientijdMaanden !== null
        ? `• Terugverdientijd: ${r.terugverdientijdMaanden.toFixed(1)} maanden`
        : ``,
      `• Cumulatieve besparing 5 jaar: ${formatEuro(r.besparing * 5)}`,
      ``,
      `Open de calculator met deze instellingen:`,
      url,
      ``,
      `Plan een gratis 30-dagen demo: https://careup.online/organisatie-demo/`,
    ]
      .filter(Boolean)
      .join('\n');

    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body,
    )}`;
    window.location.href = mailto;
  };

  return (
    <button onClick={handleClick} className="btn-secondary justify-center" type="button">
      <Mail className="h-4 w-4" /> Email
    </button>
  );
};
