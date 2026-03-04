# MarketAxis AI — Frontend Dashboard Blueprint

## Stack

| Tech | Purpose |
|------|---------|
| React 18+ | UI framework |
| React Router | Client-side routing |
| Convex React | Real-time backend |
| Vanilla CSS / CSS Modules | Styling |
| Lucide React | Icons |

---

## Design System

### Colors (Dark Mode First)

```css
:root {
  --primary-500: #4F46E5;
  --primary-600: #4338CA;
  --primary-100: #E0E7FF;
  --accent-start: #8B5CF6;
  --accent-end: #06B6D4;
  --bg-primary: #0F0F14;
  --bg-secondary: #1A1A24;
  --bg-tertiary: #24243A;
  --border: #2D2D44;
  --text-primary: #F1F1F6;
  --text-secondary: #9CA3AF;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
}
```

### Typography: Inter + JetBrains Mono

### Visual: Glassmorphism cards, gradient accents, 8px grid, 200ms transitions

---

## Layout

```
┌──────────────────────────────────────────────┐
│  Top Bar (logo, mode toggle, avatar)         │
├────────┬─────────────────────────────────────┤
│Sidebar │  Main Content Area                  │
│        │                                     │
│Overview│  Page-specific content              │
│Strategy│  Cards, editors, generators         │
│Content │                                     │
│Launch  │                                     │
│Social  │  Activity feed                      │
│Settings│                                     │
└────────┴─────────────────────────────────────┘
```

---

## Pages

### 1. Overview — Stats cards, quick actions, activity feed
### 2. Strategy — Positioning, brand voice, content calendar, communities
### 3. Content Studio — Type selector, generator, editor, history table
### 4. Launch Kit — Readiness bar, asset cards (PH, HN, press, social)
### 5. Social Inbox (Phase 2) — Mentions, sentiment, reply suggestions
### 6. Settings — App profile, connected accounts, mode toggle, billing

---

## Component Structure

```
src/
├── components/
│   ├── layout/ (Sidebar, TopBar, Layout)
│   ├── common/ (Button, Card, Badge, Toggle, Toast)
│   ├── content/ (TypeSelector, Editor, ContentCard, History)
│   ├── strategy/ (PositioningCard, VoiceCard, Calendar)
│   └── launch/ (ReadinessBar, AssetCard, Scheduler)
├── pages/ (Overview, Strategy, ContentStudio, LaunchKit, Settings, Onboarding)
├── hooks/ (useStrategy, useContent, useSocialAccounts, useMode)
└── lib/ (convex.js, constants.js)
```

---

## Key UI Moments

### Strategy Generation (Magic Moment)
1. User fills onboarding → clicks "Generate My Strategy"
2. Full-screen loading with progress steps
3. Strategy reveals with animation
4. Celebration moment → user feels "this is amazing"

### Content Generation
1. Select type → optional custom instructions → Generate
2. Streaming typewriter text in editor
3. Copy / Edit / Regenerate / Post buttons

### Mode Toggle
- Toggle in top bar, confirmation modal on switch
- "Autopilot Active" badge, auto-posts show 🤖 icon

---

## Responsive

| Breakpoint | Behavior |
|------------|----------|
| > 1024px | Full sidebar + content |
| 768–1024px | Icon sidebar + content |
| < 768px | Bottom nav + full-width |
