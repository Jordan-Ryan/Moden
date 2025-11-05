import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import GlassCard, { GlassStack } from '../components/GlassCard';
import {
  saveCalorieTarget,
  saveMacroTargets,
  loadCalorieTarget,
  loadMacroTargets,
  saveMacroMode,
  loadMacroMode,
  saveMacroSplit,
  loadMacroSplit,
  calculateGramsFromCaloriesAndSplit,
  MacroTargets,
  MacroSplit,
  MacroMode,
} from '../utils/storage';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = React.useState<MacroMode>('grams');
  const [calorieTarget, setCalorieTarget] = React.useState('');
  const [calculatedCalories, setCalculatedCalories] = React.useState(0);
  const [macroTargets, setMacroTargets] = React.useState<MacroTargets>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [macroSplit, setMacroSplit] = React.useState<MacroSplit>({
    proteinPct: 0,
    carbsPct: 0,
    fatsPct: 0,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        const [calorieGoal, macroTargetsData, savedMode, savedSplit] = await Promise.all([
          loadCalorieTarget(),
          loadMacroTargets(),
          loadMacroMode(),
          loadMacroSplit(),
        ]);
        if (!isActive) {
          return;
        }
        const currentMode = savedMode || 'grams';
        const loadedTargets = macroTargetsData || { calories: 0, protein: 0, carbs: 0, fats: 0 };
        const loadedSplit = savedSplit || { proteinPct: 0, carbsPct: 0, fatsPct: 0 };
        
        setMode(currentMode);
        setCalorieTarget(calorieGoal ? String(calorieGoal) : '');
        setMacroTargets(loadedTargets);
        setMacroSplit(loadedSplit);

        // Sync values based on mode
        if (currentMode === 'grams' && (loadedTargets.protein > 0 || loadedTargets.carbs > 0 || loadedTargets.fats > 0)) {
          // Calculate percentages from grams
          const proteinCals = loadedTargets.protein * 4;
          const carbsCals = loadedTargets.carbs * 4;
          const fatsCals = loadedTargets.fats * 9;
          const total = proteinCals + carbsCals + fatsCals;
          if (total > 0) {
            setMacroSplit({
              proteinPct: Math.round((proteinCals / total) * 1000) / 10,
              carbsPct: Math.round((carbsCals / total) * 1000) / 10,
              fatsPct: Math.round((fatsCals / total) * 1000) / 10,
            });
          }
        } else if (currentMode === 'percent' && calorieGoal && (loadedSplit.proteinPct > 0 || loadedSplit.carbsPct > 0 || loadedSplit.fatsPct > 0)) {
          // Calculate grams from percentages
          const calculatedTargets = calculateGramsFromCaloriesAndSplit(calorieGoal, loadedSplit);
          setMacroTargets(calculatedTargets);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Calculate calories from grams when in grams mode
  React.useEffect(() => {
    if (mode === 'grams') {
      const proteinCals = macroTargets.protein * 4;
      const carbsCals = macroTargets.carbs * 4;
      const fatsCals = macroTargets.fats * 9;
      const total = proteinCals + carbsCals + fatsCals;
      setCalculatedCalories(Math.round(total));

      // Calculate percentages from grams
      if (total > 0) {
        const proteinPct = (proteinCals / total) * 100;
        const carbsPct = (carbsCals / total) * 100;
        const fatsPct = (fatsCals / total) * 100;
        setMacroSplit({
          proteinPct: Math.round(proteinPct * 10) / 10,
          carbsPct: Math.round(carbsPct * 10) / 10,
          fatsPct: Math.round(fatsPct * 10) / 10,
        });
      } else {
        setMacroSplit({ proteinPct: 0, carbsPct: 0, fatsPct: 0 });
      }
    }
  }, [mode, macroTargets]);

  // Calculate grams from percentages when in percentage mode
  React.useEffect(() => {
    if (mode === 'percent') {
      const calorieValue = calorieTarget.trim() ? parseInt(calorieTarget.trim(), 10) : 0;
      const total = macroSplit.proteinPct + macroSplit.carbsPct + macroSplit.fatsPct;
      if (calorieValue > 0 && total > 0) {
        const calculatedTargets = calculateGramsFromCaloriesAndSplit(calorieValue, macroSplit);
        setMacroTargets(calculatedTargets);
      }
    }
  }, [mode, calorieTarget, macroSplit]);

  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    try {
      if (mode === 'percent') {
        // Validate percentage mode
        const total = macroSplit.proteinPct + macroSplit.carbsPct + macroSplit.fatsPct;
        if (Math.abs(total - 100) > 0.01) {
          Alert.alert('Invalid Input', 'Percentages must total exactly 100%.');
          setIsSaving(false);
          return;
        }

        const calorieValue = calorieTarget.trim() ? parseInt(calorieTarget.trim(), 10) : null;
        if (!calorieValue || Number.isNaN(calorieValue) || calorieValue <= 0) {
          Alert.alert('Invalid Input', 'Please enter a valid calorie target.');
          setIsSaving(false);
          return;
        }

        // Save percentage split and mode
        await Promise.all([
          saveMacroSplit(macroSplit),
          saveMacroMode('percent'),
          saveCalorieTarget(calorieValue),
        ]);

        // Calculate and save grams from percentages and calories
        const calculatedTargets = calculateGramsFromCaloriesAndSplit(calorieValue, macroSplit);
        await saveMacroTargets(calculatedTargets);
      } else {
        // Grams mode: validate grams are set
        const hasMacros = macroTargets.protein > 0 || macroTargets.carbs > 0 || macroTargets.fats > 0;
        if (!hasMacros) {
          Alert.alert('Invalid Input', 'Please enter at least one macro target.');
          setIsSaving(false);
          return;
        }

        // Save grams and mode
        await Promise.all([
          saveMacroTargets(macroTargets),
          saveMacroMode('grams'),
          saveCalorieTarget(calculatedCalories),
        ]);
      }

      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [mode, calorieTarget, macroTargets, macroSplit, calculatedCalories]);

  const updateMacro = React.useCallback((key: keyof MacroTargets, value: string) => {
    const numValue = value.trim() ? parseInt(value.trim(), 10) : 0;
    if (value.trim() === '' || (!Number.isNaN(numValue) && numValue >= 0)) {
      setMacroTargets((prev) => ({ ...prev, [key]: value.trim() === '' ? 0 : numValue }));
    }
  }, []);

  const updateMacroSplit = React.useCallback((key: keyof MacroSplit, value: string) => {
    const numValue = value.trim() ? parseFloat(value.trim()) : 0;
    if (value.trim() === '' || (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
      setMacroSplit((prev) => ({ ...prev, [key]: value.trim() === '' ? 0 : numValue }));
    }
  }, []);

  const percentageTotal = macroSplit.proteinPct + macroSplit.carbsPct + macroSplit.fatsPct;
  const percentageDiff = Math.abs(percentageTotal - 100);

  const toggleMode = React.useCallback(() => {
    const newMode = mode === 'grams' ? 'percent' : 'grams';
    
    // When switching to percentage mode, ensure percentages are calculated from grams
    if (newMode === 'percent' && (macroTargets.protein > 0 || macroTargets.carbs > 0 || macroTargets.fats > 0)) {
      const proteinCals = macroTargets.protein * 4;
      const carbsCals = macroTargets.carbs * 4;
      const fatsCals = macroTargets.fats * 9;
      const total = proteinCals + carbsCals + fatsCals;
      if (total > 0) {
        setMacroSplit({
          proteinPct: Math.round((proteinCals / total) * 1000) / 10,
          carbsPct: Math.round((carbsCals / total) * 1000) / 10,
          fatsPct: Math.round((fatsCals / total) * 1000) / 10,
        });
        // Set calorie target if not already set
        if (!calorieTarget.trim()) {
          setCalorieTarget(String(Math.round(total)));
        }
      }
    }
    // When switching to grams mode, ensure grams are calculated from percentages
    else if (newMode === 'grams') {
      const calorieValue = calorieTarget.trim() ? parseInt(calorieTarget.trim(), 10) : 0;
      const total = macroSplit.proteinPct + macroSplit.carbsPct + macroSplit.fatsPct;
      if (calorieValue > 0 && total > 0) {
        const calculatedTargets = calculateGramsFromCaloriesAndSplit(calorieValue, macroSplit);
        setMacroTargets(calculatedTargets);
      }
    }
    
    setMode(newMode);
  }, [mode, macroTargets, macroSplit, calorieTarget]);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.headerText}>Settings</Text>
      <Text style={styles.subtitleText}>Configure your daily calorie and macro targets</Text>

      <GlassStack spacing={18} style={styles.glassStack}>
        <GlassCard style={styles.cardGlass} interactive>
          <View style={styles.modeToggleContainer}>
            <Text style={styles.cardTitle}>Macro Mode</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              disabled={isSaving}
            >
              <View style={[styles.toggleOption, mode === 'grams' && styles.toggleOptionActive]}>
                <Text style={[styles.toggleText, mode === 'grams' && styles.toggleTextActive]}>
                  Grams
                </Text>
              </View>
              <View style={[styles.toggleOption, mode === 'percent' && styles.toggleOptionActive]}>
                <Text style={[styles.toggleText, mode === 'percent' && styles.toggleTextActive]}>
                  Percentage
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard style={styles.cardGlass} interactive>
          <Text style={styles.cardTitle}>Calorie Target</Text>
          <Text style={styles.inputLabel}>
            {mode === 'percent' ? 'Daily calorie goal' : 'Calculated from macros (read-only)'}
          </Text>
          <TextInput
            style={[styles.input, mode === 'grams' && styles.inputDisabled]}
            value={mode === 'percent' ? calorieTarget : String(calculatedCalories)}
            onChangeText={mode === 'percent' ? setCalorieTarget : undefined}
            placeholder={mode === 'percent' ? 'Enter calorie target' : '0'}
            placeholderTextColor="#666"
            keyboardType="numeric"
            editable={mode === 'percent' && !isSaving}
          />
          {mode === 'grams' && calculatedCalories > 0 && (
            <Text style={styles.calculatedInfo}>
              (Protein × 4) + (Carbs × 4) + (Fats × 9) = {calculatedCalories} calories
            </Text>
          )}
        </GlassCard>

        <GlassCard style={styles.cardGlass} interactive>
          <Text style={styles.cardTitle}>Macro Targets</Text>
          <Text style={styles.inputLabel}>
            {mode === 'percent'
              ? 'Set percentages that total 100% (grams calculated automatically)'
              : 'Set your daily protein, carbs, and fat goals (percentages calculated automatically)'}
          </Text>

          {mode === 'grams' ? (
            <>
              <View style={styles.macroInputRow}>
                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.macroInput}
                    value={macroTargets.protein > 0 ? String(macroTargets.protein) : ''}
                    onChangeText={(value) => updateMacro('protein', value)}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    editable={!isSaving}
                  />
                  <Text style={styles.readOnlyValue}>
                    {macroSplit.proteinPct > 0 ? `${macroSplit.proteinPct.toFixed(1)}%` : '0%'}
                  </Text>
                </View>

                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.macroInput}
                    value={macroTargets.carbs > 0 ? String(macroTargets.carbs) : ''}
                    onChangeText={(value) => updateMacro('carbs', value)}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    editable={!isSaving}
                  />
                  <Text style={styles.readOnlyValue}>
                    {macroSplit.carbsPct > 0 ? `${macroSplit.carbsPct.toFixed(1)}%` : '0%'}
                  </Text>
                </View>

                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Fats (g)</Text>
                  <TextInput
                    style={styles.macroInput}
                    value={macroTargets.fats > 0 ? String(macroTargets.fats) : ''}
                    onChangeText={(value) => updateMacro('fats', value)}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    editable={!isSaving}
                  />
                  <Text style={styles.readOnlyValue}>
                    {macroSplit.fatsPct > 0 ? `${macroSplit.fatsPct.toFixed(1)}%` : '0%'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.macroInputRow}>
                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Protein (%)</Text>
                  <TextInput
                    style={styles.macroInput}
                    value={
                      macroSplit.proteinPct > 0 ? String(macroSplit.proteinPct) : ''
                    }
                    onChangeText={(value) => updateMacroSplit('proteinPct', value)}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    editable={!isSaving}
                  />
                  <Text style={styles.readOnlyValue}>
                    {macroTargets.protein > 0 ? `${Math.round(macroTargets.protein)}g` : '0g'}
                  </Text>
                </View>

                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Carbs (%)</Text>
                  <TextInput
                    style={styles.macroInput}
                    value={macroSplit.carbsPct > 0 ? String(macroSplit.carbsPct) : ''}
                    onChangeText={(value) => updateMacroSplit('carbsPct', value)}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    editable={!isSaving}
                  />
                  <Text style={styles.readOnlyValue}>
                    {macroTargets.carbs > 0 ? `${Math.round(macroTargets.carbs)}g` : '0g'}
                  </Text>
                </View>

                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Fats (%)</Text>
                  <TextInput
                    style={styles.macroInput}
                    value={macroSplit.fatsPct > 0 ? String(macroSplit.fatsPct) : ''}
                    onChangeText={(value) => updateMacroSplit('fatsPct', value)}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    editable={!isSaving}
                  />
                  <Text style={styles.readOnlyValue}>
                    {macroTargets.fats > 0 ? `${Math.round(macroTargets.fats)}g` : '0g'}
                  </Text>
                </View>
              </View>
              <View style={styles.percentageTotalContainer}>
                <Text
                  style={[
                    styles.percentageTotal,
                    percentageDiff > 0.01 && styles.percentageTotalError,
                  ]}
                >
                  Total: {percentageTotal.toFixed(1)}%
                  {percentageDiff > 0.01 && (
                    <Text style={styles.percentageTotalError}>
                      {' '}
                      ({percentageTotal > 100 ? '+' : ''}
                      {(percentageTotal - 100).toFixed(1)}%)
                    </Text>
                  )}
                </Text>
                {percentageDiff <= 0.01 && (
                  <Text style={styles.percentageTotalSuccess}>✓ Ready to save</Text>
                )}
              </View>
            </>
          )}
        </GlassCard>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (isSaving || (mode === 'percent' && percentageDiff > 0.01)) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving || (mode === 'percent' && percentageDiff > 0.01)}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Settings'}</Text>
        </TouchableOpacity>
      </GlassStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitleText: {
    color: '#9a9a9a',
    fontSize: 14,
    marginBottom: 24,
  },
  glassStack: {
    gap: 16,
  },
  cardGlass: {
    marginBottom: 0,
  },
  cardTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modeToggleContainer: {
    marginBottom: 0,
  },
  toggleButton: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#4b8af0',
  },
  toggleText: {
    color: '#9a9a9a',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputLabel: {
    color: '#a9a9a9',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#0a0a0a',
  },
  calculatedInfo: {
    color: '#9a9a9a',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  macroInputGroup: {
    flex: 1,
  },
  macroLabel: {
    color: '#a9a9a9',
    fontSize: 12,
    marginBottom: 8,
  },
  macroInput: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    textAlign: 'center',
  },
  readOnlyValue: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  percentageTotalContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    alignItems: 'center',
  },
  percentageTotal: {
    color: '#9a9a9a',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  percentageTotalError: {
    color: '#ff6b6b',
  },
  percentageTotalSuccess: {
    color: '#18b87a',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4b8af0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

