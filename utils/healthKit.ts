import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthValue,
  HealthUnit,
  HKWorkoutQueriedSampleType,
  AnchoredQueryResults,
} from 'react-native-health';

// Type definitions for health data (temporary until types/health is created)
export interface DailySteps {
  total: number;
  hourly: number[];
}

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Activity {
  id: string;
  name: string;
  type: 'running' | 'cycling' | 'hiit' | 'walking' | 'strength' | 'other';
  startTime: string;
  duration: number;
  activeCalories: number;
  totalCalories: number;
  distance?: number;
  elevationGain?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgPace?: number;
  avgCadence?: number;
  avgPower?: number;
}

export interface EnergyData {
  active: number; // Active energy burned (calories)
  basal: number; // Basal/resting energy burned (calories)
  total: number; // Total energy (active + basal)
}

export interface SleepData {
  duration: number; // Total sleep duration in minutes
  inBed: number; // Time in bed in minutes
}

export interface BodyMeasurements {
  weight?: number; // Weight in kg
  height?: number; // Height in meters
  bmi?: number; // Body Mass Index
  bodyFatPercentage?: number; // Body fat percentage
}

export interface ActivityMetrics {
  floorsClimbed?: number; // Flights climbed
  exerciseMinutes?: number; // Apple exercise time in minutes
  standHours?: number; // Apple stand hours
}

export interface HeartRateData {
  average?: number; // Average heart rate for the day (bpm)
  resting?: number; // Resting heart rate (bpm)
  walkingAverage?: number; // Walking heart rate average (bpm)
}

export interface DailyHealthData {
  date: string;
  steps: DailySteps;
  macros: MacroData;
  activities: Activity[];
  energy?: EnergyData;
  water?: number; // Water intake in liters
  sleep?: SleepData;
  bodyMeasurements?: BodyMeasurements;
  activityMetrics?: ActivityMetrics;
  heartRate?: HeartRateData;
  mindfulness?: number; // Mindfulness minutes
}

// Check if HealthKit is available (iOS only)
export const isHealthKitAvailable = (): boolean => {
  return Platform.OS === 'ios';
};

// HealthKit permissions we need
const healthKitPermissions: HealthKitPermissions = {
  permissions: {
    read: [
      // Activity
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.AppleStandTime,
      // Energy
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      // Heart Rate
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.WalkingHeartRateAverage,
      // Nutrition
      AppleHealthKit.Constants.Permissions.EnergyConsumed,
      AppleHealthKit.Constants.Permissions.Protein,
      AppleHealthKit.Constants.Permissions.Carbohydrates,
      AppleHealthKit.Constants.Permissions.FatTotal,
      AppleHealthKit.Constants.Permissions.Water,
      // Sleep
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      // Body Measurements
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.Height,
      AppleHealthKit.Constants.Permissions.BodyMassIndex,
      AppleHealthKit.Constants.Permissions.BodyFatPercentage,
      // Mindfulness
      AppleHealthKit.Constants.Permissions.MindfulSession,
    ],
    write: [], // We're only reading data, not writing
  },
};

/**
 * Request HealthKit permissions for the data types we need
 */
export const requestHealthKitPermissions = async (): Promise<boolean> => {
  if (!isHealthKitAvailable()) {
    console.warn('HealthKit is only available on iOS');
    return false;
  }

  return new Promise((resolve) => {
    console.log('Initializing HealthKit with permissions:', healthKitPermissions);
    AppleHealthKit.initHealthKit(healthKitPermissions, (error: string) => {
      if (error) {
        console.error('Error initializing HealthKit:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        resolve(false);
        return;
      }
      console.log('HealthKit initialized successfully');
      resolve(true);
    });
  });
};

/**
 * Check if HealthKit permissions are granted
 */
export const checkHealthKitPermissions = async (): Promise<boolean> => {
  if (!isHealthKitAvailable()) {
    return false;
  }

  return new Promise((resolve) => {
    AppleHealthKit.getAuthStatus(
      healthKitPermissions,
      (error: Object, result: any) => {
        if (error) {
          resolve(false);
          return;
        }
        // Check if any permission is authorized (status 2)
        const readPermissions = result?.permissions?.read || [];
        const isAuthorized = readPermissions.some((status: number) => status === 2);
        resolve(isAuthorized);
      }
    );
  });
};

/**
 * Fetch steps data for a specific date
 */
export const getStepsForDate = async (date: Date): Promise<DailySteps> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit is only available on iOS');
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }

        // Initialize hourly array
        const hourly = new Array(24).fill(0);
        let total = 0;

        // Process step samples into hourly buckets
        results.forEach((sample: HealthValue) => {
          const sampleDate = new Date(sample.startDate);
          const hour = sampleDate.getHours();
          const value = typeof sample.value === 'number' ? sample.value : parseInt(sample.value as string, 10);
          
          hourly[hour] += value;
          total += value;
        });

        resolve({
          total,
          hourly,
        });
      }
    );
  });
};

/**
 * Fetch macros (nutrition data) for a specific date
 */
export const getMacrosForDate = async (date: Date): Promise<MacroData> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit is only available on iOS');
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  // Fetch all nutrition data in parallel
  const fetchEnergyConsumed = (): Promise<number> => {
    return new Promise((resolve) => {
      AppleHealthKit.getEnergyConsumedSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.warn('Error fetching energy consumed:', err);
            resolve(0);
            return;
          }
          const total = results.reduce((sum: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          resolve(total);
        }
      );
    });
  };

  const fetchProtein = (): Promise<number> => {
    return new Promise((resolve) => {
      AppleHealthKit.getProteinSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.warn('Error fetching protein:', err);
            resolve(0);
            return;
          }
          const total = results.reduce((sum: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          resolve(total);
        }
      );
    });
  };

  const fetchCarbohydrates = (): Promise<number> => {
    return new Promise((resolve) => {
      AppleHealthKit.getCarbohydratesSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.warn('Error fetching carbohydrates:', err);
            resolve(0);
            return;
          }
          const total = results.reduce((sum: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          resolve(total);
        }
      );
    });
  };

  const fetchTotalFat = (): Promise<number> => {
    return new Promise((resolve) => {
      AppleHealthKit.getTotalFatSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.warn('Error fetching total fat:', err);
            resolve(0);
            return;
          }
          const total = results.reduce((sum: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          resolve(total);
        }
      );
    });
  };

  try {
    const [calories, protein, carbs, fats] = await Promise.all([
      fetchEnergyConsumed(),
      fetchProtein(),
      fetchCarbohydrates(),
      fetchTotalFat(),
    ]);

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
    };
  } catch (error) {
    console.error('Error fetching macros:', error);
    // Return zeros if there's an error
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };
  }
};

/**
 * Fetch energy data (active, basal, total) for a specific date
 */
export const getEnergyDataForDate = async (date: Date): Promise<EnergyData | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  const fetchActiveEnergy = (): Promise<number> => {
    return new Promise((resolve) => {
      AppleHealthKit.getActiveEnergyBurned(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.warn('Error fetching active energy:', err);
            resolve(0);
            return;
          }
          const total = results.reduce((sum: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          resolve(total);
        }
      );
    });
  };

  const fetchBasalEnergy = (): Promise<number> => {
    return new Promise((resolve) => {
      AppleHealthKit.getBasalEnergyBurned(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.warn('Error fetching basal energy:', err);
            resolve(0);
            return;
          }
          const total = results.reduce((sum: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          resolve(total);
        }
      );
    });
  };

  try {
    const [active, basal] = await Promise.all([
      fetchActiveEnergy(),
      fetchBasalEnergy(),
    ]);

    return {
      active: Math.round(active),
      basal: Math.round(basal),
      total: Math.round(active + basal),
    };
  } catch (error) {
    console.error('Error fetching energy data:', error);
    return null;
  }
};

/**
 * Fetch water intake for a specific date
 */
export const getWaterForDate = async (date: Date): Promise<number | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getWaterSamples(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          console.warn('Error fetching water:', err);
          resolve(null);
          return;
        }
        // Sum all water samples for the day (convert to liters if needed)
        const total = results.reduce((sum: number, sample: HealthValue) => {
          let value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
          if (isNaN(value)) value = 0;
          
          // Convert to liters if unit is different (e.g., ml, oz)
          // Note: HealthValue doesn't expose unit directly, so we'll assume values are in liters
          // If needed, we can check the value range to infer units
          
          return sum + value;
        }, 0);
        resolve(Math.round(total * 100) / 100); // Round to 2 decimal places
      }
    );
  });
};

/**
 * Fetch sleep data for a specific date
 */
export const getSleepDataForDate = async (date: Date): Promise<SleepData | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getSleepSamples(
      options,
      (err: Object, results: any[]) => {
        if (err) {
          console.warn('Error fetching sleep data:', err);
          resolve(null);
          return;
        }

        // Calculate total sleep duration and time in bed
        let totalSleepMinutes = 0;
        let totalInBedMinutes = 0;

        results.forEach((sample: any) => {
          const start = new Date(sample.startDate);
          const end = new Date(sample.endDate);
          const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
          
          // HealthKit sleep values: 0 = inBed, 1 = asleep
          const value = sample.value || 0;
          if (value === 1) {
            totalSleepMinutes += durationMinutes;
          }
          totalInBedMinutes += durationMinutes;
        });

        resolve({
          duration: Math.round(totalSleepMinutes),
          inBed: Math.round(totalInBedMinutes),
        });
      }
    );
  });
};

/**
 * Fetch body measurements (weight, height, BMI, body fat) for a specific date
 */
export const getBodyMeasurementsForDate = async (date: Date): Promise<BodyMeasurements | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  const fetchLatestWeight = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getLatestWeight(
        { unit: HealthUnit.gram },
        (err: Object, result: HealthValue) => {
          if (err || !result) {
            resolve(undefined);
            return;
          }
          let value = typeof result.value === 'number' ? result.value : parseFloat(result.value as string);
          if (isNaN(value)) {
            resolve(undefined);
            return;
          }
          // HealthKit typically returns weight in kg, but we'll handle conversions if needed
          // If value seems large (likely in grams), convert to kg
          if (value > 1000) {
            value = value / 1000; // grams to kg
          } else if (value < 10) {
            // Might be in pounds, but HealthKit usually uses kg
            // We'll assume kg for values in reasonable range
          }
          resolve(value);
        }
      );
    });
  };

  const fetchLatestHeight = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getLatestHeight(
        { unit: HealthUnit.meter },
        (err: Object, result: HealthValue) => {
          if (err || !result) {
            resolve(undefined);
            return;
          }
          let value = typeof result.value === 'number' ? result.value : parseFloat(result.value as string);
          if (isNaN(value)) {
            resolve(undefined);
            return;
          }
          // HealthKit typically returns height in meters
          // If value seems large (likely in cm), convert to meters
          if (value > 3) {
            value = value / 100; // cm to meters
          }
          resolve(value);
        }
      );
    });
  };

  const fetchLatestBMI = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getLatestBmi(
        {},
        (err: Object, result: HealthValue) => {
          if (err || !result) {
            resolve(undefined);
            return;
          }
          const value = typeof result.value === 'number' ? result.value : parseFloat(result.value as string);
          resolve(isNaN(value) ? undefined : value);
        }
      );
    });
  };

  try {
    const [weight, height, bmi] = await Promise.all([
      fetchLatestWeight(),
      fetchLatestHeight(),
      fetchLatestBMI(),
    ]);

    return {
      weight,
      height,
      bmi,
    };
  } catch (error) {
    console.error('Error fetching body measurements:', error);
    return null;
  }
};

/**
 * Fetch activity metrics (floors climbed, exercise time, stand time) for a specific date
 */
export const getActivityMetricsForDate = async (date: Date): Promise<ActivityMetrics | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  const fetchFloorsClimbed = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getDailyFlightsClimbedSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            resolve(undefined);
            return;
          }
          const total = results.reduce((sum: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          resolve(Math.round(total));
        }
      );
    });
  };

  const fetchExerciseTime = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getAppleExerciseTime(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            resolve(undefined);
            return;
          }
          // Sum exercise time and convert to minutes
          const total = results.reduce((sum: number, sample: HealthValue) => {
            let value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            if (isNaN(value)) value = 0;
            
            // HealthKit typically returns exercise time in minutes
            // If value seems large (likely in seconds), convert to minutes
            if (value > 1440) {
              value = value / 60; // seconds to minutes
            }
            
            return sum + value;
          }, 0);
          resolve(Math.round(total));
        }
      );
    });
  };

  const fetchStandTime = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getAppleStandTime(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            resolve(undefined);
            return;
          }
          // Sum stand time and convert to hours
          const total = results.reduce((sum: number, sample: HealthValue) => {
            let value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            if (isNaN(value)) value = 0;
            
            // HealthKit typically returns stand time in hours
            // If value seems large (likely in minutes), convert to hours
            if (value > 24) {
              value = value / 60; // minutes to hours
            }
            
            return sum + value;
          }, 0);
          resolve(Math.round(total * 10) / 10); // Round to 1 decimal place
        }
      );
    });
  };

  try {
    const [floorsClimbed, exerciseMinutes, standHours] = await Promise.all([
      fetchFloorsClimbed(),
      fetchExerciseTime(),
      fetchStandTime(),
    ]);

    return {
      floorsClimbed,
      exerciseMinutes,
      standHours,
    };
  } catch (error) {
    console.error('Error fetching activity metrics:', error);
    return null;
  }
};

/**
 * Fetch heart rate data for a specific date
 */
export const getHeartRateDataForDate = async (date: Date): Promise<HeartRateData | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  const fetchAverageHeartRate = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getHeartRateSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err || !results || results.length === 0) {
            resolve(undefined);
            return;
          }
          // Calculate average heart rate
          const sum = results.reduce((acc: number, sample: HealthValue) => {
            const value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
            return acc + (isNaN(value) ? 0 : value);
          }, 0);
          const average = sum / results.length;
          resolve(Math.round(average));
        }
      );
    });
  };

  const fetchRestingHeartRate = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getRestingHeartRate(
        options,
        (err: Object, result: HealthValue) => {
          if (err || !result) {
            resolve(undefined);
            return;
          }
          const value = typeof result.value === 'number' ? result.value : parseFloat(result.value as string);
          resolve(isNaN(value) ? undefined : Math.round(value));
        }
      );
    });
  };

  const fetchWalkingHeartRate = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      AppleHealthKit.getWalkingHeartRateAverage(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err || !results || results.length === 0) {
            resolve(undefined);
            return;
          }
          // Get the most recent walking heart rate average
          const latest = results[results.length - 1];
          const value = typeof latest.value === 'number' ? latest.value : parseFloat(latest.value as string);
          resolve(isNaN(value) ? undefined : Math.round(value));
        }
      );
    });
  };

  try {
    const [average, resting, walking] = await Promise.all([
      fetchAverageHeartRate(),
      fetchRestingHeartRate(),
      fetchWalkingHeartRate(),
    ]);

    return {
      average,
      resting,
      walkingAverage: walking,
    };
  } catch (error) {
    console.error('Error fetching heart rate data:', error);
    return null;
  }
};

/**
 * Fetch mindfulness minutes for a specific date
 */
export const getMindfulnessForDate = async (date: Date): Promise<number | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getMindfulSession(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          console.warn('Error fetching mindfulness data:', err);
          resolve(null);
          return;
        }
        // Sum all mindfulness sessions for the day (convert to minutes)
        const total = results.reduce((sum: number, sample: HealthValue) => {
          let value = typeof sample.value === 'number' ? sample.value : parseFloat(sample.value as string);
          if (isNaN(value)) value = 0;
          
          // HealthKit typically returns mindfulness in minutes
          // If value seems large (likely in seconds), convert to minutes
          if (value > 1440) {
            value = value / 60; // seconds to minutes
          }
          
          return sum + value;
        }, 0);
        resolve(Math.round(total));
      }
    );
  });
};

/**
 * Map HealthKit workout type to our Activity type
 */
const mapWorkoutTypeToActivityType = (healthKitType: string): Activity['type'] => {
  const typeMap: Record<string, Activity['type']> = {
    'HKWorkoutActivityTypeRunning': 'running',
    'HKWorkoutActivityTypeCycling': 'cycling',
    'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'hiit',
    'HKWorkoutActivityTypeWalking': 'walking',
    'HKWorkoutActivityTypeTraditionalStrengthTraining': 'strength',
    'HKWorkoutActivityTypeFunctionalStrengthTraining': 'strength',
    'HKWorkoutActivityTypeCrossTraining': 'other',
    'HKWorkoutActivityTypeElliptical': 'other',
    'HKWorkoutActivityTypeRowing': 'other',
    'HKWorkoutActivityTypeSwimming': 'other',
  };

  return typeMap[healthKitType] || 'other';
};

/**
 * Fetch workouts/activities for a specific date
 */
export const getActivitiesForDate = async (date: Date): Promise<Activity[]> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit is only available on iOS');
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.getAnchoredWorkouts(
      options,
      (err: Object, results: AnchoredQueryResults) => {
        if (err) {
          reject(err);
          return;
        }

        const activities: Activity[] = results.data.map((workout: HKWorkoutQueriedSampleType, index: number) => {
          // Extract metadata
          const metadata = workout.metadata || {};
          const avgHeartRate = metadata['HKAverageHeartRate'];
          const maxHeartRate = metadata['HKMaximumHeartRate'];
          const totalDistance = workout.distance || 0;
          
          // Distance is already in meters based on HKWorkoutQueriedSampleType
          const distanceInMeters = totalDistance;

          // Calculate average pace if we have distance and duration
          let avgPace: number | undefined;
          if (distanceInMeters > 0 && workout.duration) {
            const km = distanceInMeters / 1000;
            avgPace = workout.duration / km; // seconds per km
          }

          // Map activity name - activityId is a number, we need to map it
          const activityName = workout.activityName || 'Workout';
          // Map activity ID to type string for mapping
          const activityType = mapWorkoutTypeToActivityType(`HKWorkoutActivityType${workout.activityName}`);

          return {
            id: workout.id || `workout-${date.getTime()}-${index}`,
            name: activityName,
            type: activityType,
            startTime: workout.start,
            duration: Math.round(workout.duration), // in seconds
            activeCalories: Math.round(workout.calories || 0),
            totalCalories: Math.round(workout.calories || 0),
            distance: distanceInMeters > 0 ? distanceInMeters : undefined,
            elevationGain: metadata['HKElevationAscended'] as number | undefined,
            avgHeartRate: avgHeartRate as number | undefined,
            maxHeartRate: maxHeartRate as number | undefined,
            avgPace,
            avgCadence: metadata['HKAverageCadence'] as number | undefined,
            avgPower: metadata['HKAveragePower'] as number | undefined,
          };
        });

        resolve(activities);
      }
    );
  });
};

/**
 * Fetch complete health data for a specific date
 */
export const getHealthDataForDate = async (date: Date): Promise<DailyHealthData | null> => {
  if (!isHealthKitAvailable()) {
    return null;
  }

  try {
    // Fetch core data (always required)
    const [steps, activities, macros] = await Promise.all([
      getStepsForDate(date),
      getActivitiesForDate(date),
      getMacrosForDate(date),
    ]);

    // Fetch additional data in parallel (all optional)
    const [
      energy,
      water,
      sleep,
      bodyMeasurements,
      activityMetrics,
      heartRate,
      mindfulness,
    ] = await Promise.allSettled([
      getEnergyDataForDate(date),
      getWaterForDate(date),
      getSleepDataForDate(date),
      getBodyMeasurementsForDate(date),
      getActivityMetricsForDate(date),
      getHeartRateDataForDate(date),
      getMindfulnessForDate(date),
    ]);

    // Extract values from Promise.allSettled results
    const energyData = energy.status === 'fulfilled' ? energy.value : null;
    const waterData = water.status === 'fulfilled' ? water.value : null;
    const sleepData = sleep.status === 'fulfilled' ? sleep.value : null;
    const bodyMeasurementsData = bodyMeasurements.status === 'fulfilled' ? bodyMeasurements.value : null;
    const activityMetricsData = activityMetrics.status === 'fulfilled' ? activityMetrics.value : null;
    const heartRateData = heartRate.status === 'fulfilled' ? heartRate.value : null;
    const mindfulnessData = mindfulness.status === 'fulfilled' ? mindfulness.value : null;

    return {
      date: date.toISOString().split('T')[0],
      steps,
      macros,
      activities,
      energy: energyData || undefined,
      water: waterData || undefined,
      sleep: sleepData || undefined,
      bodyMeasurements: bodyMeasurementsData || undefined,
      activityMetrics: activityMetricsData || undefined,
      heartRate: heartRateData || undefined,
      mindfulness: mindfulnessData || undefined,
    };
  } catch (error) {
    console.error('Error fetching health data:', error);
    return null;
  }
};
