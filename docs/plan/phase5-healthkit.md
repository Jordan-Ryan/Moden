## Phase 5 — Apple Health (HealthKit) Integration

### Goals
- Read HRV, Resting HR, Heart Rate samples, Sleep, Steps, Workouts
- Permission flow and error states; on-device cache

### Dependencies
- Expo: use `expo-health` (if available) or bare module `react-native-health` via config plugin
- If bare module required: prebuild and iOS permissions in `Info.plist`

### Data architecture
- `src/health/healthkit.ts` — permission requests, queries per metric
- `src/health/adapters.ts` — map HealthKit → domain models
- `src/health/cache.ts` — simple date-bounded cache (AsyncStorage)

### Permissions (iOS)
- Add `NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`

### Checklist
- [ ] Choose library and configure `app.json` with permissions
- [ ] Implement permission request screen (from Settings or on first launch)
- [ ] Implement readers: HRV, RHR, HR samples, Sleep, Steps, Workouts
- [ ] Map to domain models used by screens
- [ ] Cache latest reads and add manual refresh
- [ ] Toggle between mock vs HealthKit sources
