# DEWA Training QR Portal

## Overview
A browser-based tool for DEWA Centre of Excellence trainers to register a training session, auto-generate a unique session code, produce a scannable QR code linked to a Microsoft Forms feedback survey, and browse past sessions.

## Stack
- React 19 + TypeScript (strict) + Vite 6
- `qrcode.react` for QR canvas rendering
- Bootstrap Icons (CDN)
- `localStorage` for persistence (no backend)

## Stack Deviation
Default DAK stack is Vue 3 + FastAPI + PostgreSQL. This project uses React 19 because the project's pre-configured agent definitions (`.claude/agents/`) are React-specific. Storage is localStorage (not PostgreSQL) because this is a single-user local utility with no shared data requirements.

## URL Pattern
Base URL (Microsoft Forms):
`https://forms.microsoft.com/Pages/DesignPageV2.aspx?subpage=design&FormId=PBmJ8RZvK0Ob0vh0ItizEeWYLjM_VNdHnFi3Nd883RRUMUdBMktTQVJUWkRGTk4zRERZWTZMNjIxWS4u`

Generated URL: `BASE_URL=TRYYYYMMDD`

## Current State
**Phase 2 — Complete.**
- MS Forms URL updated to `forms.office.com` with `r03842b38fc934b2d9a453bcd41a138bd=` parameter
- Code format updated to `TRN-YYYYMMDD`
- Storage layer migrated to async; Supabase JS client wired up with localStorage fallback
- Real-time History updates via Supabase postgres_changes subscription
- Production build passes (`dist/` ready for Netlify)
- `netlify.toml`, `.env.example`, `supabase-setup.sql`, `.gitignore` added

## Known Limitations
- localStorage data is browser/device-specific; clearing browser cache loses all history
- Same-date sessions get `-2`, `-3` suffix (e.g. `TR20260424-2`)
