## Phase 4 — Settings, Units, Goals, Theming

### Goals
- Settings screen with unit preferences, goals, and permissions stub
- Persist preferences locally (no cloud)
- Accent color selector (default cyan) and dark-only polish

### Dependencies
- `expo-secure-store` (optional) or `AsyncStorage` for prefs

### Components
- `ListItem.tsx` (switch, select, chevron)
- `AccentPicker.tsx`

### Data/persistence
- `src/storage/preferences.ts` — get/set with schema and migration stubs

### Checklist
- [ ] Add Settings screen and route in tabs
- [ ] Implement units (metric/imperial), time format, calorie goal, sleep target
- [ ] Implement accent picker and theme application
- [ ] Persist/read preferences on app start
- [ ] Add Permissions copy-only section (for Phase 5)
