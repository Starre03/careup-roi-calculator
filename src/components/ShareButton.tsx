import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import type { CalculatorInputs } from '../lib/calculations';
import { buildShareUrl } from '../lib/urlState';

export const ShareButton = ({ inputs }: { inputs: CalculatorInputs }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = buildShareUrl(inputs);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback voor browsers zonder clipboard-permissions
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-secondary justify-center flex-1"
      title="Kopieer link met huidige berekening"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Link gekopieerd
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" /> Deel berekening
        </>
      )}
    </button>
  );
};
