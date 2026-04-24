export function generateCode(date: string, existingCodes: string[]): string {
  const base = `TRN-${date.replace(/-/g, '')}`
  if (!existingCodes.includes(base)) return base
  let suffix = 2
  while (existingCodes.includes(`${base}-${suffix}`)) suffix++
  return `${base}-${suffix}`
}
