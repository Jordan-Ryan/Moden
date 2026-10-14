# Repository state

Checked against `package.json`, `app.json`, `eas.json`, `.npmrc`, `.gitignore`, `tsconfig.json`, and the TypeScript sources. This file does not record App Store Connect, EAS build history, or a live install.

## App identity

- Package name: `moden`. Display name and slug in `app.json`: `Moden`.
- Version `1.0.9` in both `package.json` and `app.json`.
- iOS bundle identifier `com.modenhealth.app`, `buildNumber` `8`.
- Android package `com.modenhealth.app`, `versionCode` `8`.
- `ITSAppUsesNonExemptEncryption` is `false`.
- EAS project id: `c211a03a-f1bd-4340-85fd-649a797d2e01`.
- Entry: `index.ts` calls `registerRootComponent` with `App`.

## Screens

`App.tsx` uses `@react-navigation/bottom-tabs` and `components/GlassTabBar.tsx`. Tabs:

1. **Today** (`screens/TodayScreen.tsx`). Reads `useHealth()`. Shows the selected date, hourly steps, macro progress against AsyncStorage targets, and that day's activities. Day changes use `moveDay`. Pull-to-refresh and a 60-second interval while focused call `refresh`.
2. **Activity** (`navigation/ActivityStack.tsx`). `ActivityScreen` loads workouts from `getActivitiesForDateRange` for the previous six months through today, with type filters. `ActivityDetailScreen` receives the selected `Activity` and also calls `AppleHealthKit.getAnchoredWorkouts` and `AppleHealthKit.getHeartRateSamples`.
3. **Settings** (`screens/SettingsScreen.tsx`). Edits calorie and macro targets in grams or percent mode and writes them through `utils/storage.ts`.

`GlassTabBar` renders every route except the last inside one card, and the last route (Settings) as a separate circular control.

## Health data

`utils/healthKit.ts` treats HealthKit as available only when `Platform.OS === 'ios'` and `initHealthKit` is a function. The read list covers steps, workouts, distance, active and basal energy, flights, exercise time, stand time, heart rate (including resting and walking average), energy consumed, protein, carbohydrates, fat, water, sleep, weight, height, BMI, body fat percentage, and mindful sessions. `write` is `[]`.

`getHealthDataForDate` loads steps, activities, and macros, then energy, water, sleep, body measurements, activity metrics, heart rate, and mindfulness. `getBodyMeasurementsForDate` returns weight, height, and BMI. It does not read a body-fat sample, even though `BodyFatPercentage` is in the permission list and `BodyMeasurements` includes `bodyFatPercentage`.

`HealthProvider` stores `permissionsGranted`. No screen reads that field. Today and Activity surface `error` from their own loaders. The provider's unavailable-device message is `HealthKit is unavailable on this device.`

## Local storage

`utils/storage.ts` uses `@react-native-async-storage/async-storage` for calorie targets, macro gram targets, macro percent splits, and the `grams` | `percent` mode.

## UI modules that the sources import

- `@callstack/liquid-glass` is required inside `components/GlassCard.tsx` on iOS. If the module is missing or `isLiquidGlassSupported` is false, the card renders a plain `View`.
- `expo-symbols` `SymbolView` is used on iOS in `ActivityIcon` and the activity screens.
- `react-native-svg` is used by charts, tab icons, and the non-iOS activity icon path.
- `expo-status-bar` is used in `App.tsx` with `style="light"`.

## Config that does not match the UI theme field

`app.json` `userInterfaceStyle` is `light`. `App.tsx` builds its navigation theme with background `#000`, card `#111`, and text `#fff`.

## Tooling present in the tree

- TypeScript `~5.9.2`, `@types/react` `~19.1.0`, `strict` compiler option.
- No `babel.config.*`, `metro.config.*`, CI workflow, or test files are checked in.
- `.gitignore` ignores `node_modules/`, `.expo/`, `/ios`, `/android`, and `.env*.local`.
