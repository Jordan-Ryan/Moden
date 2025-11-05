import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthValue,
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

export type ActivityCategory = 
  | 'Cycling' 
  | 'Running' 
  | 'Walking' 
  | 'Swimming' 
  | 'Strength Training'
  | 'High-Intensity Interval Training'
  | 'Rowing'
  | 'Elliptical'
  | 'Yoga'
  | 'Pilates'
  | 'Core Training'
  | 'Flexibility'
  | 'Cooldown'
  | 'Stairs'
  | 'Mixed Cardio'
  | 'Soccer'
  | 'Tennis'
  | 'Basketball'
  | 'Other';

export type ActivitySubcategory = 
  | 'Indoor' 
  | 'Outdoor' 
  | 'Pool' 
  | 'Open Water' 
  | 'Traditional' 
  | 'Functional' 
  | null;

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  subcategory: ActivitySubcategory;
  type: 'running' | 'cycling' | 'hiit' | 'walking' | 'strength' | 'rowing' | 'football' | 'other';
  startTime: string;
  duration: number;
  activeCalories: number;
  distance?: number;
  elevationGain?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgPace?: number;
  avgCadence?: number;
  avgPower?: number;
  healthKitActivityId?: number | string; // Raw HealthKit activity ID for SF Symbol mapping
  healthKitActivityName?: string; // Raw HealthKit activity name for SF Symbol mapping
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

const hasNativeHealthKitModule = (): boolean => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  const nativeModule = AppleHealthKit as { initHealthKit?: unknown } | undefined;
  return Boolean(nativeModule && typeof nativeModule.initHealthKit === 'function');
};

// Check if HealthKit is available (iOS only with native module linked)
export const isHealthKitAvailable = (): boolean => {
  return hasNativeHealthKitModule();
};

const createHealthKitPermissions = (): HealthKitPermissions => {
  if (!hasNativeHealthKitModule()) {
    return {
      permissions: {
        read: [],
        write: [],
      },
    };
  }

  const { Permissions } = AppleHealthKit.Constants;

  return {
    permissions: {
      read: [
        // Activity
        Permissions.Steps,
        Permissions.Workout,
        Permissions.DistanceWalkingRunning,
        Permissions.ActiveEnergyBurned,
        Permissions.FlightsClimbed,
        Permissions.AppleExerciseTime,
        Permissions.AppleStandTime,
        // Energy
        Permissions.BasalEnergyBurned,
        // Heart Rate
        Permissions.HeartRate,
        Permissions.RestingHeartRate,
        Permissions.WalkingHeartRateAverage,
        // Nutrition
        Permissions.EnergyConsumed,
        Permissions.Protein,
        Permissions.Carbohydrates,
        Permissions.FatTotal,
        Permissions.Water,
        // Sleep
        Permissions.SleepAnalysis,
        // Body Measurements
        Permissions.Weight,
        Permissions.Height,
        Permissions.BodyMassIndex,
        Permissions.BodyFatPercentage,
        // Mindfulness
        Permissions.MindfulSession,
      ],
      write: [], // We're only reading data, not writing
    },
  };
};

// HealthKit permissions we need
const healthKitPermissions = createHealthKitPermissions();

/**
 * Request HealthKit permissions for the data types we need
 */
export const requestHealthKitPermissions = async (): Promise<boolean> => {
  if (!isHealthKitAvailable()) {
    console.warn('HealthKit is unavailable on this device.');
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
    throw new Error('HealthKit is unavailable on this device.');
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
          const rawValue = typeof sample.value === 'number'
            ? sample.value
            : parseInt(sample.value as string, 10);
          const sanitizedValue = Number.isFinite(rawValue) ? Math.round(rawValue) : 0;

          hourly[hour] += sanitizedValue;
          total += sanitizedValue;
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
    throw new Error('HealthKit is unavailable on this device.');
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
type UnitsMap = (typeof AppleHealthKit)['Constants']['Units'];
type UnitKey = keyof UnitsMap;

const getUnitValue = (unit: UnitKey): UnitsMap[UnitKey] => {
  const units = (AppleHealthKit as any)?.Constants?.Units as UnitsMap | undefined;
  if (units && units[unit]) {
    return units[unit];
  }
  return unit as UnitsMap[UnitKey];
};

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
        { unit: getUnitValue('gram') },
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
        { unit: getUnitValue('meter') },
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
 * Map HealthKit workout type to SF Symbol name
 * Official SF Symbols mapping for HealthKit workout types
 */
export const mapHealthKitWorkoutTypeToSFSymbol = (activityId: number | string, activityName?: string): string => {
  // Prioritize activity name over ID (more reliable)
  // HealthKit returns names like "Running", "HighIntensityIntervalTraining", etc.
  if (activityName) {
    // Map using exact HealthKit workout activity names as returned by the API
    const nameMap: Record<string, string> = {
      // Core activities
      'Running': 'figure.run',
      'Cycling': 'figure.outdoor.cycle',
      'Walking': 'figure.walk',
      'Rowing': 'figure.rower',
      'HighIntensityIntervalTraining': 'figure.highintensity.intervaltraining',
      'TraditionalStrengthTraining': 'figure.strengthtraining.traditional',
      'FunctionalStrengthTraining': 'figure.strengthtraining.functional',
      'Elliptical': 'figure.elliptical',
      'Swimming': 'figure.pool.swim',
      'CrossTraining': 'figure.mixed.cardio',
      'Soccer': 'figure.soccer',
      'AmericanFootball': 'figure.soccer',
      // Additional activities
      'HandCycling': 'figure.hand.cycling',
      'CoreTraining': 'figure.core.training',
      'Flexibility': 'figure.flexibility',
      'PreparationAndRecovery': 'figure.cooldown',
      'StepTraining': 'figure.step.training',
      'Stairs': 'figure.stairs',
      'StairClimbing': 'figure.stair.stepper',
      'Yoga': 'figure.yoga',
      'Pilates': 'figure.pilates',
      'TaiChi': 'figure.taichi',
      'MindAndBody': 'figure.mind.and.body',
      'SocialDance': 'figure.socialdance',
      'Dance': 'figure.socialdance',
      'Boxing': 'figure.boxing',
      'Kickboxing': 'figure.kickboxing',
      'MartialArts': 'figure.martial.arts',
      'Wrestling': 'figure.wrestling',
      'Gymnastics': 'figure.gymnastics',
      'Climbing': 'figure.climbing',
      'Fencing': 'figure.fencing',
      'Fishing': 'figure.fishing',
      'Hunting': 'figure.hunting',
      'Sailing': 'figure.sailing',
      'SurfingSports': 'figure.surfing',
      'Surfing': 'figure.surfing',
      'WaterFitness': 'figure.water.fitness',
      'WaterPolo': 'figure.waterpolo',
      'SkatingSports': 'figure.skating',
      'Skating': 'figure.skating',
      'Snowboarding': 'figure.snowboarding',
      'TrackAndField': 'figure.track.and.field',
      'Rugby': 'figure.rugby',
      'Lacrosse': 'figure.lacrosse',
      'Tennis': 'figure.tennis',
      'TableTennis': 'figure.table.tennis',
      'Squash': 'figure.squash',
      'Racquetball': 'figure.racquetball',
      'Pickleball': 'figure.pickleball',
      'Badminton': 'figure.badminton',
      'Baseball': 'figure.baseball',
      'Softball': 'figure.softball',
      'Basketball': 'figure.basketball',
      'Bowling': 'figure.bowling',
      'Golf': 'figure.golf',
      'Handball': 'figure.handball',
      'Volleyball': 'figure.volleyball',
      'Play': 'figure.play',
      'WheelchairWalkPace': 'figure.rolling',
      'WheelchairRunPace': 'figure.rolling',
      'Hiking': 'figure.hiking',
      'MixedCardio': 'figure.mixed.cardio',
    };
    
    // Try exact match first
    if (nameMap[activityName]) {
      return nameMap[activityName];
    }
    
    // Try case-insensitive match
    const lowerName = activityName.toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
  }

  // Fallback to ID-based mapping if name not found
  let id: number;
  if (typeof activityId === 'number') {
    id = activityId;
  } else if (typeof activityId === 'string') {
    const numMatch = activityId.match(/\d+/);
    id = numMatch ? parseInt(numMatch[0], 10) : 0;
  } else {
    id = 0;
  }

  // Map HealthKit workout activity IDs to SF Symbols
  const sfSymbolMap: Record<number, string> = {
    16: 'figure.run',                          // Running
    17: 'figure.run',                          // Running (indoor)
    37: 'figure.outdoor.cycle',                // Cycling (default outdoor)
    18: 'figure.indoor.cycle',                 // Cycling (indoor)
    36: 'figure.walk',                         // Walking
    53: 'figure.walk',                         // Walking (indoor)
    35: 'figure.rower',                        // Rowing
    52: 'figure.highintensity.intervaltraining', // HighIntensityIntervalTraining
    48: 'figure.strengthtraining.traditional', // TraditionalStrengthTraining
    49: 'figure.strengthtraining.functional',  // FunctionalStrengthTraining
    34: 'figure.elliptical',                   // Elliptical
    38: 'figure.pool.swim',                    // Swimming (default pool)
    55: 'figure.mixed.cardio',                 // CrossTraining
    15: 'figure.soccer',                       // Soccer
    14: 'figure.soccer',                       // AmericanFootball
    19: 'figure.hand.cycling',                 // HandCycling
    20: 'figure.core.training',                // CoreTraining
    21: 'figure.flexibility',                  // Flexibility
    22: 'figure.cooldown',                     // PreparationAndRecovery
    23: 'figure.step.training',                // StepTraining
    24: 'figure.stairs',                       // Stairs
    25: 'figure.stair.stepper',                // StairClimbing
    26: 'figure.yoga',                         // Yoga
    27: 'figure.pilates',                      // Pilates
    28: 'figure.taichi',                       // TaiChi
    29: 'figure.mind.and.body',                // MindAndBody
    30: 'figure.socialdance',                   // Dance/SocialDance
    31: 'figure.boxing',                       // Boxing
    32: 'figure.kickboxing',                    // Kickboxing
    33: 'figure.martial.arts',                 // MartialArts
    39: 'figure.wrestling',                    // Wrestling
    40: 'figure.gymnastics',                   // Gymnastics
    41: 'figure.climbing',                     // Climbing
    42: 'figure.fencing',                      // Fencing
    43: 'figure.fishing',                      // Fishing
    44: 'figure.hunting',                      // Hunting
    45: 'figure.sailing',                      // Sailing
    46: 'figure.surfing',                      // SurfingSports
    47: 'figure.water.fitness',                // WaterFitness
    50: 'figure.waterpolo',                    // WaterPolo
    51: 'figure.skating',                      // SkatingSports
    54: 'figure.snowboarding',                 // Snowboarding
    56: 'figure.track.and.field',              // TrackAndField
    57: 'figure.rugby',                        // Rugby
    58: 'figure.lacrosse',                     // Lacrosse
    59: 'figure.tennis',                       // Tennis
    60: 'figure.table.tennis',                 // TableTennis
    61: 'figure.squash',                       // Squash
    62: 'figure.racquetball',                  // Racquetball
    63: 'figure.pickleball',                   // Pickleball
    64: 'figure.badminton',                    // Badminton
    65: 'figure.baseball',                     // Baseball
    66: 'figure.softball',                     // Softball
    67: 'figure.basketball',                   // Basketball
    68: 'figure.bowling',                      // Bowling
    69: 'figure.golf',                         // Golf
    70: 'figure.handball',                     // Handball
    71: 'figure.volleyball',                   // Volleyball
    72: 'figure.play',                        // Play
    73: 'figure.rolling',                     // WheelchairWalkPace
    74: 'figure.rolling',                     // WheelchairRunPace
  };

  // If we have a direct mapping, use it
  if (sfSymbolMap[id]) {
    return sfSymbolMap[id];
  }

  // Fallback: try to map by activity name string (exact HealthKit names)
  if (activityName) {
    // Map using exact HealthKit workout activity names as returned by the API
    const nameMap: Record<string, string> = {
      // Core activities
      'Running': 'figure.run',
      'Cycling': 'figure.outdoor.cycle',
      'Walking': 'figure.walk',
      'Rowing': 'figure.rower',
      'HighIntensityIntervalTraining': 'figure.highintensity.intervaltraining',
      'TraditionalStrengthTraining': 'figure.strengthtraining.traditional',
      'FunctionalStrengthTraining': 'figure.strengthtraining.functional',
      'Elliptical': 'figure.elliptical',
      'Swimming': 'figure.pool.swim',
      'CrossTraining': 'figure.mixed.cardio',
      'Soccer': 'figure.soccer',
      'AmericanFootball': 'figure.soccer',
      // Additional activities
      'HandCycling': 'figure.hand.cycling',
      'CoreTraining': 'figure.core.training',
      'Flexibility': 'figure.flexibility',
      'PreparationAndRecovery': 'figure.cooldown',
      'StepTraining': 'figure.step.training',
      'Stairs': 'figure.stairs',
      'StairClimbing': 'figure.stair.stepper',
      'Yoga': 'figure.yoga',
      'Pilates': 'figure.pilates',
      'TaiChi': 'figure.taichi',
      'MindAndBody': 'figure.mind.and.body',
      'SocialDance': 'figure.socialdance',
      'Dance': 'figure.socialdance',
      'Boxing': 'figure.boxing',
      'Kickboxing': 'figure.kickboxing',
      'MartialArts': 'figure.martial.arts',
      'Wrestling': 'figure.wrestling',
      'Gymnastics': 'figure.gymnastics',
      'Climbing': 'figure.climbing',
      'Fencing': 'figure.fencing',
      'Fishing': 'figure.fishing',
      'Hunting': 'figure.hunting',
      'Sailing': 'figure.sailing',
      'SurfingSports': 'figure.surfing',
      'Surfing': 'figure.surfing',
      'WaterFitness': 'figure.water.fitness',
      'WaterPolo': 'figure.waterpolo',
      'SkatingSports': 'figure.skating',
      'Skating': 'figure.skating',
      'Snowboarding': 'figure.snowboarding',
      'TrackAndField': 'figure.track.and.field',
      'Rugby': 'figure.rugby',
      'Lacrosse': 'figure.lacrosse',
      'Tennis': 'figure.tennis',
      'TableTennis': 'figure.table.tennis',
      'Squash': 'figure.squash',
      'Racquetball': 'figure.racquetball',
      'Pickleball': 'figure.pickleball',
      'Badminton': 'figure.badminton',
      'Baseball': 'figure.baseball',
      'Softball': 'figure.softball',
      'Basketball': 'figure.basketball',
      'Bowling': 'figure.bowling',
      'Golf': 'figure.golf',
      'Handball': 'figure.handball',
      'Volleyball': 'figure.volleyball',
      'Play': 'figure.play',
      'WheelchairWalkPace': 'figure.rolling',
      'WheelchairRunPace': 'figure.rolling',
      'Hiking': 'figure.hiking',
      'MixedCardio': 'figure.mixed.cardio',
    };
    
    // Try exact match first
    if (nameMap[activityName]) {
      return nameMap[activityName];
    }
    
    // Try case-insensitive match
    const lowerName = activityName.toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
  }

  // Default fallback
  return 'figure.fitness';
};

/**
 * Comprehensive activity mapping result
 */
interface ActivityMapping {
  category: ActivityCategory;
  subcategory: ActivitySubcategory;
  displayName: string;
  type: Activity['type'];
}

/**
 * Comprehensive mapping from HealthKit activity ID/name to category, subcategory, display name, and type
 * This matches how Apple Fitness app organizes activities
 */
const mapHealthKitActivityToActivityInfo = (
  activityId: number | string | null | undefined,
  activityName: string | undefined
): ActivityMapping => {
  // Helper to extract numeric ID
  const extractId = (id: number | string | null | undefined): number | null => {
    if (typeof id === 'number') return id;
    if (typeof id === 'string') {
      const numMatch = id.match(/\d+/);
      return numMatch ? parseInt(numMatch[0], 10) : null;
    }
    return null;
  };

  // Normalize activity name (remove prefix, handle casing)
  const normalizeName = (name: string | undefined): string | null => {
    if (!name || name === 'Workout') return null;
    return name.replace(/^HKWorkoutActivityType/, '');
  };

  const normalizedName = normalizeName(activityName);
  const numericId = extractId(activityId);

  // Prioritize name-based mapping first (most reliable when name is specific)
  if (normalizedName) {
    const nameMapping: Record<string, ActivityMapping> = {
      // Running
      // For generic "Running", check activityId to distinguish indoor (17) vs outdoor (16)
      'Running': numericId === 17
        ? { category: 'Running', subcategory: 'Indoor', displayName: 'Indoor Run', type: 'running' }
        : { category: 'Running', subcategory: 'Outdoor', displayName: 'Outdoor Run', type: 'running' },
      'IndoorRunning': { category: 'Running', subcategory: 'Indoor', displayName: 'Indoor Run', type: 'running' },
      'Treadmill': { category: 'Running', subcategory: 'Indoor', displayName: 'Indoor Run', type: 'running' },
      
      // Cycling
      // For generic "Cycling", check activityId to distinguish indoor (18) vs outdoor (37)
      'Cycling': numericId === 18 
        ? { category: 'Cycling', subcategory: 'Indoor', displayName: 'Indoor Cycle', type: 'cycling' }
        : { category: 'Cycling', subcategory: 'Outdoor', displayName: 'Outdoor Cycle', type: 'cycling' },
      'IndoorCycling': { category: 'Cycling', subcategory: 'Indoor', displayName: 'Indoor Cycle', type: 'cycling' },
      'HandCycling': { category: 'Cycling', subcategory: 'Outdoor', displayName: 'Hand Cycle', type: 'cycling' },
      
      // Walking
      // For generic "Walking", check activityId to distinguish indoor (53) vs outdoor (36)
      'Walking': numericId === 53
        ? { category: 'Walking', subcategory: 'Indoor', displayName: 'Indoor Walk', type: 'walking' }
        : { category: 'Walking', subcategory: 'Outdoor', displayName: 'Outdoor Walk', type: 'walking' },
      'IndoorWalking': { category: 'Walking', subcategory: 'Indoor', displayName: 'Indoor Walk', type: 'walking' },
      
      // Swimming
      'Swimming': { category: 'Swimming', subcategory: 'Pool', displayName: 'Pool Swim', type: 'other' },
      'OpenWaterSwimming': { category: 'Swimming', subcategory: 'Open Water', displayName: 'Open Water Swim', type: 'other' },
      'WaterFitness': { category: 'Swimming', subcategory: 'Pool', displayName: 'Water Fitness', type: 'other' },
      'WaterPolo': { category: 'Swimming', subcategory: 'Pool', displayName: 'Water Polo', type: 'other' },
      
      // Strength Training
      'TraditionalStrengthTraining': { category: 'Strength Training', subcategory: 'Traditional', displayName: 'Traditional Strength Training', type: 'strength' },
      'FunctionalStrengthTraining': { category: 'Strength Training', subcategory: 'Functional', displayName: 'Functional Strength Training', type: 'strength' },
      
      // HIIT
      'HighIntensityIntervalTraining': { category: 'High-Intensity Interval Training', subcategory: null, displayName: 'High-Intensity Interval Training', type: 'hiit' },
      
      // Rowing
      'Rowing': { category: 'Rowing', subcategory: null, displayName: 'Rowing', type: 'rowing' },
      
      // Elliptical
      'Elliptical': { category: 'Elliptical', subcategory: null, displayName: 'Elliptical', type: 'other' },
      
      // Mixed Cardio / Cross Training
      'CrossTraining': { category: 'Mixed Cardio', subcategory: null, displayName: 'Cross Training', type: 'other' },
      'MixedCardio': { category: 'Mixed Cardio', subcategory: null, displayName: 'Mixed Cardio', type: 'other' },
      
      // Yoga & Mind/Body
      'Yoga': { category: 'Yoga', subcategory: null, displayName: 'Yoga', type: 'other' },
      'Pilates': { category: 'Pilates', subcategory: null, displayName: 'Pilates', type: 'other' },
      'TaiChi': { category: 'Yoga', subcategory: null, displayName: 'Tai Chi', type: 'other' },
      'MindAndBody': { category: 'Yoga', subcategory: null, displayName: 'Mind & Body', type: 'other' },
      
      // Core & Flexibility
      'CoreTraining': { category: 'Core Training', subcategory: null, displayName: 'Core Training', type: 'other' },
      'Flexibility': { category: 'Flexibility', subcategory: null, displayName: 'Flexibility', type: 'other' },
      'PreparationAndRecovery': { category: 'Cooldown', subcategory: null, displayName: 'Cooldown', type: 'other' },
      
      // Stairs
      'Stairs': { category: 'Stairs', subcategory: null, displayName: 'Stairs', type: 'other' },
      'StairClimbing': { category: 'Stairs', subcategory: null, displayName: 'Stair Stepper', type: 'other' },
      'StepTraining': { category: 'Stairs', subcategory: null, displayName: 'Step Training', type: 'other' },
      
      // Sports
      'Soccer': { category: 'Soccer', subcategory: null, displayName: 'Soccer', type: 'football' },
      'AmericanFootball': { category: 'Soccer', subcategory: null, displayName: 'American Football', type: 'football' },
      'Tennis': { category: 'Tennis', subcategory: null, displayName: 'Tennis', type: 'other' },
      'TableTennis': { category: 'Tennis', subcategory: null, displayName: 'Table Tennis', type: 'other' },
      'Squash': { category: 'Tennis', subcategory: null, displayName: 'Squash', type: 'other' },
      'Racquetball': { category: 'Tennis', subcategory: null, displayName: 'Racquetball', type: 'other' },
      'Pickleball': { category: 'Tennis', subcategory: null, displayName: 'Pickleball', type: 'other' },
      'Badminton': { category: 'Tennis', subcategory: null, displayName: 'Badminton', type: 'other' },
      'Basketball': { category: 'Basketball', subcategory: null, displayName: 'Basketball', type: 'other' },
      'Baseball': { category: 'Other', subcategory: null, displayName: 'Baseball', type: 'other' },
      'Softball': { category: 'Other', subcategory: null, displayName: 'Softball', type: 'other' },
      'Volleyball': { category: 'Other', subcategory: null, displayName: 'Volleyball', type: 'other' },
      'Handball': { category: 'Other', subcategory: null, displayName: 'Handball', type: 'other' },
      'Rugby': { category: 'Other', subcategory: null, displayName: 'Rugby', type: 'other' },
      'Lacrosse': { category: 'Other', subcategory: null, displayName: 'Lacrosse', type: 'other' },
      'Golf': { category: 'Other', subcategory: null, displayName: 'Golf', type: 'other' },
      'Bowling': { category: 'Other', subcategory: null, displayName: 'Bowling', type: 'other' },
      
      // Martial Arts
      'Boxing': { category: 'Other', subcategory: null, displayName: 'Boxing', type: 'other' },
      'Kickboxing': { category: 'Other', subcategory: null, displayName: 'Kickboxing', type: 'other' },
      'MartialArts': { category: 'Other', subcategory: null, displayName: 'Martial Arts', type: 'other' },
      'Wrestling': { category: 'Other', subcategory: null, displayName: 'Wrestling', type: 'other' },
      'Fencing': { category: 'Other', subcategory: null, displayName: 'Fencing', type: 'other' },
      
      // Other
      'Gymnastics': { category: 'Other', subcategory: null, displayName: 'Gymnastics', type: 'other' },
      'Climbing': { category: 'Other', subcategory: null, displayName: 'Climbing', type: 'other' },
      'Hiking': { category: 'Walking', subcategory: 'Outdoor', displayName: 'Hiking', type: 'walking' },
      'SocialDance': { category: 'Other', subcategory: null, displayName: 'Dance', type: 'other' },
      'Dance': { category: 'Other', subcategory: null, displayName: 'Dance', type: 'other' },
      'SkatingSports': { category: 'Other', subcategory: null, displayName: 'Skating', type: 'other' },
      'Skating': { category: 'Other', subcategory: null, displayName: 'Skating', type: 'other' },
      'Snowboarding': { category: 'Other', subcategory: null, displayName: 'Snowboarding', type: 'other' },
      'Skiing': { category: 'Other', subcategory: null, displayName: 'Skiing', type: 'other' },
      'DownhillSkiing': { category: 'Other', subcategory: null, displayName: 'Downhill Skiing', type: 'other' },
      'CrossCountrySkiing': { category: 'Other', subcategory: null, displayName: 'Cross Country Skiing', type: 'other' },
      'SurfingSports': { category: 'Other', subcategory: null, displayName: 'Surfing', type: 'other' },
      'Surfing': { category: 'Other', subcategory: null, displayName: 'Surfing', type: 'other' },
      'Sailing': { category: 'Other', subcategory: null, displayName: 'Sailing', type: 'other' },
      'Fishing': { category: 'Other', subcategory: null, displayName: 'Fishing', type: 'other' },
      'Hunting': { category: 'Other', subcategory: null, displayName: 'Hunting', type: 'other' },
      'Play': { category: 'Other', subcategory: null, displayName: 'Play', type: 'other' },
      'TrackAndField': { category: 'Other', subcategory: null, displayName: 'Track & Field', type: 'other' },
      'WheelchairWalkPace': { category: 'Walking', subcategory: 'Outdoor', displayName: 'Wheelchair Walk Pace', type: 'walking' },
      'WheelchairRunPace': { category: 'Running', subcategory: 'Outdoor', displayName: 'Wheelchair Run Pace', type: 'running' },
    };

    // Try exact match first
    if (nameMapping[normalizedName]) {
      return nameMapping[normalizedName];
    }

    // Try case-insensitive match
    const lowerName = normalizedName.toLowerCase();
    for (const [key, value] of Object.entries(nameMapping)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
  }

  // Fallback to ID-based mapping if name not available or didn't match
  if (numericId !== null) {
    const idMapping: Record<number, ActivityMapping> = {
      // Running (16 = outdoor, 17 = indoor)
      16: { category: 'Running', subcategory: 'Outdoor', displayName: 'Outdoor Run', type: 'running' },
      17: { category: 'Running', subcategory: 'Indoor', displayName: 'Indoor Run', type: 'running' },
      
      // Cycling (37 = outdoor, 18 = indoor)
      37: { category: 'Cycling', subcategory: 'Outdoor', displayName: 'Outdoor Cycle', type: 'cycling' },
      18: { category: 'Cycling', subcategory: 'Indoor', displayName: 'Indoor Cycle', type: 'cycling' },
      56: { category: 'Cycling', subcategory: 'Outdoor', displayName: 'Hand Cycle', type: 'cycling' },
      
      // Walking (36 = outdoor, 53 = indoor)
      36: { category: 'Walking', subcategory: 'Outdoor', displayName: 'Outdoor Walk', type: 'walking' },
      53: { category: 'Walking', subcategory: 'Indoor', displayName: 'Indoor Walk', type: 'walking' },
      
      // Swimming (38 = pool, 68 = open water)
      38: { category: 'Swimming', subcategory: 'Pool', displayName: 'Pool Swim', type: 'other' },
      68: { category: 'Swimming', subcategory: 'Open Water', displayName: 'Open Water Swim', type: 'other' },
      70: { category: 'Swimming', subcategory: 'Pool', displayName: 'Water Fitness', type: 'other' },
      71: { category: 'Swimming', subcategory: 'Pool', displayName: 'Water Polo', type: 'other' },
      
      // Strength Training
      48: { category: 'Strength Training', subcategory: 'Traditional', displayName: 'Traditional Strength Training', type: 'strength' },
      49: { category: 'Strength Training', subcategory: 'Functional', displayName: 'Functional Strength Training', type: 'strength' },
      
      // HIIT
      52: { category: 'High-Intensity Interval Training', subcategory: null, displayName: 'High-Intensity Interval Training', type: 'hiit' },
      
      // Rowing
      35: { category: 'Rowing', subcategory: null, displayName: 'Rowing', type: 'rowing' },
      
      // Elliptical
      34: { category: 'Elliptical', subcategory: null, displayName: 'Elliptical', type: 'other' },
      
      // Mixed Cardio / Cross Training
      55: { category: 'Mixed Cardio', subcategory: null, displayName: 'Cross Training', type: 'other' },
      
      // Yoga & Mind/Body
      64: { category: 'Yoga', subcategory: null, displayName: 'Yoga', type: 'other' },
      65: { category: 'Pilates', subcategory: null, displayName: 'Pilates', type: 'other' },
      66: { category: 'Yoga', subcategory: null, displayName: 'Tai Chi', type: 'other' },
      88: { category: 'Yoga', subcategory: null, displayName: 'Mind & Body', type: 'other' },
      
      // Core & Flexibility
      62: { category: 'Core Training', subcategory: null, displayName: 'Core Training', type: 'other' },
      61: { category: 'Flexibility', subcategory: null, displayName: 'Flexibility', type: 'other' },
      59: { category: 'Cooldown', subcategory: null, displayName: 'Cooldown', type: 'other' },
      
      // Stairs
      67: { category: 'Stairs', subcategory: null, displayName: 'Stairs', type: 'other' },
      69: { category: 'Stairs', subcategory: null, displayName: 'Stair Stepper', type: 'other' },
      54: { category: 'Stairs', subcategory: null, displayName: 'Step Training', type: 'other' },
      
      // Sports
      15: { category: 'Soccer', subcategory: null, displayName: 'Soccer', type: 'football' },
      14: { category: 'Soccer', subcategory: null, displayName: 'American Football', type: 'football' },
      10: { category: 'Tennis', subcategory: null, displayName: 'Tennis', type: 'other' },
      11: { category: 'Tennis', subcategory: null, displayName: 'Table Tennis', type: 'other' },
      40: { category: 'Tennis', subcategory: null, displayName: 'Squash', type: 'other' },
      41: { category: 'Tennis', subcategory: null, displayName: 'Racquetball', type: 'other' },
      63: { category: 'Tennis', subcategory: null, displayName: 'Pickleball', type: 'other' },
      32: { category: 'Tennis', subcategory: null, displayName: 'Badminton', type: 'other' },
      28: { category: 'Basketball', subcategory: null, displayName: 'Basketball', type: 'other' },
      29: { category: 'Other', subcategory: null, displayName: 'Baseball', type: 'other' },
      30: { category: 'Other', subcategory: null, displayName: 'Softball', type: 'other' },
      31: { category: 'Other', subcategory: null, displayName: 'Volleyball', type: 'other' },
      33: { category: 'Other', subcategory: null, displayName: 'Handball', type: 'other' },
      13: { category: 'Other', subcategory: null, displayName: 'Rugby', type: 'other' },
      12: { category: 'Other', subcategory: null, displayName: 'Lacrosse', type: 'other' },
      27: { category: 'Other', subcategory: null, displayName: 'Golf', type: 'other' },
      26: { category: 'Other', subcategory: null, displayName: 'Bowling', type: 'other' },
      
      // Martial Arts
      43: { category: 'Other', subcategory: null, displayName: 'Boxing', type: 'other' },
      44: { category: 'Other', subcategory: null, displayName: 'Kickboxing', type: 'other' },
      45: { category: 'Other', subcategory: null, displayName: 'Martial Arts', type: 'other' },
      46: { category: 'Other', subcategory: null, displayName: 'Wrestling', type: 'other' },
      47: { category: 'Other', subcategory: null, displayName: 'Fencing', type: 'other' },
      
      // Other
      50: { category: 'Other', subcategory: null, displayName: 'Gymnastics', type: 'other' },
      51: { category: 'Other', subcategory: null, displayName: 'Climbing', type: 'other' },
      23: { category: 'Walking', subcategory: 'Outdoor', displayName: 'Hiking', type: 'walking' },
      60: { category: 'Other', subcategory: null, displayName: 'Dance', type: 'other' },
      39: { category: 'Other', subcategory: null, displayName: 'Skating', type: 'other' },
      20: { category: 'Other', subcategory: null, displayName: 'Snowboarding', type: 'other' },
      19: { category: 'Other', subcategory: null, displayName: 'Downhill Skiing', type: 'other' },
      21: { category: 'Other', subcategory: null, displayName: 'Cross Country Skiing', type: 'other' },
      25: { category: 'Other', subcategory: null, displayName: 'Surfing', type: 'other' },
      22: { category: 'Other', subcategory: null, displayName: 'Sailing', type: 'other' },
      24: { category: 'Other', subcategory: null, displayName: 'Fishing', type: 'other' },
      93: { category: 'Other', subcategory: null, displayName: 'Hunting', type: 'other' },
      57: { category: 'Other', subcategory: null, displayName: 'Play', type: 'other' },
      42: { category: 'Other', subcategory: null, displayName: 'Track & Field', type: 'other' },
      58: { category: 'Walking', subcategory: 'Outdoor', displayName: 'Wheelchair Walk Pace', type: 'walking' },
      101: { category: 'Running', subcategory: 'Outdoor', displayName: 'Wheelchair Run Pace', type: 'running' },
    };

    if (idMapping[numericId]) {
      return idMapping[numericId];
    }
  }

  // Default fallback
  return {
    category: 'Other',
    subcategory: null,
    displayName: 'Workout',
    type: 'other',
  };
};

/**
 * Map HealthKit activity ID (number) to activity type string (legacy function for backward compatibility)
 */
const mapActivityIdToType = (activityId: number | string): Activity['type'] => {
  const id = typeof activityId === 'number' ? activityId : (typeof activityId === 'string' ? parseInt(activityId.match(/\d+/)?.[0] || '0', 10) : 0);
  const mapping = mapHealthKitActivityToActivityInfo(id, undefined);
  return mapping.type;
};

/**
 * Map HealthKit workout type string to our Activity type (legacy function for backward compatibility)
 */
const mapWorkoutTypeToActivityType = (healthKitType: string): Activity['type'] => {
  const name = healthKitType.replace(/^HKWorkoutActivityType/, '');
  const mapping = mapHealthKitActivityToActivityInfo(null, name);
  return mapping.type;
};

/**
 * Format activity name to match Apple Fitness app style
 * Now uses the comprehensive mapping system
 */
export const formatActivityName = (activityId: number | string | null | undefined, activityName: string | undefined): string => {
  const mapping = mapHealthKitActivityToActivityInfo(activityId, activityName);
  return mapping.displayName;
};

/**
 * Fetch workouts/activities for a specific date
 */
export const getActivitiesForDate = async (date: Date): Promise<Activity[]> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit is unavailable on this device.');
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };

  return new Promise(async (resolve, reject) => {
    AppleHealthKit.getAnchoredWorkouts(
      options,
      async (err: Object, results: AnchoredQueryResults) => {
        if (err) {
          reject(err);
          return;
        }

        const activities: Activity[] = await Promise.all(results.data.map(async (workout: HKWorkoutQueriedSampleType, index: number) => {
          // Extract metadata
          const metadata = workout.metadata || {};
          const workoutAny = workout as any;
          
          // Extract heart rate - check multiple locations
          // 1. Metadata fields (primary location)
          let avgHeartRate = metadata['HKAverageHeartRate'] as number | undefined;
          let maxHeartRate = metadata['HKMaximumHeartRate'] as number | undefined;
          
          // 2. Check workout object directly
          if (!avgHeartRate) {
            avgHeartRate = workoutAny.averageHeartRate || workoutAny.avgHeartRate || workoutAny.heartRate;
          }
          if (!maxHeartRate) {
            maxHeartRate = workoutAny.maxHeartRate || workoutAny.maximumHeartRate;
          }
          
          // 3. Check other metadata keys
          if (!avgHeartRate) {
            avgHeartRate = metadata['HKWorkoutAverageHeartRate'] as number | undefined;
          }
          if (!maxHeartRate) {
            maxHeartRate = metadata['HKWorkoutMaximumHeartRate'] as number | undefined;
          }
          
          // Ensure values are numbers
          if (avgHeartRate !== undefined) {
            const value = typeof avgHeartRate === 'number' ? avgHeartRate : parseFloat(String(avgHeartRate));
            avgHeartRate = isNaN(value) ? undefined : Math.round(value);
          }
          if (maxHeartRate !== undefined) {
            const value = typeof maxHeartRate === 'number' ? maxHeartRate : parseFloat(String(maxHeartRate));
            maxHeartRate = isNaN(value) ? undefined : Math.round(value);
          }
          
          // Extract distance from workout
          // HealthKit's workout.distance might be in meters or miles depending on device settings
          // react-native-health library may return it directly or in metadata
          let distanceInMeters: number | undefined;
          let rawDistanceValue: number | undefined;
          
          // Priority order for finding distance:
          // 1. workout.distance (primary field from HealthKit)
          // 2. Metadata fields
          // 3. Other workout properties
          
          // Check primary distance field first
          if (workout.distance !== undefined && workout.distance !== null) {
            const value = typeof workout.distance === 'number' ? workout.distance : parseFloat(String(workout.distance));
            if (!isNaN(value) && value > 0) {
              rawDistanceValue = value;
            }
          }
          
          // If not found, check metadata (react-native-health sometimes stores it here)
          if (!rawDistanceValue) {
            const metadataFields = [
              metadata['HKTotalDistance'],
              metadata['HKDistance'],
              metadata['HKDistanceWalkingRunning'],
              metadata['HKWorkoutDistance'],
              metadata['HKWorkoutTotalDistance'],
              metadata['HKTotalDistanceWalkingRunning'],
            ];
            
            for (const field of metadataFields) {
              if (field !== undefined && field !== null) {
                const value = typeof field === 'number' ? field : parseFloat(String(field));
                if (!isNaN(value) && value > 0) {
                  rawDistanceValue = value;
                  break;
                }
              }
            }
          }
          
          // If still not found, check other workout properties
          if (!rawDistanceValue) {
            const otherFields = [
              workoutAny.totalDistance,
              workoutAny.distanceWalkingRunning,
              workoutAny.distanceCycling,
              workoutAny.distanceRunning,
              workoutAny.distanceValue,
              workoutAny.distanceInMeters,
              workoutAny.distanceMeters,
              workoutAny.totalDistanceWalkingRunning,
              workoutAny.statistics?.distance,
              workoutAny.statistics?.totalDistance,
              workoutAny.metrics?.distance,
              workoutAny.metrics?.totalDistance,
            ];
            
            for (const field of otherFields) {
              if (field !== undefined && field !== null) {
                const value = typeof field === 'number' ? field : parseFloat(String(field));
                if (!isNaN(value) && value > 0) {
                  rawDistanceValue = value;
                  break;
                }
              }
            }
          }
          
          // Convert distance to meters
          // HealthKit might return distance in miles or meters depending on device settings
          // Heuristic: if value is less than 50 and seems reasonable for a run/cycle in miles, convert from miles
          // Otherwise assume it's already in meters
          if (rawDistanceValue) {
            // Check if value seems to be in miles (typical runs are 1-30 miles, but meters would be 1600-48000+)
            // If value is between 0.5 and 50, it's likely in miles
            // If value is 100+ and seems reasonable for meters, keep as meters
            const isLikelyMiles = rawDistanceValue > 0.5 && rawDistanceValue < 50;
            
            if (isLikelyMiles) {
              // Convert miles to meters (1 mile = 1609.34 meters)
              distanceInMeters = rawDistanceValue * 1609.34;
            } else {
              // Assume it's already in meters
              distanceInMeters = rawDistanceValue;
            }
          }
          
          // Log distance for debugging (only for first workout and if it's a distance-based activity)
          const isDistanceActivity = ['Running', 'Cycling', 'Walking', 'Rowing'].includes(workout.activityName || '');
          if (isDistanceActivity && index === 0) {
            console.log('=== DISTANCE DEBUGGING ===');
            console.log('Activity:', workout.activityName || workout.activityId);
            console.log('Raw distance value:', rawDistanceValue);
            console.log('Distance in meters:', distanceInMeters);
            console.log('Distance in km:', distanceInMeters ? (distanceInMeters / 1000).toFixed(2) : 'N/A');
            console.log('Distance in miles (if raw was miles):', rawDistanceValue ? rawDistanceValue.toFixed(2) : 'N/A');
            console.log('=== END DISTANCE DEBUGGING ===');
          }

          // Calculate average pace if we have distance and duration
          // Use proper rounding to avoid precision issues
          let avgPace: number | undefined;
          if (distanceInMeters && distanceInMeters > 0 && workout.duration) {
            const km = distanceInMeters / 1000;
            avgPace = Math.round((workout.duration / km) * 100) / 100; // seconds per km, rounded to 2 decimals
          }

          // Map activity using comprehensive mapping system
          // Save the raw HealthKit data BEFORE mapping for SF Symbol mapping
          const rawActivityId = workout.activityId !== undefined ? workout.activityId : null;
          const rawActivityName = workout.activityName || undefined;
          
          // Get comprehensive activity mapping (category, subcategory, displayName, type)
          const activityMapping = mapHealthKitActivityToActivityInfo(rawActivityId, rawActivityName);
          
          // Log activity mapping and check for available data
          if (index === 0) {
            console.log('Raw activity ID:', rawActivityId);
            console.log('Raw activity name:', rawActivityName);
            console.log('Activity mapping:', activityMapping);
            console.log('Workout activityId:', workout.activityId);
            console.log('Workout activityName:', workout.activityName);
            console.log('Full workout object keys:', Object.keys(workoutAny));
            console.log('Workout metadata keys:', Object.keys(metadata));
            // Log any potential event/statistics/route data
            if (workoutAny.events) console.log('Workout events:', workoutAny.events);
            if (workoutAny.statistics) console.log('Workout statistics:', workoutAny.statistics);
            if (workoutAny.route) console.log('Workout route:', workoutAny.route);
            if (workoutAny.workoutEvents) console.log('Workout events (alt):', workoutAny.workoutEvents);
            if (workoutAny.workoutStatistics) console.log('Workout statistics (alt):', workoutAny.workoutStatistics);
            if (workoutAny.workoutRoute) console.log('Workout route (alt):', workoutAny.workoutRoute);
          }

          // Extract calories - HealthKit provides active calories in workout.calories
          const activeCalories = Math.round(workout.calories || 0);

          return {
            id: workout.id || `workout-${date.getTime()}-${index}`,
            name: activityMapping.displayName,
            category: activityMapping.category,
            subcategory: activityMapping.subcategory,
            type: activityMapping.type,
            startTime: workout.start,
            duration: Math.round(workout.duration), // in seconds
            activeCalories,
            distance: distanceInMeters,
            elevationGain: metadata['HKElevationAscended'] as number | undefined,
            avgHeartRate: avgHeartRate,
            maxHeartRate: maxHeartRate,
            avgPace,
            avgCadence: metadata['HKAverageCadence'] as number | undefined,
            avgPower: metadata['HKAveragePower'] as number | undefined,
            healthKitActivityId: rawActivityId !== null ? rawActivityId : undefined,
            healthKitActivityName: rawActivityName || undefined,
          };
        }));

        resolve(activities);
      }
    );
  });
};

/**
 * Fetch workouts/activities for a date range
 */
export const getActivitiesForDateRange = async (startDate: Date, endDate: Date): Promise<Activity[]> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit is unavailable on this device.');
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const options: HealthInputOptions = {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };

  return new Promise(async (resolve, reject) => {
    AppleHealthKit.getAnchoredWorkouts(
      options,
      async (err: Object, results: AnchoredQueryResults) => {
        if (err) {
          reject(err);
          return;
        }

        const activities: Activity[] = await Promise.all(results.data.map(async (workout: HKWorkoutQueriedSampleType, index: number) => {
          // Extract metadata
          const metadata = workout.metadata || {};
          const workoutAny = workout as any;
          
          // Extract heart rate - check multiple locations
          // 1. Metadata fields (primary location)
          let avgHeartRate = metadata['HKAverageHeartRate'] as number | undefined;
          let maxHeartRate = metadata['HKMaximumHeartRate'] as number | undefined;
          
          // 2. Check workout object directly
          if (!avgHeartRate) {
            avgHeartRate = workoutAny.averageHeartRate || workoutAny.avgHeartRate || workoutAny.heartRate;
          }
          if (!maxHeartRate) {
            maxHeartRate = workoutAny.maxHeartRate || workoutAny.maximumHeartRate;
          }
          
          // 3. Check other metadata keys
          if (!avgHeartRate) {
            avgHeartRate = metadata['HKWorkoutAverageHeartRate'] as number | undefined;
          }
          if (!maxHeartRate) {
            maxHeartRate = metadata['HKWorkoutMaximumHeartRate'] as number | undefined;
          }
          
          // Ensure values are numbers
          if (avgHeartRate !== undefined) {
            const value = typeof avgHeartRate === 'number' ? avgHeartRate : parseFloat(String(avgHeartRate));
            avgHeartRate = isNaN(value) ? undefined : Math.round(value);
          }
          if (maxHeartRate !== undefined) {
            const value = typeof maxHeartRate === 'number' ? maxHeartRate : parseFloat(String(maxHeartRate));
            maxHeartRate = isNaN(value) ? undefined : Math.round(value);
          }
          
          // Extract distance from workout
          // HealthKit's workout.distance might be in meters or miles depending on device settings
          // react-native-health library may return it directly or in metadata
          let distanceInMeters: number | undefined;
          let rawDistanceValue: number | undefined;
          
          // Priority order for finding distance:
          // 1. workout.distance (primary field from HealthKit)
          // 2. Metadata fields
          // 3. Other workout properties
          
          // Check primary distance field first
          if (workout.distance !== undefined && workout.distance !== null) {
            const value = typeof workout.distance === 'number' ? workout.distance : parseFloat(String(workout.distance));
            if (!isNaN(value) && value > 0) {
              rawDistanceValue = value;
            }
          }
          
          // If not found, check metadata (react-native-health sometimes stores it here)
          if (!rawDistanceValue) {
            const metadataFields = [
              metadata['HKTotalDistance'],
              metadata['HKDistance'],
              metadata['HKDistanceWalkingRunning'],
              metadata['HKWorkoutDistance'],
              metadata['HKWorkoutTotalDistance'],
              metadata['HKTotalDistanceWalkingRunning'],
            ];
            
            for (const field of metadataFields) {
              if (field !== undefined && field !== null) {
                const value = typeof field === 'number' ? field : parseFloat(String(field));
                if (!isNaN(value) && value > 0) {
                  rawDistanceValue = value;
                  break;
                }
              }
            }
          }
          
          // If still not found, check other workout properties
          if (!rawDistanceValue) {
            const otherFields = [
              workoutAny.totalDistance,
              workoutAny.distanceWalkingRunning,
              workoutAny.distanceCycling,
              workoutAny.distanceRunning,
              workoutAny.distanceValue,
              workoutAny.distanceInMeters,
              workoutAny.distanceMeters,
              workoutAny.totalDistanceWalkingRunning,
              workoutAny.statistics?.distance,
              workoutAny.statistics?.totalDistance,
              workoutAny.metrics?.distance,
              workoutAny.metrics?.totalDistance,
            ];
            
            for (const field of otherFields) {
              if (field !== undefined && field !== null) {
                const value = typeof field === 'number' ? field : parseFloat(String(field));
                if (!isNaN(value) && value > 0) {
                  rawDistanceValue = value;
                  break;
                }
              }
            }
          }
          
          // Convert distance to meters
          // HealthKit might return distance in miles or meters depending on device settings
          // Heuristic: if value is less than 50 and seems reasonable for a run/cycle in miles, convert from miles
          // Otherwise assume it's already in meters
          if (rawDistanceValue) {
            // Check if value seems to be in miles (typical runs are 1-30 miles, but meters would be 1600-48000+)
            // If value is between 0.5 and 50, it's likely in miles
            // If value is 100+ and seems reasonable for meters, keep as meters
            const isLikelyMiles = rawDistanceValue > 0.5 && rawDistanceValue < 50;
            
            if (isLikelyMiles) {
              // Convert miles to meters (1 mile = 1609.34 meters)
              distanceInMeters = rawDistanceValue * 1609.34;
            } else {
              // Assume it's already in meters
              distanceInMeters = rawDistanceValue;
            }
          }
          
          // Log distance for debugging (only for first workout and if it's a distance-based activity)
          const isDistanceActivity = ['Running', 'Cycling', 'Walking', 'Rowing'].includes(workout.activityName || '');
          if (isDistanceActivity && index === 0) {
            console.log('=== DISTANCE DEBUGGING ===');
            console.log('Activity:', workout.activityName || workout.activityId);
            console.log('Raw distance value:', rawDistanceValue);
            console.log('Distance in meters:', distanceInMeters);
            console.log('Distance in km:', distanceInMeters ? (distanceInMeters / 1000).toFixed(2) : 'N/A');
            console.log('Distance in miles (if raw was miles):', rawDistanceValue ? rawDistanceValue.toFixed(2) : 'N/A');
            console.log('=== END DISTANCE DEBUGGING ===');
          }

          // Calculate average pace if we have distance and duration
          // Use proper rounding to avoid precision issues
          let avgPace: number | undefined;
          if (distanceInMeters && distanceInMeters > 0 && workout.duration) {
            const km = distanceInMeters / 1000;
            avgPace = Math.round((workout.duration / km) * 100) / 100; // seconds per km, rounded to 2 decimals
          }

          // Map activity using comprehensive mapping system
          // Save the raw HealthKit data BEFORE mapping for SF Symbol mapping
          const rawActivityId = workout.activityId !== undefined ? workout.activityId : null;
          const rawActivityName = workout.activityName || undefined;
          
          // Get comprehensive activity mapping (category, subcategory, displayName, type)
          const activityMapping = mapHealthKitActivityToActivityInfo(rawActivityId, rawActivityName);
          
          // Log activity mapping for debugging
          if (index === 0) {
            console.log('Raw activity ID:', rawActivityId);
            console.log('Raw activity name:', rawActivityName);
            console.log('Activity mapping:', activityMapping);
            console.log('Workout activityId:', workout.activityId);
            console.log('Workout activityName:', workout.activityName);
          }

          const workoutDate = new Date(workout.start);

          // Extract calories - HealthKit provides active calories in workout.calories
          // Total calories = active + basal (resting) energy during workout
          const activeCalories = Math.round(workout.calories || 0);
          
          // Check for total calories in metadata or other fields
          const totalCaloriesFromMetadata = metadata['HKTotalEnergyBurned'] as number | undefined;
          const totalCaloriesFromWorkout = workoutAny.totalEnergyBurned || workoutAny.totalCalories;
          
          // Calculate total calories: active + basal for the workout duration
          // Basal metabolic rate is typically ~1.0-1.5 calories per minute
          // For a rough estimate: basal = (duration in minutes) * 1.2
          const workoutDurationMinutes = workout.duration / 60;
          const estimatedBasalCalories = Math.round(workoutDurationMinutes * 1.2);
          const calculatedTotalCalories = activeCalories + estimatedBasalCalories;
          
          // Use total calories from metadata if available, otherwise calculate
          const totalCalories = totalCaloriesFromMetadata 
            ? Math.round(totalCaloriesFromMetadata)
            : (totalCaloriesFromWorkout 
              ? Math.round(totalCaloriesFromWorkout)
              : calculatedTotalCalories);

          return {
            id: workout.id || `workout-${workoutDate.getTime()}-${index}`,
            name: activityMapping.displayName,
            category: activityMapping.category,
            subcategory: activityMapping.subcategory,
            type: activityMapping.type,
            startTime: workout.start,
            duration: Math.round(workout.duration), // in seconds
            activeCalories,
            distance: distanceInMeters,
            elevationGain: metadata['HKElevationAscended'] as number | undefined,
            avgHeartRate: avgHeartRate,
            maxHeartRate: maxHeartRate,
            avgPace,
            avgCadence: metadata['HKAverageCadence'] as number | undefined,
            avgPower: metadata['HKAveragePower'] as number | undefined,
            healthKitActivityId: rawActivityId !== null ? rawActivityId : undefined,
            healthKitActivityName: rawActivityName || undefined,
          };
        }));

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
