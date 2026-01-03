export type Mode = 'appraisal' | 'resume' | 'manager'

export function formatSummaryByMode(
  summary: string,
  mode: Mode
): string[] {
  if (!summary) return []

  const bullets = summary
    .split('\n')
    .map(b => b.replace(/^•\s*/, '').trim())
    .filter(Boolean)

  if (mode === 'resume') {
    return bullets.map(b =>
      b
        .replace(/^Resolved/, 'Fixed')
        .replace(/^Optimized/, 'Improved')
        .replace(/^Implemented/, 'Built')
        .replace(/,.*$/, '')
    )
  }

  if (mode === 'manager') {
    return bullets.map(b => (b.endsWith('.') ? b : `${b}.`))
  }

  return bullets
}
