# Fix "No Builds Available" for Tester in TestFlight

## Problem
Your TestFlight group shows "1 Build" but the tester shows "No Builds Available"

## Solution

The build exists but isn't assigned to the tester. Here's how to fix it:

### Step 1: Check the Builds Tab

1. **In App Store Connect → TestFlight**
2. **Click on "Team (Expo)" group** (you're already there)
3. **Click the "Builds" tab** (next to "Testers" tab)
4. **Check if the build is listed there**

You should see:
- Build version (e.g., 1.0.0)
- Build number (e.g., 1)
- Status (should be "Ready to Test" or "Processing")

### Step 2: Enable the Build for Testing

If the build shows a status other than "Ready to Test":

1. **Click on the build** in the Builds tab
2. **Look for "Enable for Testing" button**
3. **Click "Enable for Testing"**
4. **Wait for processing** (usually instant, but can take a few minutes)

### Step 3: Assign the Build to the Tester

1. **Go back to "Testers" tab**
2. **Select the tester** (click the radio button next to jordan-matthew-ryan@live.co.uk)
3. **Click the "..." menu** (three dots) or **right-click**
4. **Select "Edit Tester"** or **"Assign Builds"**
5. **Check the box next to the build** (version 1.0.0, build 1)
6. **Click "Save"** or **"Done"**

OR

1. **Go to "Builds" tab**
2. **Click on the build**
3. **Look for "Testers" section** or **"Assign to Testers"**
4. **Check the box next to jordan-matthew-ryan@live.co.uk**
5. **Click "Save"**

### Step 4: Send TestFlight Invitation (If Needed)

1. **In "Testers" tab**
2. **Select the tester**
3. **Click "Resend Invitation"** or **"Send Invitation"**
4. **Check the email** (jordan-matthew-ryan@live.co.uk)
5. **Click the link in the email** to accept

### Step 5: Verify in TestFlight App

1. **Open TestFlight app** on your iPhone
2. **Sign in** with jordan-matthew-ryan@live.co.uk
3. **You should now see "Moden Health"** app
4. **Tap "Install"** or **"Update"**

## Quick Fix Steps (Summary)

1. ✅ Go to **TestFlight → Team (Expo) → Builds tab**
2. ✅ Make sure build status is **"Ready to Test"**
3. ✅ If not, click **"Enable for Testing"**
4. ✅ Go to **Testers tab**
5. ✅ Select tester **jordan-matthew-ryan@live.co.uk**
6. ✅ Assign the build to the tester
7. ✅ Send TestFlight invitation (if needed)
8. ✅ Check TestFlight app on device

## Common Issues

### "Build shows as 'Processing'"
- **Solution**: Wait 10-30 minutes for processing
- Check back later

### "Build shows as 'Expired'"
- **Solution**: Builds expire after 90 days
- You'll need to submit a new build

### "Can't find 'Assign Builds' option"
- **Solution**: 
  1. Go to Builds tab
  2. Click on the specific build
  3. Look for "Testers" section
  4. Add tester there

### "Build is 'Ready to Test' but not showing"
- **Solution**: 
  1. Make sure build is enabled for testing
  2. Make sure tester has accepted invitation
  3. Try refreshing the TestFlight app

## Alternative: Check Build Details

1. **Go to TestFlight → Builds tab** (top level, not in group)
2. **Click on iOS builds**
3. **Find your build** (version 1.0.0, build 1)
4. **Click on it**
5. **Check "Testing" section**
   - Should show "Team (Expo)" as assigned group
   - Should show tester as assigned
6. **If not assigned**, click **"Assign to Testers"** and add the tester

## Still Not Working?

If the build still doesn't show:

1. **Remove and re-add the tester:**
   - Go to Testers tab
   - Select tester
   - Click "Remove" or delete
   - Click "+" to add tester again
   - Enter email: jordan-matthew-ryan@live.co.uk
   - Click "Add"

2. **Check build compatibility:**
   - Make sure build is compatible with your device
   - Check iOS version requirements

3. **Try a different approach:**
   - Go to Builds tab (top level)
   - Click on your build
   - Go to "Testing" section
   - Manually assign to "Team (Expo)" group
   - Then assign to tester

4. **Contact Support:**
   - App Store Connect support: https://developer.apple.com/contact/
   - Reference: TestFlight build not showing for tester

---

**Most Common Fix**: The build needs to be enabled for testing and assigned to the specific tester. Even though it exists in the group, it may not be assigned to individual testers.

