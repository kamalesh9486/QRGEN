import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import './QRDisplay.css'

interface Props {
  code: string
  url: string
  title: string
  trainer: string
  date: string
  onSave: () => void
  saved: boolean
  saving?: boolean
}

export default function QRDisplay({ code, url, title, trainer, date, onSave, saved, saving = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${code}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="qr-display">
      <div className="qr-code-wrap">
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={220}
          level="H"
          marginSize={2}
          fgColor="#004937"
        />
      </div>

      <div className="qr-meta">
        <div className="qr-code-badge">
          <i className="bi bi-tag" />
          {code}
        </div>
        <div className="qr-info-row">
          <span className="qr-label">Title</span>
          <span className="qr-value">{title}</span>
        </div>
        <div className="qr-info-row">
          <span className="qr-label">Trainer</span>
          <span className="qr-value">{trainer}</span>
        </div>
        <div className="qr-info-row">
          <span className="qr-label">Date</span>
          <span className="qr-value">{date}</span>
        </div>
        <div className="qr-url-box">
          <span className="qr-url-text">{url}</span>
        </div>
        <div className="qr-actions">
          <button className="btn-primary" onClick={handleDownload}>
            <i className="bi bi-download" />
            Download PNG
          </button>
          <button className="btn-outline" onClick={handleCopy}>
            <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} />
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          {!saved && (
            <button className="btn-gold" onClick={onSave} disabled={saving}>
              {saving ? (
                <><i className="bi bi-hourglass-split" /> Saving…</>
              ) : (
                <><i className="bi bi-bookmark-check" /> Save to History</>
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
