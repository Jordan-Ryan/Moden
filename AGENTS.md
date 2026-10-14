# Agent notes

Facts below are taken from the files in this repository. A longer snapshot is in [docs/STATE.md](docs/STATE.md). Setup and run commands are in [README.md](README.md).

## Commands

Use the scripts in `package.json`. `npm start` and `npm run dev` both run `expo start --dev-client`. There is no `test`, `lint`, or `typecheck` script.

`.npmrc` sets `legacy-peer-deps=true`. `package.json` does not declare `engines`.

## Where behavior lives

- Navigation is React Navigation in `App.tsx` and `navigation/ActivityStack.tsx`. `expo-router` is listed in `package.json` and is not imported by the TypeScript sources. There is no `app/` router directory.
- `expo-health` is listed in `package.json` and is not imported. HealthKit calls go through `react-native-health` in `utils/healthKit.ts` and `screens/ActivityDetailScreen.tsx`.
- `HealthProvider` in `context/HealthContext.tsx` checks and requests read permissions, then calls `getHealthDataForDate`. The permission object in `utils/healthKit.ts` sets `write` to an empty array.
- Calorie and macro targets are AsyncStorage keys in `utils/storage.ts` (`moden.calorieTarget.v1`, `moden.macroTargets.v1`, `moden.macroSplit.v1`, `moden.macroMode.v1`).
- Tab icons load SVGs from `assets/icons/` via `components/TabIcon.tsx`. Activity icons use `expo-symbols` on iOS and SVGs from `assets/icons/activity/` on other platforms (`components/ActivityIcon.tsx`).

## Native projects

`.gitignore` ignores `/ios` and `/android`. Those directories are produced by Expo prebuild or `expo run:*`. They are not part of the committed tree.

`app.json` sets `newArchEnabled` to `false` and `userInterfaceStyle` to `light`. `App.tsx` passes a dark navigation theme (`background: '#000'`).

## Dependencies present in `package.json` with no import under the app sources

`expo-blur`, `expo-constants`, `expo-haptics`, `expo-health`, `expo-linking`, and `expo-router`.

`components/TabIcon.tsx` and `components/ActivityIcon.tsx` import `expo-asset`, which is not a direct entry in `package.json`.

## Docs that are not a source of version or build identity

Version and build numbers are `app.json` (`1.0.9`, iOS `buildNumber` `8`, Android `versionCode` `8`) and `package.json` `version` `1.0.9`. Do not copy build IDs, tester emails, or machine paths from deleted notes or from git history into new docs.
