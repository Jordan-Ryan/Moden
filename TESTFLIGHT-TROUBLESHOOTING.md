# TestFlight "No Build Available" - Troubleshooting Guide

## Problem
You see "No build available" next to your tester name in TestFlight.

## Solution

There are a few possible causes. Follow these steps in order:

### Step 1: Submit the Build to App Store Connect

Your build is finished, but it needs to be **submitted** to App Store Connect first.

**Run this command:**
```bash
cd /Users/jordanryan/Documents/GitHub/Moden
eas submit --platform ios --latest
```

Or submit a specific build:
```bash
eas submit --platform ios --id 06755d95-17cc-494d-b23a-f3ed55b5dc50
```

**What happens:**
- EAS uploads the build to App Store Connect
- Processing takes 10-30 minutes
- You'll see the build appear in App Store Connect

### Step 2: Wait for Processing in App Store Connect

1. **Go to App Store Connect**
   - https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account
   - Select your "Moden" app
   - Go to **"TestFlight"** tab

2. **Check Build Status**
   - Look for your build (version 1.0.0, build 1)
   - Status should show:
     - **"Processing"** - Wait 10-30 minutes
     - **"Ready to Submit"** - Good, proceed to next step
     - **"Invalid Binary"** - There's an issue, check for errors

3. **Wait for Processing to Complete**
   - Processing can take 10-30 minutes
   - Sometimes up to 2 hours during busy periods
   - You'll see a notification when it's ready

### Step 3: Add Build to a Test Group

**This is likely the issue!** Even if the build is processed, you need to add it to a test group.

#### Option A: Internal Testing (Fastest - No Review Needed)

1. **In App Store Connect → TestFlight tab**
2. **Go to "Internal Testing" section**
3. **Click on your test group** (or create one if needed)
4. **Click "+" to add a build**
5. **Select your build** (version 1.0.0, build 1)
6. **Click "Add"**
7. **Add yourself as a tester:**
   - Click "Testers" tab
   - Click "+" to add testers
   - Enter your email address
   - Click "Add"

#### Option B: External Testing (Requires Beta Review)

1. **In App Store Connect → TestFlight tab**
2. **Go to "External Testing" section**
3. **Create a test group** (if you don't have one):
   - Click "+" to create new group
   - Name it (e.g., "Beta Testers")
   - Click "Create"
4. **Add build to group:**
   - Click on your test group
   - Click "+" to add a build
   - Select your build (version 1.0.0, build 1)
   - Click "Add"
5. **Submit for Beta Review** (first time only):
   - Click "Submit for Review"
   - Fill in the form:
     - **What to Test**: "Test HealthKit integration and daily health data display"
     - **Contact Information**: Your email
     - **Notes**: "Testing HealthKit data fetching and display"
   - Click "Submit"
   - Review takes 24-48 hours
6. **After approval, add testers:**
   - Click "Testers" tab
   - Click "+" to add testers
   - Enter your email address
   - Click "Add"

### Step 4: Accept TestFlight Invitation

1. **Check your email** for a TestFlight invitation
2. **Click "Start Testing"** in the email
3. **Or use TestFlight app:**
   - Open TestFlight app on your iPhone
   - Sign in with your Apple ID
   - You should see "Moden" app
   - Tap "Install" or "Update"

### Step 5: Verify Build is Available

**In App Store Connect:**
1. Go to TestFlight → Testers tab
2. Find yourself in the tester list
3. You should see:
   - Your name/email
   - Build version (1.0.0)
   - Build number (1)
   - Status: "Available" or "Installed"

**If you still see "No build available":**
- Make sure the build is added to the test group
- Make sure you're added as a tester in that group
- Make sure you've accepted the TestFlight invitation

## Quick Checklist

- [ ] Build is finished (✅ You have build ID: 06755d95-17cc-494d-b23a-f3ed55b5dc50)
- [ ] Build has been submitted to App Store Connect (`eas submit`)
- [ ] Build is processed in App Store Connect (status: "Ready to Submit")
- [ ] Build is added to a test group (Internal or External)
- [ ] You are added as a tester in that group
- [ ] You've accepted the TestFlight invitation
- [ ] TestFlight app shows the build

## Common Issues

### "Build not showing in App Store Connect"
- **Solution**: Run `eas submit --platform ios --latest`
- Wait 10-30 minutes for processing

### "Build shows as 'Processing' forever"
- **Solution**: Wait up to 2 hours. Check for errors in App Store Connect

### "Build shows as 'Invalid Binary'"
- **Solution**: Check build logs for errors
- Common issues: Missing capabilities, invalid provisioning profile
- Check email from Apple for specific error details

### "I see the build but can't add it to test group"
- **Solution**: Make sure build status is "Ready to Submit"
- If it's "Processing", wait for it to complete

### "I'm added as tester but see 'No build available'"
- **Solution**: 
  1. Make sure build is added to the test group
  2. Make sure you've accepted the TestFlight invitation
  3. Check TestFlight app, not just App Store Connect

### "No TestFlight invitation email"
- **Solution**: 
  1. Check spam folder
  2. Make sure email is correct in App Store Connect
  3. Manually open TestFlight app and sign in
  4. The app should appear if you're added as a tester

## Quick Fix Commands

```bash
# Submit latest build to TestFlight
eas submit --platform ios --latest

# Submit specific build
eas submit --platform ios --id 06755d95-17cc-494d-b23a-f3ed55b5dc50

# Check build status
eas build:list --platform ios --limit 1
```

## Next Steps After Build is Available

1. **Install TestFlight app** on your iPhone (if not already installed)
2. **Accept invitation** or sign in with your Apple ID
3. **Install Moden** from TestFlight
4. **Test HealthKit permissions** on first launch
5. **Verify data fetching** works correctly

## Still Having Issues?

If you've completed all steps above and still see "No build available":

1. **Double-check App Store Connect:**
   - TestFlight → Testers tab
   - Verify you're listed as a tester
   - Verify build is in the test group

2. **Check TestFlight app:**
   - Sign out and sign back in
   - Pull down to refresh
   - Check for updates

3. **Verify Apple ID:**
   - Make sure you're using the same Apple ID in:
     - App Store Connect
     - TestFlight app
     - Device settings

4. **Contact Support:**
   - App Store Connect support: https://developer.apple.com/contact/
   - EAS Support: https://expo.dev/accounts/jordanrtesting/projects/Moden/support

---

**Most Common Fix**: Build needs to be added to a test group in App Store Connect. Even if submitted and processed, it won't show until it's added to a group!

