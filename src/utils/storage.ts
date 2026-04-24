import type { TrainingEntry } from '../types'
import { supabase } from './supabase'

const LS_KEY = 'qr_training_entries'

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsLoad(): TrainingEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as TrainingEntry[]
  } catch {
    return []
  }
}

function lsSave(entries: TrainingEntry[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(entries))
}

// ── Public API (always async) ─────────────────────────────────────────────────

export async function loadEntries(): Promise<TrainingEntry[]> {
  if (!supabase) return lsLoad()

  const { data, error } = await supabase
    .from('training_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return lsLoad()

  const entries = data.map(
    (r): TrainingEntry => ({
      id: r.id as string,
      code: r.code as string,
      title: r.title as string,
      trainer: r.trainer as string,
      date: r.date as string,
      venue: (r.venue as string) ?? '',
      notes: (r.notes as string) ?? '',
      fullUrl: r.full_url as string,
      createdAt: r.created_at as string,
    }),
  )

  // Keep local cache in sync
  lsSave(entries)
  return entries
}

export async function saveEntry(entry: TrainingEntry): Promise<void> {
  // Always write to localStorage first (instant, offline-safe)
  const all = lsLoad()
  lsSave([...all, entry])

  if (!supabase) return

  await supabase.from('training_entries').insert({
    id: entry.id,
    code: entry.code,
    title: entry.title,
    trainer: entry.trainer,
    date: entry.date,
    venue: entry.venue,
    notes: entry.notes,
    full_url: entry.fullUrl,
    created_at: entry.createdAt,
  })
}

export async function deleteEntry(id: string): Promise<void> {
  lsSave(lsLoad().filter((e) => e.id !== id))

  if (!supabase) return

  await supabase.from('training_entries').delete().eq('id', id)
}

export function loadCodesSync(): string[] {
  return lsLoad().map((e) => e.code)
}
