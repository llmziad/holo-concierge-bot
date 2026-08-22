/*
 * Gulf Daylight chart palette.
 * Recharts needs concrete colour values (not CSS vars), so the light-theme
 * tokens are mirrored here. Keep in sync with :root in globals.css.
 */
export const CHART = {
  ink: 'oklch(0.245 0.014 68)',
  muted: 'oklch(0.47 0.017 78)',
  grid: 'oklch(0.885 0.013 82)',
  paper: 'oklch(0.986 0.007 88)',
  border: 'oklch(0.87 0.014 82)',

  teal: 'oklch(0.45 0.078 190)',   // primary / this property
  emerald: 'oklch(0.50 0.108 168)', // gain / total return
  gold: 'oklch(0.66 0.104 76)',     // signature
  slate: 'oklch(0.50 0.09 250)',
  clay: 'oklch(0.60 0.12 45)',
} as const;

export const CHART_TOOLTIP = {
  backgroundColor: CHART.paper,
  border: `1px solid ${CHART.border}`,
  borderRadius: '10px',
  color: CHART.ink,
  boxShadow: '0 8px 24px oklch(0.35 0.03 80 / 0.12)',
  fontSize: '12px',
} as const;

export const CHART_TICK = { fill: CHART.muted, fontSize: 10 } as const;
