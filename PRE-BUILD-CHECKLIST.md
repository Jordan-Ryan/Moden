# Pre-Build Checklist for App Store Connect

Before building version 1.0.2, verify these items in App Store Connect:

## ✅ 1. App Information

**Go to: App Store Connect → Moden → App Information**

Check:
- [ ] **Bundle ID**: Should be `com.modenhealth.app` (must match app.json)
- [ ] **App Name**: "Moden" or "Moden Health"
- [ ] **Primary Language**: English (or your preferred language)
- [ ] **SKU**: Any unique identifier (e.g., "moden-health-001")

**If any of these are wrong, you may need to create a new app or update these settings.**

## ✅ 2. App Privacy (CRITICAL for HealthKit)

**Go to: App Store Connect → Moden → App Privacy**

⚠️ **This is required for HealthKit apps!**

Check:
- [ ] **App Privacy section is completed**
- [ ] **"Health & Fitness" data collection is declared**
- [ ] **All data types are listed:**
  - Fitness (steps, workouts, distance, energy)
  - Nutrition (calories, protein, carbs, fats, water)
  - Vitals (heart rate)
  - Sleep data
  - Body measurements (weight, height, BMI)
  - Mindfulness
- [ ] **Purpose**: "App Functionality"
- [ ] **Linked to User Identity**: "No" (or "Yes" if you sync data)
- [ ] **Used for Tracking**: "No"
- [ ] **Third-Party Sharing**: "No" (unless you share data)

**If this isn't completed:**
- Complete it now before building
- See `APPSTORE-CONNECT-HEALTHKIT.md` for detailed steps

## ✅ 3. TestFlight Configuration

**Go to: App Store Connect → Moden → TestFlight**

Check:
- [ ] **Test group exists**: "Team (Expo)" or similar
- [ ] **Testers are added**: Your email is in the test group
- [ ] **Previous builds are processed**: Build 1.0.1 should show "Ready to Submit" or "Processing"
- [ ] **No expired builds blocking**: If builds are expired, remove them

**If test group doesn't exist:**
1. Go to "Internal Testing"
2. Click "+" to create a group
3. Name it (e.g., "Team (Expo)")
4. Add yourself as a tester

## ✅ 4. Build Status

**Go to: App Store Connect → Moden → TestFlight → iOS Builds**

Check:
- [ ] **Build 1.0.1 status**: 
  - Should be "Ready to Submit" or "Processing"
  - If "Invalid Binary", check the email from Apple for errors
  - If "Processing", wait for it to complete
- [ ] **No build errors**: Check for any error messages

**If build 1.0.1 hasn't been submitted yet:**
- Submit it first: `eas submit --platform ios --id [build-id]`
- Or wait for 1.0.2 and submit that

## ✅ 5. App Store Information (Optional for TestFlight)

**Go to: App Store Connect → Moden → App Store (if visible)**

For TestFlight, this isn't required, but you can prepare:
- [ ] **App description** (optional for now)
- [ ] **Screenshots** (optional for now)
- [ ] **App icon** (should be set from app.json)

**Note**: These are only needed for App Store submission, not TestFlight.

## ✅ 6. Certificates & Provisioning Profiles

**Go to: App Store Connect → Users and Access → Certificates**

**Good news**: EAS Build handles this automatically! ✅

Check:
- [ ] **Your Apple Developer account is active** (paid $99/year)
- [ ] **You have access to the app** (Admin or App Manager role)
- [ ] **No certificate errors** in the list

**If you see errors:**
- EAS will handle certificate creation automatically
- You don't need to manually create certificates

## ✅ 7. App Bundle ID Verification

**Go to: App Store Connect → Users and Access → Identifiers**

Check:
- [ ] **Bundle ID `com.modenhealth.app` exists**
- [ ] **Status**: Should be "Active" or "Valid"
- [ ] **Capabilities**: Should include "HealthKit" (if visible)

**If bundle ID doesn't exist:**
- EAS will create it automatically during build
- Or you can create it manually in App Store Connect

## ✅ 8. User Access

**Go to: App Store Connect → Users and Access → Users**

Check:
- [ ] **Your account has access** to the "Moden" app
- [ ] **Role**: Admin, App Manager, or Developer
- [ ] **Status**: Active

**If you don't have access:**
- Contact the account holder to grant access
- Or use your own Apple Developer account

## ✅ 9. Previous Builds Cleanup (Optional)

**Go to: App Store Connect → Moden → TestFlight → iOS Builds**

Check:
- [ ] **Old expired builds**: Remove them if needed (optional)
- [ ] **Processing builds**: Wait for them to complete before building new one

**Note**: You can have multiple builds, but cleaning up expired ones keeps things tidy.

## ✅ 10. App Store Connect API Access (If Using EAS Submit)

**Go to: App Store Connect → Users and Access → Keys**

For automatic submission via `eas submit`, you can:
- [ ] **Create an API key** (optional but recommended)
- [ ] **Download the key** and add to EAS

**OR**: Just use your Apple ID credentials when prompted (easier)

## Summary Checklist

Before building 1.0.2, make sure:

- [x] ✅ **App exists** in App Store Connect
- [ ] ✅ **App Privacy is configured** (CRITICAL for HealthKit)
- [ ] ✅ **TestFlight group exists** with testers
- [ ] ✅ **Bundle ID matches** (`com.modenhealth.app`)
- [ ] ✅ **Apple Developer account is active**
- [ ] ✅ **You have access** to the app
- [ ] ✅ **Previous builds are processed** (or submit them first)

## Most Critical Item

**App Privacy Configuration** - This is REQUIRED for HealthKit apps and must be completed before submitting to App Store (even TestFlight in some cases).

## Quick Verification Commands

Before building, you can also verify locally:

```bash
# Check app.json bundle ID matches
cat app.json | grep bundleIdentifier

# Check version is updated
cat app.json | grep version

# Check EAS project ID
cat app.json | grep projectId
```

## If Something is Missing

- **App doesn't exist**: Create it in App Store Connect (see TESTFLIGHT-GUIDE.md)
- **App Privacy not configured**: Complete it now (see APPSTORE-CONNECT-HEALTHKIT.md)
- **Bundle ID mismatch**: Update app.json or create new app in App Store Connect
- **Can't access app**: Contact account admin or use your own account

## Ready to Build?

Once all items above are checked ✅, you're ready to build version 1.0.2!

```bash
eas build --profile preview --platform ios
```

---

**Pro Tip**: The most common issue is App Privacy not being configured. Make sure that's done before building!

