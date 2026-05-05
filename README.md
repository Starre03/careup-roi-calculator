# CareUp ROI-calculator

Interactieve ROI-calculator voor zorgorganisaties die overwegen over te stappen op **CareUp Virtual Learning Lab**. Gebruikt door sales (in demo's) en door prospects zelf (om met hun bestuur te rekenen).

Bouw: React 18 + TypeScript + Vite, Tailwind, recharts, xlsx-export.
Branding: gebaseerd op de live stijl van [careup.online](https://careup.online) — primaire kleur `#69c8e7`, headings in Quicksand, body in Roboto.

## Aan de slag

```bash
npm install
npm run dev
```

Server draait op [http://localhost:5174](http://localhost:5174).

## Build

```bash
npm run build
npm run preview
```

## Functionaliteit

- **Twee modi:** Sales-modus (alle inputs zichtbaar, uitklapbare aannames + berekeningen) en Bestuurder-modus (alleen essentiële inputs, grote getallen).
- **Live berekening** zonder rekenknop — sliders en getalvelden updaten direct.
- **Bronvermelding** als hover-tooltip bij elk veld (Catharina Ziekenhuis, TMI Academy, CAO VVT 2026).
- **Excel-export** met drie tabs: Samenvatting, Berekening, Bronnen & Aannames.
- **Print/PDF** via browser-print (CSS verbergt sliders/knoppen).
- **Compliance-blok** altijd zichtbaar: IGJ-bewijslast, BIG-herregistratie, Wkkgz-naleving.

## Test-scenario's (defaults: skillslab €110, uren 3×€32, bijscholing 1×€175, CareUp €27,50, reducties 50/30/40%)

| Medewerkers | Huidig    | Met CareUp | Besparing | ROI    |
| ----------- | --------- | ---------- | --------- | ------ |
| 100         | €38.100   | €25.750    | €12.350   | ~449%  |
| 500         | €190.500  | €128.750   | €61.750   | ~449%  |
| 1500        | €571.500  | €386.250   | €185.250  | ~449%  |

Per medewerker: huidige kosten €381, CareUp-kosten €257,50, netto besparing €123,50.

> Spec noemde "ROI ~620%" als doel maar dat veronderstelt agressievere reducties dan de gespecificeerde defaults (50/30/40%). Defaults zijn conservatief gehouden — sales kan reducties verhogen voor agressievere scenario's via "Geavanceerde aannames".

## Integriteit

- CareUp-licentiekosten worden **apart** getoond, niet weggemoffeld.
- Calculator kan **negatieve uitkomst** tonen als reducties op 0 staan (rood, "tekort" i.p.v. "besparing").
- Defaults zijn **gebaseerd op publieke marktdata** Nederland 2025-2026.
- Disclaimer onderaan: aanbeveling om uitkomst te valideren via een gratis 30-dagen demo (zie careup.online).

## Mappenstructuur

```
src/
  App.tsx                  Hoofdcomponent met alle inputs/layout
  main.tsx                 React entry
  index.css                Tailwind + brand-styling
  components/
    InputField.tsx         Slider + getalveld + select + text
    ResultsPanel.tsx       Live-bijgewerkte resultaten + chart
    Tooltip.tsx            Hover-tooltip met bronvermelding
    CountUp.tsx            Geanimeerd getal (max 400ms)
  lib/
    calculations.ts        Pure rekenlogica + types + defaults
    formatters.ts          Nederlandse euro-/getal-formattering
    excelExport.ts         3-tab xlsx export via SheetJS
```
