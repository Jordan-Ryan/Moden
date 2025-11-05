import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BarChart from '../components/BarChart';
import DonutRing from '../components/DonutRing';
import GlassCard, { GlassStack } from '../components/GlassCard';
import { loadMacroTargets, loadCalorieTarget } from '../utils/storage';
import { useHealth } from '../context/HealthContext';
import TabIcon from '../components/TabIcon';
import ActivityIcon from '../components/ActivityIcon';
import { Activity } from '../utils/healthKit';

const formatLongDate = (d: Date) => d.toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

const formatActivityMetric = (activity: Activity): string => {
  // Show distance for activities that typically have distance (running, cycling, walking, rowing)
  const distanceCategories = ['Running', 'Cycling', 'Walking', 'Rowing'];
  const distanceTypes = ['running', 'cycling', 'walking', 'rowing'];
  
  const shouldShowDistance = activity.distance && (
    distanceCategories.includes(activity.category) || 
    distanceTypes.includes(activity.type)
  );
  
  if (shouldShowDistance) {
    const km = activity.distance / 1000;
    return `${km.toFixed(2)} km`;
  }
  
  // Otherwise show calories
  return `${activity.activeCalories} cal`;
};

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data, date, error, moveDay, refresh, loading } = useHealth();
  const [targets, setTargets] = React.useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [hasTargets, setHasTargets] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isManualRefresh, setIsManualRefresh] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        const [calorieGoal, macroTargets] = await Promise.all([
          loadCalorieTarget(),
          loadMacroTargets(),
        ]);
        if (!isActive) {
          return;
        }
        const mergedTargets = {
          calories: calorieGoal ?? macroTargets?.calories ?? 0,
          protein: macroTargets?.protein ?? 0,
          carbs: macroTargets?.carbs ?? 0,
          fats: macroTargets?.fats ?? 0,
        };
        setTargets(mergedTargets);
        const anyTargets = Boolean(
          mergedTargets.calories ||
            mergedTargets.protein ||
            mergedTargets.carbs ||
            mergedTargets.fats
        );
        setHasTargets(anyTargets);
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const consumedCalories = data?.macros.calories ?? 0;
  const remainingDiff = (targets.calories || 0) - consumedCalories;
  const remainingCalories = Math.max(0, remainingDiff);

  const macroSummary = [
    {
      key: 'carbs' as const,
      label: 'Carbohydrates',
      value: data?.macros.carbs ?? 0,
      goal: targets.carbs || 0,
      color: '#18b87a',
    },
    {
      key: 'fats' as const,
      label: 'Fat',
      value: data?.macros.fats ?? 0,
      goal: targets.fats || 0,
      color: '#9b59b6',
    },
    {
      key: 'protein' as const,
      label: 'Protein',
      value: data?.macros.protein ?? 0,
      goal: targets.protein || 0,
      color: '#f39c12',
    },
  ];

  const calorieGoal = targets.calories || 0;
  const calorieProgress =
    calorieGoal > 0 ? Math.min(100, Math.round((consumedCalories / calorieGoal) * 100)) : 0;

  const handleConfigureTargets = React.useCallback(() => {
    navigation.navigate('Settings' as never);
  }, [navigation]);

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setIsManualRefresh(true);
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
      setIsManualRefresh(false);
    }
  }, [refresh]);

  // Auto-refresh every minute when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Refresh immediately when screen is focused
      refresh();

      // Set up interval to refresh every minute (60000ms)
      const interval = setInterval(() => {
        refresh();
      }, 60000);

      // Cleanup interval when screen loses focus
      return () => {
        clearInterval(interval);
      };
    }, [refresh])
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing && isManualRefresh}
          onRefresh={onRefresh}
          tintColor="#4b8af0"
          colors={['#4b8af0']}
        />
      }
    >
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.navButton} onPress={() => moveDay(-1)}>
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatLongDate(date)}</Text>
        {new Date(date.toDateString()) < new Date(new Date().toDateString()) ? (
          <TouchableOpacity style={styles.navButton} onPress={() => moveDay(1)}>
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.navButton, { opacity: 0 }]} />
        )}
      </View>

      {!!error && (
        <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>
      )}

      <GlassStack spacing={18} style={styles.glassStack}>
        <GlassCard style={styles.cardGlass} interactive>
          <Text style={styles.cardTitle}>
            Steps ({(data?.steps.total ?? 0).toLocaleString()})
          </Text>
          <BarChart values={data?.steps.hourly ?? new Array(24).fill(0)} height={150} />
        </GlassCard>

        <GlassCard style={styles.cardGlass} interactive>
          <Text style={styles.cardTitle}>Macros</Text>
          {hasTargets ? (
            <>
              <View style={[styles.progressBar, { marginTop: 8 }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${calorieProgress}%` },
                  ]}
                />
              </View>
              <View style={[styles.twoCol, { marginTop: 12, alignItems: 'center' }]}>
                <View style={styles.colCenter}>
                  <Text style={styles.bigNumber}>{calorieGoal}</Text>
                  <Text style={styles.subtle}>Goal</Text>
                </View>
                <View style={styles.colCenter}>
                  <Text style={styles.bigNumber}>{Math.round(consumedCalories)}</Text>
                  <Text style={styles.subtle}>Food</Text>
                </View>
                <View style={styles.colCenter}>
                  <Text style={[styles.bigNumber, remainingDiff < 0 && styles.bigNumberOver]}>
                    {Math.abs(Math.round(remainingDiff))}
                  </Text>
                  <Text style={[styles.subtle, remainingDiff < 0 && styles.subtleOver]}>
                    {remainingDiff < 0 ? 'over' : 'Remaining'}
                  </Text>
                </View>
              </View>
              <View style={[styles.ringsRow, { marginTop: 12 }]}>
                {macroSummary.map((macro) => {
                  const goalAmount = Math.max(0, Math.round(macro.goal));
                  const consumedAmount = Math.max(0, Math.round(macro.value));
                  const diff = goalAmount - consumedAmount;
                  const diffLabel = `${Math.abs(diff)}g ${diff >= 0 ? 'left' : 'over'}`;
                  const diffColor = diff >= 0 ? '#9a9a9a' : '#ff6b6b';
                  return (
                    <View key={macro.key} style={styles.ringWrapper}>
                      <DonutRing
                        label={macro.label}
                        value={consumedAmount}
                        goal={goalAmount}
                        color={macro.color}
                        targetLabel={`${goalAmount}g`}
                        diffLabel={diffLabel}
                        diffColor={diffColor}
                      />
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.noTargetsContainer}>
              <Text style={styles.noTargetsText}>
                Set your calorie and macro targets in Settings to track progress.
              </Text>
              <TouchableOpacity style={styles.configureButton} onPress={handleConfigureTargets}>
                <Text style={styles.configureButtonText}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.cardGlass} interactive>
          <Text style={styles.cardTitle}>Activity</Text>
          {data?.activities && data.activities.length > 0
            ? data.activities.map((a) => (
                <View key={a.id} style={styles.activityRow}>
                  <ActivityIcon activity={a} size={36} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.activityTitle}>{a.name}</Text>
                    <Text style={styles.subtle}>{Math.round(a.duration / 60)} min</Text>
                  </View>
                  <Text style={styles.mValue}>{formatActivityMetric(a)}</Text>
                </View>
              ))
            : (
                <View style={[styles.activityRow, styles.restRow]}>
                  <View style={styles.activityIconBubble}>
                    <TabIcon name="sleep" color="#f5f5f5" size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>Rest</Text>
                    <Text style={styles.subtle}>Rest Day</Text>
                  </View>
                </View>
              )}
        </GlassCard>
      </GlassStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  contentContainer: { paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1f1f1f' },
  navButtonText: { color: '#e5e5e5', fontWeight: '700' },
  dateText: { color: '#eaeaea', fontSize: 16, fontWeight: '600' },
  glassStack: { gap: 16 },
  card: { backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f1f1f', marginBottom: 16 },
  cardGlass: { marginBottom: 0 },
  cardTitle: { color: '#f5f5f5', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  mLabel: { color: '#a9a9a9', fontSize: 14 },
  progressBar: { height: 8, borderRadius: 999, backgroundColor: '#1c1c1c', overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#4b8af0' },
  twoCol: { flexDirection: 'row', gap: 24 },
  colCenter: { flex: 1, alignItems: 'center' },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ringWrapper: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  mValue: { color: '#fff', fontSize: 22, fontWeight: '700' },
  errorContainer: { backgroundColor: 'rgba(255, 107, 107, 0.12)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.4)', marginBottom: 12 },
  errorText: { color: '#ff6b6b' },
  bigNumber: { color: '#fff', fontSize: 22, fontWeight: '700' },
  bigNumberOver: { color: '#ff6b6b' },
  subtle: { color: '#9a9a9a', fontSize: 12 },
  subtleOver: { color: '#ff6b6b' },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1c1c1c' },
  activityIconBubble: { width: 36, height: 36, borderRadius: 18, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  activityTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noTargetsContainer: { alignItems: 'center', paddingVertical: 12 },
  noTargetsText: { color: '#cfcfcf', textAlign: 'center', marginBottom: 12 },
  configureButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#4b8af0' },
  configureButtonText: { color: '#4b8af0', fontWeight: '600' },
  restRow: { borderBottomWidth: 0 },
});
