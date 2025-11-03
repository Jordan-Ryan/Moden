## Phase 2 — Sleep, Recovery, Strain UIs (dummy data)

### Goals
- Implement `Sleep`, `Recovery`, `Strain` tabs with dummy data
- Match Overview aesthetics; reuse shared components; add a few new chart types
- Keep everything local (no HealthKit yet)

### New components
- `AreaChart.tsx` — Victory area (gradient fill) for sleep stages/trends
- `ZoneBars.tsx` — horizontal stacked bars for heart rate zones
- `SegmentedControl.tsx` — Today / Week toggle for each screen

### Screen sketches
- Sleep: sleep duration ring, stages stacked area (light/deep/REM), efficiency card
- Recovery: recovery score ring, HRV + RHR trend, color-coded guidance copy
- Strain: strain score ring/gauge, timeline with workout markers, zone distribution bars

### Data shape (excerpt)
```ts
export const sleepMock = {
  durationMin: 487,
  targetMin: 480,
  efficiency: 0.92,
  stages: [
    { t: 0, light: 0.5, deep: 0.2, rem: 0.1 },
    // ...
  ]
};
export const recoveryMock = { score: 0.64, hrv: [70,72,73,71], rhr: [55,54,54,53] };
export const strainMock = { score: 18.4, zones: [10, 22, 34, 18, 6], timeline: [...] };
```

### Implementation notes
- Compose with existing `RingProgress`, `MiniLineChart`, `StatCard`
- Add new charts with Victory; prefer small, performant datasets
- Use theme cyan for active; success/warn/danger for score bands

### Checklist
- [ ] Create mocks: `src/data/mock/{sleep,recovery,strain}.ts`
- [ ] Build `AreaChart` (VictoryArea with gradient)
- [ ] Build `ZoneBars` (stacked bars)
- [ ] Build `SegmentedControl` (controlled component)
- [ ] Implement `SleepScreen.tsx`
- [ ] Implement `RecoveryScreen.tsx`
- [ ] Implement `StrainScreen.tsx`
- [ ] Wire tabs to real screens (replace placeholders)
- [ ] Add basic empty states + error guards

### Nice-to-have polish
- Subtle Reanimated transitions between segments
- Shareable screenshots (Expo Sharing) — optional
