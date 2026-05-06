import type { CalculatorInputs, CalculatorResults } from '../lib/calculations';
import { formatEuro, formatPercent, todayISO } from '../lib/formatters';

interface Props {
  inputs: CalculatorInputs;
  r: CalculatorResults;
}

/**
 * Print-only rapport — zichtbaar bij window.print() / "Save as PDF".
 * Op scherm verborgen via .print-only class.
 */
export const PrintReport = ({ inputs, r }: Props) => {
  const positief = r.besparing > 0;
  const accent = positief ? '#2d6e3e' : '#a83232';
  return (
    <div className="print-only">
      <div className="print-page">
        {/* Header */}
        <div className="print-header">
          <img src="/careup-logo.png" alt="CareUp" className="print-logo" />
          <div className="print-meta">
            <div className="print-meta-title">ROI-rapport</div>
            <div>{todayISO()}</div>
          </div>
        </div>

        {/* Organisatie */}
        <div className="print-org">
          <div className="print-org-name">{inputs.organisatieNaam || 'Onbekende organisatie'}</div>
          <div className="print-org-detail">
            {inputs.typeOrganisatie} · {inputs.aantalMedewerkers}{' '}
            {inputs.typeOrganisatie === 'Onderwijsinstelling' ? 'studenten' : 'medewerkers'}
          </div>
        </div>

        {/* Hoofdcijfers */}
        <div className="print-hero">
          <div className="print-hero-label">
            {positief ? 'JAARLIJKSE BESPARING' : 'JAARLIJKS TEKORT'}
          </div>
          <div className="print-hero-value" style={{ color: accent }}>
            {formatEuro(Math.abs(r.besparing))}
          </div>
          <div className="print-hero-detail">
            ROI op licentie:{' '}
            <strong style={{ color: accent }}>{formatPercent(r.roi)}</strong>
            {r.terugverdientijdMaanden !== null && (
              <>
                {' '}
                · Terugverdientijd:{' '}
                <strong>{r.terugverdientijdMaanden.toFixed(1)} maanden</strong>
              </>
            )}
          </div>
        </div>

        {/* Vergelijking */}
        <div className="print-grid">
          <div className="print-cell">
            <div className="print-cell-label">Huidige situatie</div>
            <div className="print-cell-value">{formatEuro(r.huidigeKosten)}</div>
            <div className="print-cell-sub">{formatEuro(r.huidigPerMedewerker)}/medewerker</div>
          </div>
          <div className="print-cell highlight">
            <div className="print-cell-label">Met CareUp</div>
            <div className="print-cell-value">{formatEuro(r.metCareUpKosten)}</div>
            <div className="print-cell-sub">{formatEuro(r.metCareUpPerMedewerker)}/medewerker</div>
          </div>
          <div className="print-cell">
            <div className="print-cell-label">Cumulatief 5 jaar</div>
            <div className="print-cell-value" style={{ color: accent }}>
              {formatEuro(Math.abs(r.besparing * 5))}
            </div>
            <div className="print-cell-sub">netto besparing</div>
          </div>
        </div>

        {/* Kostenuitsplitsing */}
        <div className="print-section">
          <h3>Kostenuitsplitsing per jaar</h3>
          <table className="print-table">
            <thead>
              <tr>
                <th>Kostenpost</th>
                <th style={{ textAlign: 'right' }}>Huidig</th>
                <th style={{ textAlign: 'right' }}>Met CareUp</th>
                <th style={{ textAlign: 'right' }}>Verschil</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Skillslab-toegang</td>
                <td>{formatEuro(r.huidigSkillslab)}</td>
                <td>{formatEuro(r.restSkillslab)}</td>
                <td style={{ color: accent }}>
                  −{formatEuro(r.huidigSkillslab - r.restSkillslab)}
                </td>
              </tr>
              <tr>
                <td>Reistijd</td>
                <td>{formatEuro(r.huidigVerlorenUren)}</td>
                <td>{formatEuro(r.restVerlorenUren)}</td>
                <td style={{ color: accent }}>
                  −{formatEuro(r.huidigVerlorenUren - r.restVerlorenUren)}
                </td>
              </tr>
              <tr>
                <td>Reiskosten</td>
                <td>{formatEuro(r.huidigReiskosten)}</td>
                <td>{formatEuro(r.restReiskosten)}</td>
                <td style={{ color: accent }}>
                  −{formatEuro(r.huidigReiskosten - r.restReiskosten)}
                </td>
              </tr>
              <tr>
                <td>Bijscholing (cursus + verloren werkdag)</td>
                <td>{formatEuro(r.huidigBijscholing)}</td>
                <td>{formatEuro(r.restBijscholing)}</td>
                <td style={{ color: accent }}>
                  −{formatEuro(r.huidigBijscholing - r.restBijscholing)}
                </td>
              </tr>
              <tr>
                <td>CareUp licentie</td>
                <td>—</td>
                <td>{formatEuro(r.careUpLicentie)}</td>
                <td>+{formatEuro(r.careUpLicentie)}</td>
              </tr>
              <tr className="print-total">
                <td>Totaal</td>
                <td>{formatEuro(r.huidigeKosten)}</td>
                <td>{formatEuro(r.metCareUpKosten)}</td>
                <td style={{ color: accent }}>
                  {positief ? '−' : '+'}
                  {formatEuro(Math.abs(r.besparing))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Compliance + CTA */}
        <div className="print-compliance">
          <h3>Wat je krijgt naast de besparing</h3>
          <ul>
            <li>
              <strong>IGJ-bewijslast</strong> — toetsresultaten en accreditatiepunten worden
              automatisch bijgeschreven in V&amp;VN Kwaliteitsregister
            </li>
            <li>
              <strong>BIG-herregistratie</strong> — V&amp;VN-geaccrediteerde toetsen leveren
              direct accreditatiepunten
            </li>
            <li>
              <strong>Wkkgz-naleving</strong> — volledig bewijs van bekwaamheid voor risicovolle
              handelingen
            </li>
          </ul>
        </div>

        <div className="print-cta">
          <strong>Plan een gratis 30-dagen demo:</strong> careup.online/contact
        </div>

        {/* Footer */}
        <div className="print-footer">
          Gegenereerd door CareUp ROI-calculator · Defaults: Nederlandse branchegemiddeldes
          2025-2026 (CAO VVT, V&amp;VN, TMI Academy, CareUp volumestaffel 2025).
        </div>
      </div>
    </div>
  );
};
