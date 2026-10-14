# Local checks before an iOS build

These checks use files in the repo. They do not confirm App Store Connect, certificates, or an existing EAS build. Those are not stored here.

## Values that should match `app.json` and `package.json`

- Version in both files: `1.0.9`
- iOS `buildNumber`: `8`
- Android `versionCode`: `8`
- Bundle identifier and Android package: `com.modenhealth.app`
- `extra.eas.projectId`: `c211a03a-f1bd-4340-85fd-649a797d2e01`

```bash
node -e "const a=require('./app.json').expo; const p=require('./package.json'); console.log({version:a.version, packageVersion:p.version, buildNumber:a.ios.buildNumber, versionCode:a.android.versionCode, bundleIdentifier:a.ios.bundleIdentifier, packageName:a.android.package, projectId:a.extra.eas.projectId})"
```

## HealthKit entries present in the tree

- `app.json` `ios.infoPlist` has `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`.
- `app.json` `plugins` includes `react-native-health` with the same two strings.
- `utils/healthKit.ts` sets `write` to `[]` and lists the read types documented in [APPSTORE-CONNECT-HEALTHKIT.md](APPSTORE-CONNECT-HEALTHKIT.md).

## EAS profile to pass

`eas.json` profiles are `development`, `preview`, and `production`. Store distribution is `preview` and `production`. See [BUILD-INSTRUCTIONS.md](BUILD-INSTRUCTIONS.md) and [TESTFLIGHT-GUIDE.md](TESTFLIGHT-GUIDE.md).

`.npmrc` is `legacy-peer-deps=true`. Each build profile also sets `NPM_CONFIG_LEGACY_PEER_DEPS=true`.
