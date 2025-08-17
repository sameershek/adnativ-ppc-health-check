# AdNativ PPC Health Check (100% Local, React + Vite + TS)

Spot wasted ad spend and get a PPC health score in 60 seconds — **no backend, privacy by default**.

- Upload your **Amazon Sponsored Products Search Term report (CSV)**.
- Parses client-side (PapaParse worker), handles big files (100k+ rows) with pagination.
- Computes **CTR, CVR, ACOS** and flags **Good**/**Bad** rows.
- Aggregates **campaign-level** KPIs + wasted spend.
- **Score /10** with rating (Excellent/Good/Fair/Poor) using transparent weights.
- **Sliders** for Target ACOS, Min CTR, Min CVR, Zero-order spend threshold.
- **Export**: PDF report (jsPDF) + CSV of flagged rows.
- Optional **email capture** that posts JSON to **Formspree / Netlify Forms** (toggle off = nothing leaves the browser).
- **Tailwind** + dark/light theme, accessible controls.

## Quick start

```bash
npm i
npm run dev
# open http://localhost:5173
