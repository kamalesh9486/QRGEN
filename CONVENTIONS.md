# Conventions

## File organisation
- One component per file; CSS file co-located (e.g. `QRDisplay.tsx` + `QRDisplay.css`)
- Pages in `src/pages/`, reusable components in `src/components/`
- Pure utility functions in `src/utils/` (one concern per file, ≤200 lines)
- Shared types in `src/types.ts`, app-wide constants in `src/constants.ts`

## Naming
- React components: PascalCase
- Utility functions: camelCase
- CSS classes: kebab-case, BEM-lite (`.block`, `.block-element`, `.block--modifier`)

## Styling
- All styles in sibling `.css` files — no inline styles, no CSS-in-JS
- Design tokens defined as CSS custom properties in `src/App.css`
- DEWA palette: `--green #007560`, `--green-dark #004937`, `--gold #ca8a04`, `--bg #edf2f0`

## State
- Tab state in `Layout.tsx` (no React Router)
- Form state local to `CreatePage`
- History reads from localStorage on mount; refresh after mutations

## Icons
- Bootstrap Icons only, via CDN in `index.html`
- Usage: `<i className="bi bi-icon-name" />`
