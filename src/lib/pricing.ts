/**
 * CareUp instellingstarief — volumestaffel per gebruiker per jaar.
 *
 * Marktconform 2025-2026 op basis van publieke benchmarks en sector-gesprekken:
 *  - Individueel maandabo: €12,95/maand → €155/jr
 *  - Individueel jaarabo: €129,50/jr
 *  - Zakelijk/instellingen: custom — schaalvoordeel bij volume
 *
 * Deze staffel is een redelijke schatting per volumeband.
 * Werkelijk tarief wordt door CareUp per offerte vastgesteld.
 */
export const careUpVolumeStaffel = (aantalMedewerkers: number): number => {
  if (aantalMedewerkers < 50) return 65;
  if (aantalMedewerkers < 100) return 50;
  if (aantalMedewerkers < 250) return 40;
  if (aantalMedewerkers < 500) return 30;
  if (aantalMedewerkers < 1000) return 25;
  if (aantalMedewerkers < 2500) return 20;
  return 17;
};

export const STAFFEL_BANDEN: Array<{ vanaf: number; tot: number; prijs: number }> = [
  { vanaf: 25, tot: 49, prijs: 65 },
  { vanaf: 50, tot: 99, prijs: 50 },
  { vanaf: 100, tot: 249, prijs: 40 },
  { vanaf: 250, tot: 499, prijs: 30 },
  { vanaf: 500, tot: 999, prijs: 25 },
  { vanaf: 1000, tot: 2499, prijs: 20 },
  { vanaf: 2500, tot: 99999, prijs: 17 },
];
