import { useState } from 'react'
import './CreatePage.css'
import QRDisplay from '../components/QRDisplay'
import { generateCode } from '../utils/codeGen'
import { buildUrl } from '../utils/urlBuilder'
import { saveEntry, loadCodesSync } from '../utils/storage'
import type { TrainingEntry } from '../types'

const PRESET_TRAINERS = ['Ankur', 'Anusha', 'CFW']

interface FormState {
  date: string
  time: string
  title: string
  trainerSelect: string
  trainerCustom: string
  venue: string
  notes: string
}

const EMPTY: FormState = {
  date: '', time: '', title: '',
  trainerSelect: '', trainerCustom: '',
  venue: '', notes: '',
}

function resolveTrainer(f: FormState): string {
  return f.trainerSelect === '__other__' ? f.trainerCustom.trim() : f.trainerSelect
}

export default function CreatePage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [generated, setGenerated] = useState<TrainingEntry | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'trainer', string>>>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.date) e.date = 'Required'
    if (!form.title.trim()) e.title = 'Required'
    if (!form.trainerSelect) e.trainer = 'Required'
    if (form.trainerSelect === '__other__' && !form.trainerCustom.trim()) e.trainerCustom = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleGenerate() {
    if (!validate()) return
    const trainer = resolveTrainer(form)
    const code = generateCode(form.date, loadCodesSync())
    const fullUrl = buildUrl(code)
    setGenerated({
      id: crypto.randomUUID(),
      code,
      title: form.title.trim(),
      trainer,
      date: form.date,
      time: form.time,
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

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, trainer: undefined }))
    if (generated) { setGenerated(null); setSaved(false) }
  }

  return (
    <div className="create-page">
      <div className="page-header">
        <h1 className="page-title">Generate Training QR</h1>
        <p className="page-desc">Fill in the training details to auto-generate a unique code, Microsoft Forms link, and QR code.</p>
      </div>

      <div className="create-form-card">
        <div className="form-grid">

          {/* Row 1: Date + Time */}
          <div className={`form-field${errors.date ? ' has-error' : ''}`}>
            <label htmlFor="date">Training Date <span className="req">*</span></label>
            <input id="date" type="date" value={form.date}
              onChange={(e) => setField('date', e.target.value)} />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="time">Training Time</label>
            <input id="time" type="time" value={form.time}
              onChange={(e) => setField('time', e.target.value)} />
          </div>

          {/* Row 2: Title (full width) */}
          <div className={`form-field form-field-full${errors.title ? ' has-error' : ''}`}>
            <label htmlFor="title">Training Title <span className="req">*</span></label>
            <input id="title" type="text" placeholder="e.g. AI Fundamentals Workshop"
              value={form.title} onChange={(e) => setField('title', e.target.value)} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          {/* Row 3: Trainer dropdown + optional custom */}
          <div className={`form-field${errors.trainer ? ' has-error' : ''}`}>
            <label htmlFor="trainerSelect">Trainer <span className="req">*</span></label>
            <select id="trainerSelect" value={form.trainerSelect}
              onChange={(e) => setField('trainerSelect', e.target.value)}>
              <option value="">Select trainer…</option>
              {PRESET_TRAINERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__other__">Other…</option>
            </select>
            {errors.trainer && <span className="field-error">{errors.trainer}</span>}
          </div>

          {form.trainerSelect === '__other__' && (
            <div className={`form-field${errors.trainerCustom ? ' has-error' : ''}`}>
              <label htmlFor="trainerCustom">Trainer Name <span className="req">*</span></label>
              <input id="trainerCustom" type="text" placeholder="Enter trainer name"
                value={form.trainerCustom}
                onChange={(e) => setField('trainerCustom', e.target.value)} />
              {errors.trainerCustom && <span className="field-error">{errors.trainerCustom}</span>}
            </div>
          )}

          {/* Row 4: Venue */}
          <div className={`form-field${form.trainerSelect !== '__other__' ? ' form-field-offset' : ''}`}>
            <label htmlFor="venue">Venue / Location</label>
            <input id="venue" type="text" placeholder="e.g. DEWA HQ — Training Room B"
              value={form.venue} onChange={(e) => setField('venue', e.target.value)} />
          </div>

          {/* Row 5: Notes full width */}
          <div className="form-field form-field-full">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" rows={3}
              placeholder="Any additional information about this training session…"
              value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
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

      {generated && (
        <QRDisplay
          entry={generated}
          onSave={handleSave}
          saved={saved}
          saving={saving}
        />
      )}
    </div>
  )
}
