# HealthKit strings and read types

App Store Connect privacy answers are not stored in this repository. The sections below are the values the app code and `app.json` actually declare.

## `app.json`

iOS info plist:

- `NSHealthShareUsageDescription`: `Moden needs access to your health data to display your steps, activity, and fitness metrics.`
- `NSHealthUpdateUsageDescription`: `Moden needs permission to read your health data to track your daily activity and nutrition goals.`

The `react-native-health` plugin is passed the same two strings as `healthSharePermission` and `healthUpdatePermission`.

Bundle identifier: `com.modenhealth.app`.

## Reads requested in code

`utils/healthKit.ts` builds a `HealthKitPermissions` object. `write` is `[]`. `read` includes:

- Steps, Workout, DistanceWalkingRunning, ActiveEnergyBurned, FlightsClimbed, AppleExerciseTime, AppleStandTime
- BasalEnergyBurned
- HeartRate, RestingHeartRate, WalkingHeartRateAverage
- EnergyConsumed, Protein, Carbohydrates, FatTotal, Water
- SleepAnalysis
- Weight, Height, BodyMassIndex, BodyFatPercentage
- MindfulSession

`getBodyMeasurementsForDate` returns weight, height, and BMI. It does not call a body-fat query. `BodyFatPercentage` is still on the read list.

`HealthProvider` calls `requestHealthKitPermissions` while loading Today. The screens do not contain a separate permission button.

## What this repo cannot show

Whether App Store Connect has an app record, a completed privacy section, or a HealthKit capability on a past binary is outside the files here. `eas.json` does not set an entitlement block of its own.
