# Submit Build 1.0.1 to TestFlight

## Current Status

✅ **Build 1.0.1 is finished and ready**
- Build ID: `23df667c-8bf5-4405-b402-90f73efec2de`
- Version: 1.0.1
- Status: Finished

❌ **Not yet submitted to TestFlight**

## Steps to Submit

### Step 1: Submit Build to App Store Connect

Run this command in your terminal:

```bash
cd /Users/jordanryan/Documents/GitHub/Moden
eas submit --platform ios --latest
```

Or submit the specific build:

```bash
eas submit --platform ios --id 23df667c-8bf5-4405-b402-90f73efec2de
```

**When prompted:**
- Enter your Apple ID email
- Enter your Apple ID password
- If 2FA enabled, enter the code
- This uploads the build to App Store Connect

### Step 2: Wait for Processing (10-30 minutes)

1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Select "Moden" app
4. Go to **"TestFlight"** tab
5. Wait for build 1.0.1 to process (status will show "Processing" then "Ready to Submit")

### Step 3: Add Build to Test Group

1. In TestFlight tab, go to **"Internal Testing"**
2. Click on **"Team (Expo)"** group
3. Click **"Builds"** tab
4. Click **"+"** to add a build
5. Select **build 1.0.1** (version 1.0.1, build 1)
6. Click **"Add"**

### Step 4: Install New Build on Device

1. Open **TestFlight** app on your iPhone
2. You should see **Moden** with an update available
3. Tap **"Update"** or **"Install"**
4. Wait for installation to complete

### Step 5: Open App and Grant Permissions

1. **Open the Moden app** (the new 1.0.1 version)
2. The app will automatically request HealthKit permissions
3. **Tap "Grant HealthKit Permissions"** button if you see it
4. **Allow access** to health data types you want to share
5. Moden will now appear in **Settings > Privacy & Security > Health**

## Why Moden Isn't Listed Yet

The app won't appear in Settings > Privacy & Security > Health until:

1. ✅ You install the **new build (1.0.1)** from TestFlight
2. ✅ You **open the app** and it requests permissions
3. ✅ You **grant permissions** when prompted

The old build (1.0.0) didn't have the permission request code, so it never asked for HealthKit access.

## Quick Checklist

- [ ] Submit build 1.0.1 to App Store Connect (`eas submit`)
- [ ] Wait for processing (10-30 minutes)
- [ ] Add build 1.0.1 to "Team (Expo)" test group
- [ ] Install build 1.0.1 from TestFlight on device
- [ ] Open Moden app and grant HealthKit permissions
- [ ] Check Settings > Privacy & Security > Health > Moden

## Troubleshooting

### "Build not showing in TestFlight"
- Make sure build is submitted: `eas submit --platform ios --latest`
- Wait for processing to complete (can take up to 30 minutes)
- Make sure build is added to test group

### "Still don't see Moden in Health settings"
- Make sure you installed build 1.0.1 (not 1.0.0)
- Make sure you opened the app and granted permissions
- Try force-quitting the app and reopening it
- Check that you actually granted permissions (not just dismissed the prompt)

### "No permission prompt appears"
- The app should request permissions automatically on first launch
- If not, tap the "Grant HealthKit Permissions" button
- Check console logs for errors

## After Permissions Are Granted

Once Moden appears in Settings > Privacy & Security > Health:

1. You can enable/disable specific data types
2. The app will display your health data
3. You can refresh data using the refresh button

---

**The key step**: Submit build 1.0.1 and install it on your device. The old build (1.0.0) doesn't have the permission request code.

