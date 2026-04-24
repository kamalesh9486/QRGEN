import { useState } from 'react'
import './CreatePage.css'
import QRDisplay from '../components/QRDisplay'
import { generateCode } from '../utils/codeGen'
import { buildUrl } from '../utils/urlBuilder'
import { saveEntry, loadCodesSync } from '../utils/storage'
import type { TrainingEntry } from '../types'

interface FormState {
  date: string
  title: string
  trainer: string
  venue: string
  notes: string
}

const EMPTY: FormState = { date: '', title: '', trainer: '', venue: '', notes: '' }

export default function CreatePage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [generated, setGenerated] = useState<TrainingEntry | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<FormState>>({})

  function validate(): boolean {
    const e: Partial<FormState> = {}
    if (!form.date) e.date = 'Required'
    if (!form.title.trim()) e.title = 'Required'
    if (!form.trainer.trim()) e.trainer = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleGenerate() {
    if (!validate()) return
    const code = generateCode(form.date, loadCodesSync())
    const fullUrl = buildUrl(code)
    setGenerated({
      id: crypto.randomUUID(),
      code,
      title: form.title.trim(),
      trainer: form.trainer.trim(),
      date: form.date,
      venue: form.venue.trim(),
      notes: form.notes.trim(),
      fullUrl,
      createdAt: new Date().toISOString(),
    })
    setSaved(false)
  }

  async function handleSave() {
    if (!generated) return
    setSaving(true)
    await saveEntry(generated)
    setSaved(true)
    setSaving(false)
  }

  function handleReset() {
    setForm(EMPTY)
    setGenerated(null)
    setSaved(false)
    setErrors({})
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
      if (generated) { setGenerated(null); setSaved(false) }
    }
  }

  return (
    <div className="create-page">
      <div className="page-header">
        <h1 className="page-title">Generate Training QR</h1>
        <p className="page-desc">
          Fill in the training details to auto-generate a unique code, Microsoft Forms link, and QR code.
        </p>
      </div>

      <div className="create-layout">
        <div className="create-form-card">
          <div className="form-grid">
            <div className={`form-field${errors.date ? ' has-error' : ''}`}>
              <label htmlFor="date">
                Training Date <span className="req">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={set('date')}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>

            <div className={`form-field${errors.title ? ' has-error' : ''}`}>
              <label htmlFor="title">
                Training Title <span className="req">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. AI Fundamentals Workshop"
                value={form.title}
                onChange={set('title')}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className={`form-field${errors.trainer ? ' has-error' : ''}`}>
              <label htmlFor="trainer">
                Trainer Name <span className="req">*</span>
              </label>
              <input
                id="trainer"
                type="text"
                placeholder="e.g. Ahmed Al Mansouri"
                value={form.trainer}
                onChange={set('trainer')}
              />
              {errors.trainer && <span className="field-error">{errors.trainer}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="venue">Venue / Location</label>
              <input
                id="venue"
                type="text"
                placeholder="e.g. DEWA HQ — Training Room B"
                value={form.venue}
                onChange={set('venue')}
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Any additional information about this training session…"
                value={form.notes}
                onChange={set('notes')}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary btn-generate" onClick={handleGenerate}>
              <i className="bi bi-qr-code" />
              Generate QR Code
            </button>
            {(generated || form.date || form.title) && (
              <button className="btn-ghost" onClick={handleReset}>
                <i className="bi bi-arrow-counterclockwise" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {generated && (
        <QRDisplay
          code={generated.code}
          url={generated.fullUrl}
          title={generated.title}
          trainer={generated.trainer}
          date={generated.date}
          onSave={handleSave}
          saved={saved}
          saving={saving}
        />
      )}
    </div>
  )
}
