# TestFlight Submission Guide

This guide will help you build and submit your app to TestFlight for testing.

## Prerequisites

1. ✅ **Apple Developer Account** (paid $99/year) - Required for TestFlight
2. ✅ **App Store Connect Access** - Your app must be registered in App Store Connect
3. ✅ **EAS CLI Installed** - We'll verify this in the steps below

## Step 1: Install and Configure EAS CLI

### Install EAS CLI globally
```bash
npm install -g eas-cli
```

### Login to your Expo account
```bash
eas login
```

If you don't have an Expo account, create one at https://expo.dev

### Verify EAS is configured
```bash
eas whoami
```

This should show your Expo account email.

## Step 2: Verify App Store Connect Setup

### Check if your app exists in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Navigate to "My Apps"
4. Look for "Moden" app
   - If it exists: Great! You're ready to build
   - If it doesn't exist: You'll need to create it first (see below)

### Create App in App Store Connect (if needed)

1. Click the "+" button in App Store Connect
2. Select "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Moden
   - **Primary Language**: English
   - **Bundle ID**: com.modenhealth.app (must match your app.json)
   - **SKU**: Any unique identifier (e.g., "moden-health-001")
   - **User Access**: Full Access (or Limited if you prefer)
4. Click "Create"

## Step 3: Build for TestFlight

### Option A: Preview Build (Recommended for Testing)

This creates a build that can be submitted to TestFlight:

```bash
eas build --profile preview --platform ios
```

### Option B: Production Build

For production-ready builds:

```bash
eas build --profile production --platform ios
```

### Build Process

1. **EAS will ask for credentials**:
   - If you have credentials stored, it will use them
   - If not, EAS can manage certificates and provisioning profiles for you
   - Choose "Let EAS handle it" for easiest setup

2. **Build will start**:
   - Takes ~15-20 minutes
   - You'll see progress in the terminal
   - You can also check progress at https://expo.dev/accounts/[your-account]/projects/Moden/builds

3. **Build completes**:
   - You'll get a download link
   - The build will be automatically available for submission

## Step 4: Submit to TestFlight

### Automatic Submission (Recommended)

After the build completes, submit directly to TestFlight:

```bash
eas submit --platform ios --latest
```

This will:
- Find your latest iOS build
- Upload it to App Store Connect
- Process it for TestFlight (takes 10-30 minutes)

### Manual Submission

If you prefer to submit manually:

1. **Download the build**:
   - Go to https://expo.dev/accounts/[your-account]/projects/Moden/builds
   - Download the `.ipa` file

2. **Upload via Transporter**:
   - Download "Transporter" app from Mac App Store
   - Open Transporter
   - Drag and drop the `.ipa` file
   - Click "Deliver"

3. **Or upload via Xcode**:
   - Open Xcode
   - Window > Organizer
   - Select your build
   - Click "Distribute App"
   - Follow the wizard

## Step 5: Configure TestFlight

### In App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Select "Moden" app
3. Go to "TestFlight" tab
4. Wait for processing to complete (10-30 minutes)

### Add Testers

#### Internal Testers (Up to 100)
- Go to "Internal Testing" section
- Click "+" to add testers
- Add email addresses of team members
- They'll receive an email invitation

#### External Testers (Unlimited)
1. Create a test group:
   - Click "External Testing" or "Groups"
   - Click "+" to create new group
   - Name it (e.g., "Beta Testers")

2. Add build to group:
   - Select your build
   - Click "Add to Group"
   - Select your test group

3. Submit for Beta Review (first time only):
   - Apple needs to review external builds
   - Click "Submit for Review"
   - Fill in required information:
     - What to Test: Description of what testers should test
     - Contact Information: Your email
     - Demo Account: If needed
     - Notes: Any additional info
   - This review takes 24-48 hours

4. Add external testers:
   - After Beta Review approval, add testers
   - They'll receive email invitations

## Step 6: Testers Install App

Testers will:
1. Receive an email invitation from Apple
2. Click "Start Testing" in the email
3. Install "TestFlight" app from App Store (if not already installed)
4. Accept the invitation
5. Download and install your app from TestFlight

## Troubleshooting

### Build Fails

**"No signing certificate"**
- Make sure you have an Apple Developer account
- EAS should handle this automatically, but you may need to accept certificates in App Store Connect

**"HealthKit capability not available"**
- This is normal - EAS will add it automatically
- If build fails, check that HealthKit permissions are in app.json (already done ✅)

**"Bundle identifier mismatch"**
- Verify bundle identifier in app.json matches App Store Connect
- Should be: `com.modenhealth.app`

### Submission Fails

**"Build not found"**
- Make sure build completed successfully
- Use `eas build:list` to see all builds
- Use `eas submit --platform ios --id [build-id]` with specific build ID

**"App not found in App Store Connect"**
- Create the app first (see Step 2)
- Make sure bundle identifier matches exactly

### TestFlight Issues

**"Build processing taking too long"**
- Normal processing takes 10-30 minutes
- Can take up to 2 hours during busy periods
- Check App Store Connect for status

**"Testers can't install"**
- Make sure build is added to a test group
- For external testers, Beta Review must be approved first
- Check that testers have accepted invitation

**"App crashes on launch"**
- Check device logs in TestFlight
- Make sure you're testing on a physical device (not simulator)
- Verify HealthKit permissions are granted

## Quick Reference Commands

```bash
# Check EAS login
eas whoami

# Build for TestFlight
eas build --profile preview --platform ios

# Submit to TestFlight
eas submit --platform ios --latest

# List all builds
eas build:list

# View build status
eas build:view

# Update credentials if needed
eas credentials
```

## Next Steps After TestFlight

1. **Gather Feedback**: Use TestFlight to collect tester feedback
2. **Fix Issues**: Address any bugs or issues found
3. **Iterate**: Build new versions and submit updates
4. **Prepare for Production**: When ready, submit for App Store review

## Notes

- ✅ HealthKit permissions are already configured in app.json
- ✅ EAS project ID is configured: c211a03a-f1bd-4340-85fd-649a797d2e01
- ✅ Bundle identifier: com.modenhealth.app
- ✅ Build profiles are configured in eas.json

## Support

- EAS Documentation: https://docs.expo.dev/build/introduction/
- TestFlight Guide: https://developer.apple.com/testflight/
- Expo Discord: https://chat.expo.dev/

