# Moden

Expo app (`package.json` name `moden`, `app.json` display name Moden). The checked-in sources are a React Native TypeScript app with three tabs: Today, Activity, and Settings.

Current values in `app.json` and `package.json`:

| Field | Value |
| --- | --- |
| Version | 1.0.9 |
| iOS `buildNumber` | 8 |
| Android `versionCode` | 8 |
| iOS bundle identifier and Android package | `com.modenhealth.app` |
| Expo SDK | `~54.0.22` |
| React / React DOM | `19.1.0` |
| React Native | `0.81.5` |

`package.json` does not set an `engines` field. `.npmrc` contains `legacy-peer-deps=true`.

## Setup

From the repository root:

```bash
npm install
```

There is no separate install script. `eas.json` sets `NPM_CONFIG_LEGACY_PEER_DEPS=true` on the `development`, `preview`, and `production` build profiles.

## Run

Scripts in `package.json`:

| Script | Command |
| --- | --- |
| `npm start` | `expo start --dev-client` |
| `npm run dev` | `expo start --dev-client` |
| `npm run ios` | `expo run:ios` |
| `npm run android` | `expo run:android` |
| `npm run web` | `expo start --web` |

`expo-dev-client` is a dependency, and `start` / `dev` pass `--dev-client`. Connecting a development build to Metro is described in [DEV-SERVER-GUIDE.md](DEV-SERVER-GUIDE.md).

`/ios` and `/android` are listed in `.gitignore`. `expo run:ios` and `expo run:android` generate those native projects locally. EAS build profiles are in [BUILD-INSTRUCTIONS.md](BUILD-INSTRUCTIONS.md).

Health data is read in `utils/healthKit.ts` only when `Platform.OS` is `ios` and `AppleHealthKit.initHealthKit` is a function. On other platforms, `context/HealthContext.tsx` sets the error string `HealthKit is unavailable on this device.`

## Layout

- `index.ts` registers `App.tsx` with `registerRootComponent`.
- `App.tsx` mounts `HealthProvider` and a bottom tab navigator (`Today`, `Activity`, `Settings`).
- `navigation/ActivityStack.tsx` stacks `ActivityList` and `ActivityDetail`.
- `utils/healthKit.ts` reads HealthKit samples. `utils/storage.ts` stores calorie and macro targets in AsyncStorage.
- `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`.

A file-by-file snapshot is in [docs/STATE.md](docs/STATE.md). Notes for later edits are in [AGENTS.md](AGENTS.md).

## EAS

`eas.json` requires EAS CLI `>= 5.2.0` and defines three build profiles:

- `development`: `developmentClient: true`, `distribution: internal`, iOS `simulator: false`
- `preview`: `distribution: store`, iOS `simulator: false`
- `production`: `distribution: store`, iOS `simulator: false`

`app.json` `extra.eas.projectId` is `c211a03a-f1bd-4340-85fd-649a797d2e01`. `submit.production` is an empty object.

`app.json` registers the `react-native-health` config plugin and sets `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`. `newArchEnabled` is `false`.
