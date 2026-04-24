const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomSuffix(): string {
  let s = ''
  for (let i = 0; i < 4; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return s
}

export function generateCode(date: string, existingCodes: string[]): string {
  let code = `TRN-${date.replace(/-/g, '')}-${randomSuffix()}`
  // Extremely unlikely collision guard
  while (existingCodes.includes(code)) {
    code = `TRN-${date.replace(/-/g, '')}-${randomSuffix()}`
  }
  return code
}
