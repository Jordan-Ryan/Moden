# Builds

HealthKit reads are implemented in `utils/healthKit.ts`. `context/HealthContext.tsx` calls `checkHealthKitPermissions`, `requestHealthKitPermissions`, and `getHealthDataForDate`. `app.json` includes the usage strings and the `react-native-health` config plugin.

`/ios` and `/android` are gitignored. They appear only after a local prebuild or `expo run:*`.

## EAS profiles

`eas.json` is already in the repo (`cli.version` `>= 5.2.0`). The build profiles are `development`, `preview`, and `production`. Each sets `NPM_CONFIG_LEGACY_PEER_DEPS=true`. iOS `simulator` is `false` on all three. `development` sets `developmentClient: true` and `distribution: internal`. `preview` and `production` set `distribution: store`.

Examples that match those profile names:

```bash
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile production --platform ios
```

`eas.json` `submit.production` is `{}`. A submit call uses the EAS CLI's prompts and that empty production submit block:

```bash
npx eas-cli submit --platform ios --latest
```

`app.json` `extra.eas.projectId` is `c211a03a-f1bd-4340-85fd-649a797d2e01`. This repo does not store EAS build IDs or App Store Connect processing state.

Install EAS CLI separately if it is not on the machine (`npm install -g eas-cli`). Log in with `eas login`. `eas build:configure` rewrites `eas.json`; the file is already present.

## Local native build

```bash
npx expo prebuild
npm run ios
```

`npm run ios` is `expo run:ios`. `npm run android` is `expo run:android`. After prebuild, the Xcode workspace is under the generated `ios/` directory. `app.json` `name` is `Moden`, which is the name Expo uses for that project.

`app.json` already passes HealthKit usage strings through the `react-native-health` plugin:

- `healthSharePermission`: `Moden needs access to your health data to display your steps, activity, and fitness metrics.`
- `healthUpdatePermission`: `Moden needs permission to read your health data to track your daily activity and nutrition goals.`

The same two strings are `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`.

## What the running app does with HealthKit

`isHealthKitAvailable` is true only when the platform is iOS and `AppleHealthKit.initHealthKit` is a function. The code does not contain a separate simulator check.

`HealthProvider` requests read access when Today loads. The permission object's `write` array is empty. There is no "Grant HealthKit Permissions" button in the screens.
