import { BASE_URL } from '../constants'

export function buildUrl(code: string): string {
  return `${BASE_URL}${code}`
}
