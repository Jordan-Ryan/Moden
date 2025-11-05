import AsyncStorage from '@react-native-async-storage/async-storage';

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};
export type MacroSplit = {
  proteinPct: number; // 0-100
  carbsPct: number;   // 0-100
  fatsPct: number;    // 0-100
};

export type MacroMode = 'percent' | 'grams';

const MACRO_SPLIT_KEY = 'moden.macroSplit.v1';
const MACRO_MODE_KEY = 'moden.macroMode.v1';


const CALORIE_TARGET_KEY = 'moden.calorieTarget.v1';
const MACRO_TARGETS_KEY = 'moden.macroTargets.v1';

export async function saveCalorieTarget(target: number): Promise<void> {
  try {
    await AsyncStorage.setItem(CALORIE_TARGET_KEY, String(target));
  } catch (error) {
    console.error('Failed to save calorie target', error);
    throw error;
  }
}

export async function loadCalorieTarget(): Promise<number | null> {
  try {
    const value = await AsyncStorage.getItem(CALORIE_TARGET_KEY);
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Failed to load calorie target', error);
    return null;
  }
}

export async function saveMacroTargets(targets: MacroTargets): Promise<void> {
  try {
    await AsyncStorage.setItem(MACRO_TARGETS_KEY, JSON.stringify(targets));
  } catch (error) {
    console.error('Failed to save macro targets', error);
    throw error;
  }
}

export async function loadMacroTargets(): Promise<MacroTargets | null> {
  try {
    const value = await AsyncStorage.getItem(MACRO_TARGETS_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as MacroTargets;
    return parsed;
  } catch (error) {
    console.error('Failed to load macro targets', error);
    return null;
  }
}

export async function saveMacroSplit(split: MacroSplit): Promise<void> {
  try {
    await AsyncStorage.setItem(MACRO_SPLIT_KEY, JSON.stringify(split));
  } catch (error) {
    console.error('Failed to save macro split', error);
  }
}

export async function loadMacroSplit(): Promise<MacroSplit | null> {
  try {
    const value = await AsyncStorage.getItem(MACRO_SPLIT_KEY);
    return value ? (JSON.parse(value) as MacroSplit) : null;
  } catch (error) {
    console.error('Failed to load macro split', error);
    return null;
  }
}

export async function saveMacroMode(mode: MacroMode): Promise<void> {
  try {
    await AsyncStorage.setItem(MACRO_MODE_KEY, mode);
  } catch (error) {
    console.error('Failed to save macro mode', error);
  }
}

export async function loadMacroMode(): Promise<MacroMode | null> {
  try {
    const value = await AsyncStorage.getItem(MACRO_MODE_KEY);
    if (value === 'percent' || value === 'grams') {
      return value;
    }
    return null;
  } catch (error) {
    console.error('Failed to load macro mode', error);
    return null;
  }
}

export function calculateGramsFromCaloriesAndSplit(calories: number, split: MacroSplit): MacroTargets {
  const proteinCals = (split.proteinPct / 100) * calories;
  const carbsCals = (split.carbsPct / 100) * calories;
  const fatsCals = (split.fatsPct / 100) * calories;
  return {
    calories: Math.round(calories),
    protein: Math.round(proteinCals / 4),
    carbs: Math.round(carbsCals / 4),
    fats: Math.round(fatsCals / 9),
  };
}

