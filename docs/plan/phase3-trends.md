## Phase 3 — Trends Dashboard (dummy → pluggable)

### Goals
- Weekly/Monthly trends for HRV, RHR, Steps, Calories, Strain
- Range picker and compare-to-baseline deltas
- Reusable chart container for future real data

### Components
- `RangePicker.tsx` — Week/Month/Custom
- `TrendsChart.tsx` — multi-series line/area with legends
- `DeltaBadge.tsx` — up/down arrow with % change and color coding

### Data shape
```ts
export type TrendPoint = { d: string; value: number };
export const trendsMock = {
  hrv: [...], rhr: [...], steps: [...], calories: [...], strain: [...]
};
```

### UX
- Grid of metric cards; tapping expands into full-width chart with insights
- Insights callouts: simple heuristics (e.g., "HRV up 6% vs last week")

### Checklist
- [ ] Add mock trend datasets (`src/data/mock/trends.ts`)
- [ ] Build `RangePicker`
- [ ] Build `TrendsChart` with Victory (multi-series)
- [ ] Implement `TrendsScreen.tsx` and add to tabs or stack
- [ ] Implement `DeltaBadge` and insight callouts
