# Telkom OCA — Interactive Presentation Deck

An interactive web presentation for **Project 2: Active User Behavior & Segmentation** — Telkom OCA / RevoU Virtual Internship.

## Live Demo

Deployed on Vercel: [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

## Features

### Interactive Elements
- **Animated counters** — numbers count up when slides enter view
- **Flip cards** — click T/V cards to reveal scoring details
- **Expandable insights** — click insight cards to see deeper analysis
- **Interactive recommendations** — click to expand timeline and owner info
- **Hover tooltips** — hover over data points for context
- **Interactive T-V matrix** — hover cells to highlight segments
- **Animated bar chart** — bars grow on slide entry
- **Donut chart** — segments animate in on mount
- **Interactive table** — rows highlight on hover
- **Staggered entrance** — elements animate in sequentially

### Navigation
- **Keyboard**: ← → arrow keys, Space to advance
- **Touch**: swipe left/right on mobile
- **Click**: navigation buttons and dot indicators
- **Section filter**: jump to any section from the top-right pill bar

### Design
- Logo on every slide (top-left)
- Progress bar (top)
- Smooth slide transitions with scale + translate
- Gradient backgrounds per section
- Responsive — works on desktop, tablet, and mobile

## Slide Structure

| # | Section | Title |
|---|---------|-------|
| 1 | INTRO | Title slide with animated particles |
| 2 | CONTEXT | Business Background — OCA Blast overview |
| 3 | PROBLEM | Business Problem — why this analysis matters |
| 4 | OBJECTIVES | Analysis Objectives — 4 key goals |
| 5 | DATA | Dataset Scope — channels, users, volumes |
| 6 | METHODOLOGY | T-V Framework — flip cards + interactive matrix |
| 7 | RESULTS | Segmentation Results — donut chart + distribution |
| 8 | RESULTS | Anchor Users at Risk — interactive table |
| 9 | INSIGHTS | Key Findings — expandable insight cards |
| 10 | RECOMMENDATIONS | Action Plan — expandable recommendation rows |
| 11 | DISCLAIMER | Data disclaimer |
| 12 | CONTACT | WhatsApp, Email, LinkedIn |

## Tech Stack

- **Next.js 14** — React framework
- **React 18** — UI library
- **Tailwind CSS** — styling
- **Vercel** — hosting & deployment

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Deployment

```bash
# Build for production
npm run build

# Output in /.next — deploy to Vercel
```

### Vercel Setup
1. Push code to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Framework: Next.js (auto-detected)
4. Deploy — done

## Content Management (Notion Integration)

Content is currently hardcoded in `app/page.tsx`. To enable Notion-based dynamic content:

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Add `NOTION_TOKEN` to `.env.local`
3. Share your Notion database with the integration
4. Add `NOTION_DATABASE_ID` to `.env.local`
5. Update `app/page.tsx` to fetch from the Notion API route

## Project Structure

```
telcom-oca-slides/
├── app/
│   ├── api/notion/       # Notion API route (placeholder)
│   ├── globals.css       # Animations & interactive styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main presentation (all slides + components)
├── public/
│   └── logo.png          # RevoU x OCA x Telkom logo
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## Cost

**$0** — Uses only free tier services (Vercel, Next.js, Tailwind CSS).
