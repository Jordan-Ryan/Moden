# HealthKit Configuration in App Store Connect

## Overview

Good news! **HealthKit is already configured in your code** (`app.json`). EAS Build automatically adds the HealthKit capability to your app during the build process. However, you need to configure App Privacy in App Store Connect.

## What's Already Done ✅

1. ✅ **HealthKit permissions** in `app.json`:
   - `NSHealthShareUsageDescription`: "Moden needs access to your health data to display your steps, activity, and fitness metrics."
   - `NSHealthUpdateUsageDescription`: "Moden needs permission to read your health data to track your daily activity and nutrition goals."

2. ✅ **HealthKit capability** - EAS Build automatically adds this during build
   - No manual Xcode configuration needed
   - EAS handles the capability addition

3. ✅ **Bundle Identifier**: `com.modenhealth.app`

## What You Need to Do in App Store Connect

### Step 1: Configure App Privacy

1. **Go to App Store Connect**
   - Visit https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account
   - Select your app "Moden"

2. **Navigate to App Privacy**
   - Click on "App Privacy" in the left sidebar
   - Click "Get Started" or "Edit" if you've started before

3. **Add Health & Fitness Data Collection**

   Click **"+ Add Data Type"** or **"Add Data Collection"**

   Select: **"Health & Fitness"** category

   You'll need to specify:

   **a. Health & Fitness Data Types Used:**
   - ✅ **Fitness** (steps, workouts, distance, active energy)
   - ✅ **Nutrition** (calories, protein, carbs, fats, water)
   - ✅ **Vitals** (heart rate, resting heart rate, walking heart rate)
   - ✅ **Sleep Data** (sleep duration, time in bed)
   - ✅ **Body Measurements** (weight, height, BMI, body fat percentage)
   - ✅ **Mindfulness** (mindfulness minutes)

   **b. Purpose for Collecting:**
   - Select: **"App Functionality"**
   - Description: "Moden uses health data to display your daily activity, nutrition, and fitness metrics in a personalized dashboard."

   **c. Linked to User Identity:**
   - Select: **"No"** (if you're not linking health data to user accounts)
   - OR **"Yes"** (if health data is linked to user profiles)
   - Most apps use "No" unless you sync data across devices

   **d. Used for Tracking:**
   - Select: **"No"** (HealthKit data should not be used for tracking)

   **e. Third-Party Sharing:**
   - Select: **"No"** (unless you share data with third parties)
   - If you plan to share: "Yes" and specify who

### Step 2: Detailed Health Data Types

For each category, you may need to specify:

**Fitness Data:**
- Steps
- Workouts
- Distance walked/run
- Active energy burned
- Floors climbed
- Exercise time
- Stand time

**Nutrition Data:**
- Calories consumed
- Protein
- Carbohydrates
- Total fat
- Water intake

**Vitals:**
- Heart rate
- Resting heart rate
- Walking heart rate average

**Sleep:**
- Sleep analysis
- Sleep duration
- Time in bed

**Body Measurements:**
- Weight
- Height
- Body Mass Index (BMI)
- Body fat percentage

**Mindfulness:**
- Mindfulness minutes

### Step 3: Privacy Nutrition Labels

Apple will automatically generate privacy labels based on your App Privacy configuration. These will appear on the App Store listing.

**What Users Will See:**
- "Health & Fitness" data collection
- "Data Linked to You" or "Data Not Linked to You" (depending on your selection)
- "Data Used to Track You" or "Data Not Used to Track You"

### Step 4: App Review Information (Optional but Recommended)

When submitting for review, you may want to add notes:

1. **Go to App Information**
   - Click "App Information" in left sidebar
   - Scroll to "App Review Information"

2. **Add Notes for Reviewer (Optional)**
   - "This app uses HealthKit to read health data for display purposes only. The app does not write health data to HealthKit. All health data is displayed locally and is not shared with third parties."

## Important Notes

### HealthKit Capability
- ✅ **Automatically added by EAS Build** - No manual configuration needed
- ✅ **No Xcode configuration required** - EAS handles everything
- ✅ **Capability is validated during build** - If there's an issue, the build will fail

### App Store Review Guidelines
- ✅ **Read-only access** - Your app only reads data (no writes)
- ✅ **Clear usage descriptions** - Already in `app.json`
- ✅ **Privacy compliance** - Make sure App Privacy section matches actual usage

### Common Questions During Review

**Q: "Why does your app need health data?"**
A: "Moden displays personalized health and fitness metrics to help users track their daily activity, nutrition, and wellness goals."

**Q: "Do you share health data with third parties?"**
A: "No. Health data is only used locally within the app and is not shared with third parties or used for advertising."

**Q: "Is health data linked to user accounts?"**
A: Depends on your implementation. If data is stored locally only, say "No."

## Verification Checklist

Before submitting to TestFlight/App Store:

- [ ] App Privacy section configured in App Store Connect
- [ ] All health data types listed match actual usage
- [ ] Privacy purpose clearly stated
- [ ] HealthKit capability automatically added (EAS handles this)
- [ ] Usage descriptions in `app.json` match privacy disclosure
- [ ] App only reads health data (no writes) ✅ (already configured)

## Troubleshooting

### "HealthKit capability not found"
- **EAS Build automatically adds this** - If build succeeds, capability is added
- **Check build logs** - Should show "Adding HealthKit capability"
- **No manual action needed** - EAS handles it

### "App Privacy not configured"
- **Required for App Store submission** - Must complete App Privacy section
- **TestFlight may work without it** - But App Store requires it
- **Complete before final submission**

### "App Review rejected for health data"
- **Verify privacy disclosure matches actual usage** - Check App Privacy section
- **Ensure usage descriptions are clear** - Already done in `app.json`
- **Add reviewer notes if needed** - Explain how health data is used

## Next Steps

1. ✅ **Build your app** - `eas build --profile preview --platform ios`
2. ✅ **Submit to TestFlight** - `eas submit --platform ios --latest`
3. ✅ **Configure App Privacy** - Follow steps above in App Store Connect
4. ✅ **Test in TestFlight** - Verify HealthKit permissions work
5. ✅ **Submit for App Store Review** - When ready for production

## Resources

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [App Privacy Guidelines](https://developer.apple.com/app-store/app-privacy-details/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [HealthKit App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/#healthkit)

---

**Summary**: HealthKit is configured in code. You just need to complete the App Privacy section in App Store Connect to disclose how you use health data. EAS Build automatically handles the HealthKit capability during the build process.

