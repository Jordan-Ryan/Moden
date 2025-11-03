## Phase 6 — Advanced Insights (local)

### Goals
- Compute weekly deltas, variance, and anomaly flags on-device
- Simple share/export of a weekly report (PDF or image)

### Modules
- `src/insights/metrics.ts` — rolling averages, variance, z-score thresholds
- `src/insights/insightRules.ts` — rule engine mapping metrics → messages
- `src/export/report.ts` — compose shareable view to image/PDF

### Checklist
- [ ] Implement metrics helpers with unit tests
- [ ] Define insight rules for HRV, RHR, Sleep, Strain
- [ ] Add insights panel on Trends and Overview
- [ ] Implement export/share using `expo-sharing` (optional)
