## Phase 1 – Expo RN App (Overview tab + tabs scaffold)

### Goals
- Expo React Native app with dark, minimal UI and cyan accents
- Single implemented screen: Overview (dummy data)
- Bottom tab navigation scaffold for Sleep, Recovery, Strain, Settings
- No auth/DB; all local for now

### Tech choices
- Expo (TypeScript), React Navigation
- Charts: victory-native (+ react-native-svg)
- Animations: react-native-reanimated
- Styling: theme tokens for dark UI with cyan accent
- Local mock data modules

### Getting started
```bash
# 1) Create app (TS)
npx create-expo-app@latest moden --template
# Choose: blank (TypeScript)

cd moden

# 2) Install navigation + deps
expo install @react-navigation/native react-native-screens react-native-safe-area-context
npm i @react-navigation/native-stack @react-navigation/bottom-tabs

# 3) Install charts + svg + gradient
expo install react-native-svg
npm i victory-native expo-linear-gradient

# 4) Install Reanimated
expo install react-native-reanimated

# 5) Configure Reanimated plugin (babel.config.js)
# Add: plugins: ['react-native-reanimated/plugin']  (must be last)

# 6) Start iOS
npm run ios
```

### Project structure
```text
src/
  navigation/
    RootTabs.tsx
  screens/
    OverviewScreen.tsx
    PlaceholderScreen.tsx
  components/
    HeaderDate.tsx
    RingProgress.tsx
    GaugeArc.tsx
    StatCard.tsx
    MiniLineChart.tsx
    ActivityListItem.tsx
  data/
    mock/
      overview.ts
  theme/
    colors.ts
    spacing.ts
    typography.ts
    theme.ts
  utils/
    format.ts
    logger.ts
App.tsx
```

### Theme tokens (dark + cyan)
- Background: `#0B0D10`
- Surfaces: `#111418`, `#161A20`
- Text: primary `#E6EAF2`, secondary `#9AA6B2`, muted `#6B7785`
- Accent cyan: `#22D3EE` (optionally teal blend `#14B8A6`)
- Status: success `#22C55E`, warning `#F59E0B`, danger `#EF4444`

### Navigation
- Bottom tabs: Overview (implemented), Sleep, Recovery, Strain, Settings (placeholders)
- Hidden labels, monochrome icons; cyan active tint
- Dark translucent tab bar

### Mock data shape (excerpt)
```ts
export const overviewMock = {
  date: '2025-06-27',
  recovery: { score: 0.65, hrv: 73, rhr: 54 },
  sleep: { durationMin: 507, targetMin: 480 },
  strain: { score: 18.4 },
  activities: [
    { id: 'ride', type: 'Cycling', durationMin: 97, start: '13:47', end: '16:14', intensity: 0.8 },
    { id: 'sleep', type: 'Sleep', durationMin: 527, start: '22:35', end: '08:29', intensity: 0.2 },
  ],
  trends: {
    hrv: [70,71,72,73,69,74,73],
    rhr: [56,55,55,54,55,53,54],
    stress: [0.8,1.2,1.0,1.6,2.4,2.0,1.7]
  }
};
```

### Key components
- RingProgress
  - Props: `size`, `strokeWidth`, `value` (0..1), `trackColor`, `progressColor`
  - Implementation: `react-native-svg` `Circle` with strokeDashoffset
- GaugeArc
  - Semicircle gauge for stress/strain indicator (optional in Phase 1)
- MiniLineChart
  - Victory `VictoryLine` sparkline; supports gradient stroke
- StatCard
  - Title, value, subtitle, optional right-slot (sparkline)
- ActivityListItem
  - Icon, label, duration, start/end time, subtle right-side indicator
- HeaderDate
  - Left/right chevrons and date label; no real paging yet

### Overview layout
- Top bar: avatar placeholder, battery glyph
- Date selector (HeaderDate)
- Hero rings: Recovery (color-coded), Strain, Sleep progress to 8h
- Trends mini-card: HRV vs RHR (two lines)
- Activities list: Cycling and Sleep items
- Key stats: HRV, Sleep Performance, Calories — `StatCard`s with sparklines

### Error handling & logging
- Guard against NaN/undefined in components; default to 0 and `logger.warn()`
- `logger` wraps `console` and can be expanded later

### Out of scope (Phase 1)
- HealthKit/real data, persistence, advanced insights

### Next steps (checklist)
- [ ] Initialize Expo TS app and configure Reanimated plugin
- [ ] Install navigation, svg, victory, gradient dependencies
- [ ] Create theme tokens in `src/theme` (cyan accent, dark surfaces)
- [ ] Implement bottom tab navigator with Overview active + placeholders
- [ ] Add `src/data/mock/overview.ts`
- [ ] Build `RingProgress` (SVG)
- [ ] Build `MiniLineChart` (Victory)
- [ ] Create `StatCard` and `ActivityListItem`
- [ ] Implement `OverviewScreen` using components and mock data
- [ ] Add `format` and `logger` utilities
