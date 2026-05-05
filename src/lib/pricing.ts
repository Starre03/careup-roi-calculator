/**
 * CareUp instellingstarief — volumestaffel 2025.
 *
 * CareUp factureert een vaste jaarprijs per band (niet strikt per gebruiker).
 * De prijs-per-gebruiker is dus afgeleid: vaste-band-prijs / aantal-medewerkers.
 *
 * Bij wisseling van band kan de prijs-per-gebruiker dus omhoog springen
 * (bv. 250 → 251 mw: van €24,50 naar €44,82). Dat is hoe staffels werken.
 *
 * Bron: CareUp officiële staffel 2025.
 */

export interface StaffelBand {
  vanaf: number;
  tot: number;
  vastePrijs: number;
  gemPrijsPerGebruiker: number; // marketing-prijs voor de band-gemiddelde
  gemMedewerkers: number;
}

export const STAFFEL_BANDEN: StaffelBand[] = [
  { vanaf: 1, tot: 10, vastePrijs: 550, gemPrijsPerGebruiker: 55, gemMedewerkers: 10 },
  { vanaf: 11, tot: 25, vastePrijs: 1250, gemPrijsPerGebruiker: 50, gemMedewerkers: 25 },
  { vanaf: 26, tot: 50, vastePrijs: 1750, gemPrijsPerGebruiker: 45, gemMedewerkers: 37.5 },
  { vanaf: 51, tot: 100, vastePrijs: 3000, gemPrijsPerGebruiker: 40, gemMedewerkers: 75 },
  { vanaf: 101, tot: 250, vastePrijs: 6125, gemPrijsPerGebruiker: 35, gemMedewerkers: 175 },
  { vanaf: 251, tot: 500, vastePrijs: 11250, gemPrijsPerGebruiker: 30, gemMedewerkers: 375 },
  { vanaf: 501, tot: 1000, vastePrijs: 18750, gemPrijsPerGebruiker: 25, gemMedewerkers: 750 },
  { vanaf: 1001, tot: 99999, vastePrijs: 30000, gemPrijsPerGebruiker: 20, gemMedewerkers: 1500 },
];

export const findStaffelBand = (aantalMedewerkers: number): StaffelBand => {
  for (const band of STAFFEL_BANDEN) {
    if (aantalMedewerkers >= band.vanaf && aantalMedewerkers <= band.tot) return band;
  }
  return STAFFEL_BANDEN[STAFFEL_BANDEN.length - 1];
};

/** Vaste jaarprijs voor de band waarin dit aantal medewerkers valt */
export const careUpVasteJaarprijs = (aantalMedewerkers: number): number =>
  findStaffelBand(aantalMedewerkers).vastePrijs;

/** Afgeleide prijs per gebruiker: vaste jaarprijs / aantal medewerkers (afgerond op 2 decimalen) */
export const careUpVolumeStaffel = (aantalMedewerkers: number): number => {
  const n = Math.max(aantalMedewerkers, 1);
  return Math.round((careUpVasteJaarprijs(aantalMedewerkers) / n) * 100) / 100;
};

export const formatBandLabel = (band: StaffelBand): string => {
  if (band.tot >= 99999) return `${band.vanaf}+ medewerkers`;
  if (band.vanaf === 1) return `tot ${band.tot} medewerkers`;
  return `${band.vanaf}–${band.tot} medewerkers`;
};
