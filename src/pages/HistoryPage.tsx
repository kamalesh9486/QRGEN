import { useState, useEffect, useCallback } from 'react'
import './HistoryPage.css'
import QRDisplay from '../components/QRDisplay'
import { loadEntries, deleteEntry } from '../utils/storage'
import { supabase } from '../utils/supabase'
import type { TrainingEntry } from '../types'

function fmt12h(time: string): string {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<TrainingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<TrainingEntry | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setEntries(await loadEntries())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()

    if (!supabase) return
    const channel = supabase
      .channel('training_entries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_entries' }, () => {
        void refresh()
      })
      .subscribe()

    return () => { void supabase!.removeChannel(channel) }
  }, [refresh])

  async function handleDelete(id: string) {
    await deleteEntry(id)
    if (viewing?.id === id) setViewing(null)
    await refresh()
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">QR History</h1>
        <p className="page-desc">
          {loading ? 'Loading…' : `${entries.length} training session${entries.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {loading ? (
        <div className="history-loading">
          <i className="bi bi-arrow-repeat spin" />
          <span>Loading sessions…</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="history-empty">
          <i className="bi bi-inbox" />
          <p>No sessions saved yet. Generate a QR code first.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ─────────────────────────────────── */}
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Trainer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className={viewing?.id === entry.id ? 'row-active' : ''}>
                    <td><span className="code-chip">{entry.code}</span></td>
                    <td className="cell-title">{entry.title}</td>
                    <td>{entry.trainer}</td>
                    <td className="cell-date">{entry.date}</td>
                    <td className="cell-date">{fmt12h(entry.time)}</td>
                    <td className="cell-venue">{entry.venue || <span className="cell-empty">—</span>}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" title="View QR"
                          onClick={() => setViewing(viewing?.id === entry.id ? null : entry)}>
                          <i className={`bi ${viewing?.id === entry.id ? 'bi-eye-slash' : 'bi-qr-code'}`} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Delete"
                          onClick={() => void handleDelete(entry.id)}>
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ──────────────────────────────────── */}
          <div className="history-cards">
            {entries.map((entry) => (
              <div key={entry.id} className={`history-card${viewing?.id === entry.id ? ' card-active' : ''}`}>
                <div className="card-top">
                  <span className="code-chip">{entry.code}</span>
                  <div className="row-actions">
                    <button className="btn-icon" title="View QR"
                      onClick={() => setViewing(viewing?.id === entry.id ? null : entry)}>
                      <i className={`bi ${viewing?.id === entry.id ? 'bi-eye-slash' : 'bi-qr-code'}`} />
                    </button>
                    <button className="btn-icon btn-icon-danger" title="Delete"
                      onClick={() => void handleDelete(entry.id)}>
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                </div>
                <div className="card-title">{entry.title}</div>
                <div className="card-meta-grid">
                  <span className="card-label">Trainer</span><span>{entry.trainer}</span>
                  <span className="card-label">Date</span><span>{entry.date}</span>
                  {entry.time && <><span className="card-label">Time</span><span>{fmt12h(entry.time)}</span></>}
                  {entry.venue && <><span className="card-label">Venue</span><span>{entry.venue}</span></>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {viewing && (
        <QRDisplay
          entry={viewing}
          onSave={() => {}}
          saved={true}
        />
      )}
    </div>
  )
}
