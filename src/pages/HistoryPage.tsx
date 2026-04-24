import { useState, useEffect, useCallback } from 'react'
import './HistoryPage.css'
import QRDisplay from '../components/QRDisplay'
import { loadEntries, deleteEntry } from '../utils/storage'
import { supabase } from '../utils/supabase'
import type { TrainingEntry } from '../types'

export default function HistoryPage() {
  const [entries, setEntries] = useState<TrainingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<TrainingEntry | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await loadEntries()
    setEntries(data)
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
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Trainer</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={viewing?.id === entry.id ? 'row-active' : ''}
                >
                  <td>
                    <span className="code-chip">{entry.code}</span>
                  </td>
                  <td className="cell-title">{entry.title}</td>
                  <td>{entry.trainer}</td>
                  <td className="cell-date">{entry.date}</td>
                  <td className="cell-venue">{entry.venue || <span className="cell-empty">—</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn-icon"
                        title="View QR"
                        onClick={() => setViewing(viewing?.id === entry.id ? null : entry)}
                      >
                        <i className={`bi ${viewing?.id === entry.id ? 'bi-eye-slash' : 'bi-qr-code'}`} />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        title="Delete"
                        onClick={() => void handleDelete(entry.id)}
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <QRDisplay
          code={viewing.code}
          url={viewing.fullUrl}
          title={viewing.title}
          trainer={viewing.trainer}
          date={viewing.date}
          onSave={() => {}}
          saved={true}
        />
      )}
    </div>
  )
}
