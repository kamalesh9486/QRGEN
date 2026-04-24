import { useState } from 'react'
import './Layout.css'
import CreatePage from '../pages/CreatePage'
import HistoryPage from '../pages/HistoryPage'

type Tab = 'create' | 'history'

export default function Layout() {
  const [tab, setTab] = useState<Tab>('create')

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <div className="layout-brand">
            <span className="layout-brand-icon">
              <i className="bi bi-qr-code" />
            </span>
            <div>
              <div className="layout-brand-title">Training QR Portal</div>
              <div className="layout-brand-sub">DEWA Centre of Excellence</div>
            </div>
          </div>
          <nav className="layout-tabs">
            <button
              className={`layout-tab${tab === 'create' ? ' active' : ''}`}
              onClick={() => setTab('create')}
            >
              <i className="bi bi-plus-circle" />
              <span>Generate QR</span>
            </button>
            <button
              className={`layout-tab${tab === 'history' ? ' active' : ''}`}
              onClick={() => setTab('history')}
            >
              <i className="bi bi-clock-history" />
              <span>History</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="layout-main">
        {tab === 'create' ? <CreatePage /> : <HistoryPage />}
      </main>
    </div>
  )
}
