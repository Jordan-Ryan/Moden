# Development server

`package.json` already defines the dev-client start scripts:

```bash
npm start
# or
npm run dev
```

Both run `expo start --dev-client`. The CLI prints the Metro URL. Use that URL. Do not assume a fixed host.

`expo-dev-client` is a dependency. These scripts pass `--dev-client`, so the process is the one used with a development build, not a separate Expo Go script.

## Connect a development build

1. Start `npm start` in the repository root.
2. Open the Moden development build on the device or simulator.
3. If the app does not attach on its own, open the dev menu and enter the URL printed by the CLI.

Tunnel mode is a start flag, not a separate npm script:

```bash
npx expo start --dev-client --tunnel
```

Other flags accepted by the same CLI entry are `--localhost` and `--lan`.

Reload from the dev menu, or press `r` in the Expo CLI when that prompt is shown.

## What reloads

JavaScript and TypeScript changes reload through Metro while this server is running. Native module or config-plugin changes are picked up by a new native build (`npm run ios`, `npm run android`, or an EAS build). `/ios` and `/android` are gitignored and are not in the committed tree.

## Other run scripts

| Script | Command |
| --- | --- |
| `npm run ios` | `expo run:ios` |
| `npm run android` | `expo run:android` |
| `npm run web` | `expo start --web` |

On web and Android, `utils/healthKit.ts` reports HealthKit as unavailable because the availability check requires `Platform.OS === 'ios'` and a linked `initHealthKit` function.
