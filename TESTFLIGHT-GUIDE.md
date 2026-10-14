# TestFlight commands

This file lists the EAS commands that match `eas.json` and `app.json`. It does not record whether an Apple Developer account, an App Store Connect app record, or a finished build exists.

## Identifiers in this repo

- Display name: `Moden`
- Bundle identifier: `com.modenhealth.app`
- Version: `1.0.9`
- iOS `buildNumber`: `8`
- EAS project id: `c211a03a-f1bd-4340-85fd-649a797d2e01`
- EAS CLI range in `eas.json`: `>= 5.2.0`

## Commands

Log in and confirm the Expo account:

```bash
npx eas-cli login
npx eas-cli whoami
```

Build with a profile from `eas.json`. `preview` and `production` use `distribution: store`. `development` is a dev client with `distribution: internal` and is not the store profile.

```bash
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile production --platform ios
```

`submit.production` in `eas.json` is an empty object. Submit uses the CLI flags below:

```bash
npx eas-cli submit --platform ios --latest
npx eas-cli submit --platform ios --id <build-id>
```

List builds:

```bash
npx eas-cli build:list
npx eas-cli build:view
```

Credentials, when needed:

```bash
npx eas-cli credentials
```

This repository does not contain build IDs, tester lists, or App Store Connect group names. Those live in the Expo and Apple accounts used at submit time.

HealthKit usage strings and the `react-native-health` plugin are in `app.json`. See [BUILD-INSTRUCTIONS.md](BUILD-INSTRUCTIONS.md).
