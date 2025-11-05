# Connecting Development Build to Dev Server

After installing the development build on your device, you need to connect it to a development server to load your JavaScript code.

## Step 1: Start the Development Server

Run this command in your project directory:

```bash
npx expo start --dev-client
```

This will:
- Start the Metro bundler
- Show a QR code and connection options
- Display the server URL (usually `exp://192.168.x.x:8081`)

## Step 2: Connect Your Device

### Option A: Same Wi-Fi Network (Recommended)
1. Make sure your **iPhone** and **computer** are on the **same Wi-Fi network**
2. Open the **Moden** app on your device
3. It should automatically detect and connect to the dev server
4. The app will reload with your latest code

### Option B: Tunnel Mode (If Same Network Doesn't Work)
1. In the terminal where `expo start` is running, press **`s`** to open connection options
2. Select **"Tunnel"** mode
3. Or restart with: `npx expo start --dev-client --tunnel`
4. Open the app on your device - it should connect automatically

### Option C: Manual Connection
1. Shake your device (or press `Cmd+D` in simulator) to open the dev menu
2. Tap **"Enter URL manually"**
3. Enter the URL shown in your terminal (e.g., `exp://192.168.1.100:8081`)

## Troubleshooting

### "No development server found"
- Make sure the dev server is running (`npx expo start --dev-client`)
- Check that both devices are on the same Wi-Fi network
- Try tunnel mode: `npx expo start --dev-client --tunnel`
- Restart the app on your device

### "Unable to connect"
- Check your firewall - port 8081 should be open
- Try tunnel mode (bypasses network issues)
- Make sure your device can reach your computer's IP address

### App won't reload
- Shake device → "Reload"
- Or press `r` in the terminal to reload

## Quick Start Script

You can add this to your `package.json` scripts:

```json
"scripts": {
  "dev": "expo start --dev-client"
}
```

Then run: `npm run dev`

## Important Notes

- The development build is just the native shell - your JavaScript code still runs from the dev server
- Changes to native code (like adding new native modules) require rebuilding
- Changes to JavaScript/TypeScript reload automatically when connected
- Keep the dev server running while developing
