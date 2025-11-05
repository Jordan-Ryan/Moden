import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  requestHealthKitPermissions, 
  checkHealthKitPermissions,
  getHealthDataForDate,
  isHealthKitAvailable,
  DailyHealthData 
} from './utils/healthKit';

function ModenApp() {
  const insets = useSafeAreaInsets();
  const [healthData, setHealthData] = useState<DailyHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    if (!isHealthKitAvailable()) {
      setError('HealthKit is only available on iOS devices');
      return;
    }

    try {
      const hasPermissions = await checkHealthKitPermissions();
      if (hasPermissions) {
        setPermissionsGranted(true);
        loadTodayData();
      } else {
        // Request permissions on first launch
        await requestPermissions();
      }
    } catch (err) {
      console.error('Error initializing:', err);
      setError('Failed to initialize HealthKit');
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Requesting HealthKit permissions...');
      const granted = await requestHealthKitPermissions();
      console.log('Permission request result:', granted);
      if (granted) {
        setPermissionsGranted(true);
        await loadTodayData();
      } else {
        // Check again - sometimes permissions are granted but check fails
        const hasPermissions = await checkHealthKitPermissions();
        if (hasPermissions) {
          setPermissionsGranted(true);
          await loadTodayData();
        } else {
          setError('HealthKit permissions were denied. Please enable them in Settings > Privacy & Security > Health > Moden');
        }
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError(`Failed to request HealthKit permissions: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayData = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      const data = await getHealthDataForDate(today);
      setHealthData(data);
    } catch (err) {
      console.error('Error loading health data:', err);
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isHealthKitAvailable()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>HealthKit is only available on iOS devices</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 24), paddingBottom: insets.bottom + 32 },
        ]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Moden Health</Text>
          <Text style={styles.subtitle}>Your Health Dashboard</Text>
        </View>

        {!permissionsGranted && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Moden needs access to your health data to display your daily activity, nutrition, and fitness metrics.
            </Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={requestPermissions}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Grant HealthKit Permissions</Text>
              )}
            </TouchableOpacity>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                {error.includes('Settings') && (
                  <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        Linking.openURL('app-settings:');
                      }
                    }}
                  >
                    <Text style={styles.settingsButtonText}>Open Settings</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {permissionsGranted && (
          <>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={loadTodayData}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>
                {loading ? 'Loading...' : '🔄 Refresh'}
              </Text>
            </TouchableOpacity>

            {loading && !healthData && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading health data...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {healthData && (
              <View style={styles.dataContainer}>
                <Text style={styles.dateText}>{formatDate(healthData.date)}</Text>

                {/* Steps */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Steps</Text>
                  <Text style={styles.cardValue}>{healthData.steps.total.toLocaleString()}</Text>
                  <Text style={styles.cardSubtext}>Today</Text>
                </View>

                {/* Macros */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Nutrition</Text>
                  <View style={styles.macroRow}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Calories</Text>
                      <Text style={styles.macroValue}>{healthData.macros.calories}</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroValue}>{healthData.macros.protein}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroValue}>{healthData.macros.carbs}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Fats</Text>
                      <Text style={styles.macroValue}>{healthData.macros.fats}g</Text>
                    </View>
                  </View>
                </View>

                {/* Energy */}
                {healthData.energy && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Energy</Text>
                    <View style={styles.macroRow}>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Active</Text>
                        <Text style={styles.macroValue}>{healthData.energy.active} cal</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Resting</Text>
                        <Text style={styles.macroValue}>{healthData.energy.basal} cal</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Total</Text>
                        <Text style={styles.macroValue}>{healthData.energy.total} cal</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Activities */}
                {healthData.activities && healthData.activities.length > 0 && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Activities ({healthData.activities.length})</Text>
                    {healthData.activities.slice(0, 3).map((activity) => (
                      <View key={activity.id} style={styles.activityItem}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <Text style={styles.activityDetail}>
                          {Math.round(activity.duration / 60)} min • {activity.activeCalories} cal
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Water */}
                {healthData.water !== undefined && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Water</Text>
                    <Text style={styles.cardValue}>{healthData.water.toFixed(1)} L</Text>
                  </View>
                )}

                {/* Sleep */}
                {healthData.sleep && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Sleep</Text>
                    <Text style={styles.cardValue}>
                      {Math.round(healthData.sleep.duration / 60)}h {healthData.sleep.duration % 60}m
                    </Text>
                    <Text style={styles.cardSubtext}>In bed: {Math.round(healthData.sleep.inBed / 60)}h {healthData.sleep.inBed % 60}m</Text>
                  </View>
                )}

                {/* Heart Rate */}
                {healthData.heartRate && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Heart Rate</Text>
                    <View style={styles.macroRow}>
                      {healthData.heartRate.average && (
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>Avg</Text>
                          <Text style={styles.macroValue}>{healthData.heartRate.average} bpm</Text>
                        </View>
                      )}
                      {healthData.heartRate.resting && (
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>Resting</Text>
                          <Text style={styles.macroValue}>{healthData.heartRate.resting} bpm</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {healthData.macros.calories === 0 && 
                 healthData.steps.total === 0 && 
                 (!healthData.activities || healthData.activities.length === 0) && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No health data found for today. Make sure you have:
                    </Text>
                    <Text style={styles.emptyBullet}>• Steps recorded in Health app</Text>
                    <Text style={styles.emptyBullet}>• Nutrition data logged (if using nutrition tracking)</Text>
                    <Text style={styles.emptyBullet}>• Activities/workouts recorded</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ModenApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9a9a9a',
  },
  permissionContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  permissionText: {
    fontSize: 16,
    color: '#e4e4e4',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  refreshButton: {
    backgroundColor: '#111',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#242424',
  },
  refreshButtonText: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#b5b5b5',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    lineHeight: 20,
  },
  dataContainer: {
    gap: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eaeaea',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#9a9a9a',
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  macroItem: {
    flex: 1,
    minWidth: '45%',
  },
  macroLabel: {
    fontSize: 14,
    color: '#a9a9a9',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1c',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  activityDetail: {
    fontSize: 14,
    color: '#9a9a9a',
  },
  emptyContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  emptyText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 12,
    lineHeight: 24,
  },
  emptyBullet: {
    fontSize: 14,
    color: '#9a9a9a',
    marginLeft: 12,
    marginBottom: 8,
    lineHeight: 20,
  },
  settingsButton: {
    marginTop: 16,
    backgroundColor: 'transparent',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
