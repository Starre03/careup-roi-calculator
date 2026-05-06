import { Leaf, Car } from 'lucide-react';
import type { CalculatorInputs, CalculatorResults } from '../lib/calculations';

interface Props {
  inputs: CalculatorInputs;
  r: CalculatorResults;
}

/**
 * CO₂-impact van minder reisbewegingen.
 * Berekening:
 *   km/medewerker/jaar = reiskostenPerMedewerker / €0,23 (CAO-norm km-vergoeding)
 *   CO₂ uitstoot/km    = 0,158 kg (gemiddelde personenauto NL — RVO 2024)
 *   bespaarde km       = totale km × reductieReiskosten
 *
 * Equivalenties (RVO/Milieucentraal):
 *   1 boom absorbeert ~25 kg CO₂/jaar
 *   1 retourvlucht Amsterdam-Barcelona = ~520 kg CO₂/passagier
 */
export const CO2Panel = ({ inputs, r }: Props) => {
  // Niet relevant voor onderwijs (geen medewerkers die reizen tussen werkplekken)
  if (inputs.typeOrganisatie === 'Onderwijsinstelling') return null;
  if (r.huidigReiskosten - r.restReiskosten < 50) return null; // verwaarloosbaar

  const kmPerMedewerker = inputs.reiskostenPerMedewerker / 0.23;
  const totaleKmHuidig = kmPerMedewerker * inputs.aantalMedewerkers;
  const bespaardeKm = totaleKmHuidig * inputs.reductieReiskosten;
  const KG_CO2_PER_KM = 0.158; // gemiddelde personenauto NL
  const bespaardeCO2Kg = Math.round(bespaardeKm * KG_CO2_PER_KM);
  const bomenEquivalent = Math.round(bespaardeCO2Kg / 25); // 1 boom = ~25 kg CO2/jr

  return (
    <div className="group-card">
      <h3 className="text-base font-semibold text-careup-900 flex items-center gap-2">
        <Leaf className="h-4 w-4 text-savings" /> Duurzaamheidsimpact
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded bg-savings-light px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-savings-dark">
            <Leaf className="h-3.5 w-3.5" />
            <span className="font-medium uppercase tracking-wide">CO₂-besparing</span>
          </div>
          <div className="mt-1 font-serif text-xl font-semibold text-savings-dark">
            {bespaardeCO2Kg.toLocaleString('nl-NL')} kg/jaar
          </div>
          <div className="text-xs text-savings-dark/80">
            ≈ {bomenEquivalent.toLocaleString('nl-NL')} bomen aan CO₂-opname
          </div>
        </div>
        <div className="rounded bg-surface-panel px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Car className="h-3.5 w-3.5" />
            <span className="font-medium uppercase tracking-wide">Minder reizen</span>
          </div>
          <div className="mt-1 font-serif text-xl font-semibold text-ink">
            {Math.round(bespaardeKm).toLocaleString('nl-NL')} km/jaar
          </div>
          <div className="text-xs text-ink-muted">
            wagenkilometers naar skillslab/cursus
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        Gebaseerd op CAO km-vergoeding €0,23/km en gemiddelde uitstoot personenauto 158 g CO₂/km
        (RVO 2024). Bruikbaar voor ESG- en duurzaamheidsrapportages.
      </p>
    </div>
  );
};
