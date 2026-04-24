import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import './QRDisplay.css'
import type { TrainingEntry } from '../types'

interface Props {
  entry: TrainingEntry
  onSave: () => void
  saved: boolean
  saving?: boolean
}

function fmt12h(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function QRDisplay({ entry, onSave, saved, saving = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${entry.code}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function handleCopy() {
    navigator.clipboard.writeText(entry.fullUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="qr-display">
      <div className="qr-code-wrap">
        <QRCodeCanvas
          ref={canvasRef}
          value={entry.fullUrl}
          size={200}
          level="H"
          marginSize={2}
          fgColor="#004937"
        />
      </div>

      <div className="qr-meta">
        <div className="qr-code-badge">
          <i className="bi bi-tag" />
          {entry.code}
        </div>

        <div className="qr-info-grid">
          <span className="qr-label">Title</span>
          <span className="qr-value">{entry.title}</span>

          <span className="qr-label">Trainer</span>
          <span className="qr-value">{entry.trainer}</span>

          <span className="qr-label">Date</span>
          <span className="qr-value">{entry.date}</span>

          {entry.time && (
            <>
              <span className="qr-label">Time</span>
              <span className="qr-value">{fmt12h(entry.time)}</span>
            </>
          )}

          {entry.venue && (
            <>
              <span className="qr-label">Venue</span>
              <span className="qr-value">{entry.venue}</span>
            </>
          )}
        </div>

        <div className="qr-url-box">
          <span className="qr-url-text">{entry.fullUrl}</span>
        </div>

        <div className="qr-actions">
          <button className="btn-primary" onClick={handleDownload}>
            <i className="bi bi-download" />
            <span>Download PNG</span>
          </button>
          <button className="btn-outline" onClick={handleCopy}>
            <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} />
            <span>{copied ? 'Copied!' : 'Copy URL'}</span>
          </button>
          {!saved && (
            <button className="btn-gold" onClick={onSave} disabled={saving}>
              {saving ? (
                <><i className="bi bi-hourglass-split" /><span>Saving…</span></>
              ) : (
                <><i className="bi bi-bookmark-check" /><span>Save to History</span></>
              )}
            </button>
          )}
          {saved && (
            <span className="qr-saved-badge">
              <i className="bi bi-check-circle-fill" />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
