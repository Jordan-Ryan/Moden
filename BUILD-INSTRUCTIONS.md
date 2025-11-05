# HealthKit Build Instructions

## Prerequisites
- ✅ Packages installed (`expo-dev-client`, `react-native-health`)
- ✅ HealthKit permissions added to `app.json`
- ✅ `utils/healthKit.ts` created with implementation

## Build Options

### Option A: EAS Build (Recommended - Cloud Build)

**Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

**Step 2: Login to Expo**
```bash
eas login
```

**Step 3: Configure EAS (if not already done)**
```bash
eas build:configure
```

**Step 4: Build for iOS Device**
```bash
eas build --profile development --platform ios
```

This will:
- Create a development build in the cloud
- Allow you to install on your device via TestFlight or direct download
- Takes ~15-20 minutes

**Step 5: After build completes, install on device**
- Download the `.ipa` file from the EAS dashboard
- Install via TestFlight or use the download link

---

### Option B: Local Build (Requires Xcode & Apple Developer Account)

**Step 1: Prebuild native code**
```bash
npx expo prebuild
```

This creates the `ios/` folder with native code.

**Step 2: Open in Xcode**
```bash
open ios/Moden.xcworkspace
```

**Step 3: Configure HealthKit Capability in Xcode**
1. In Xcode, select your project (Moden) in the left sidebar
2. Select the "Moden" target
3. Go to the "Signing & Capabilities" tab
4. Click the "+ Capability" button
5. Search for and add "HealthKit"
6. Make sure your Apple Developer account is selected for signing

**Step 4: Connect your iOS device**
- Connect via USB
- Trust the computer on your device
- Select your device in Xcode's device dropdown (top bar)

**Step 5: Build and Run**
- In Xcode, click the Play button (▶️) or press `Cmd + R`
- Wait for build to complete (~5-10 minutes first time)

---

## After Build: Enable HealthKit Permissions

1. **First Launch**: The app will request HealthKit permissions automatically
2. **If denied**: Go to Settings > Privacy & Security > Health > Moden
3. **Enable**: Turn on all the data types you want to share

## Testing HealthKit

Once the app is installed:

1. **Request Permissions**: The app should prompt for HealthKit access
2. **Grant Permissions**: Allow access to Steps, Workouts, etc.
3. **View Data**: Navigate to the Today view to see your real health data
4. **Check Console**: If data isn't showing, check Xcode console or Expo logs

## Troubleshooting

### "HealthKit is not available"
- Make sure you're running on a **physical iOS device** (not simulator)
- Verify HealthKit capability is added in Xcode

### "No data showing"
- Check Health app on your device - do you have steps/workouts recorded?
- Grant permissions in Settings > Privacy & Security > Health > Moden
- Check console logs for errors

### Build Errors
- **"No signing certificate"**: Make sure you're logged into Xcode with your Apple ID
- **"HealthKit capability not available"**: You need a paid Apple Developer account ($99/year)
- **"react-native-health not found"**: Run `cd ios && pod install && cd ..`

## Next Steps After Successful Build

1. Update your app code to use `requestHealthKitPermissions()` on first launch
2. Replace dummy data calls with `getHealthDataForDate()` from `utils/healthKit.ts`
3. Test on multiple dates to ensure data fetching works correctly
