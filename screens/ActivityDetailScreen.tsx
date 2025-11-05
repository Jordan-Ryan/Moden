import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import ActivityIcon from '../components/ActivityIcon';
import GlassCard from '../components/GlassCard';
import { Activity, isHealthKitAvailable } from '../utils/healthKit';
import Svg, { Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { ActivityStackParamList } from '../navigation/ActivityStack';
import AppleHealthKit, { HealthInputOptions, HealthValue } from 'react-native-health';

type ActivityDetailRoute = RouteProp<ActivityStackParamList, 'ActivityDetail'>;

// Format duration in seconds to MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format time range
const formatTimeRange = (startTime: string, duration: number): string => {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 1000);
  const startStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const endStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${startStr}-${endStr}`;
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
};

// Format distance
const formatDistance = (meters: number | undefined): string => {
  if (!meters) return '0.00KM';
  const km = meters / 1000;
  return `${km.toFixed(2)}KM`;
};

// Format pace (seconds per km to MM'SS"/KM)
// Use proper rounding to avoid precision issues
const formatPace = (secondsPerKm: number | undefined): string => {
  if (!secondsPerKm) return '--\'--"/KM';
  // Round to nearest second to avoid precision issues
  const roundedSeconds = Math.round(secondsPerKm);
  const mins = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  return `${mins}'${secs.toString().padStart(2, '0')}"/KM`;
};

// Format elevation
const formatElevation = (meters: number | undefined): string => {
  if (!meters) return '0M';
  return `${Math.round(meters)}M`;
};

// Format cadence
const formatCadence = (spm: number | undefined): string => {
  if (!spm) return '--SPM';
  return `${Math.round(spm)}SPM`;
};

// Format power
const formatPower = (watts: number | undefined): string => {
  if (!watts) return '--W';
  return `${Math.round(watts)}W`;
};

// Calculate effort rating (1-10 scale based on heart rate percentage of max)
// Apple Fitness primarily uses heart rate zones for effort calculation
const calculateEffort = (activity: Activity, avgHeartRate?: number): { rating: number; label: string } => {
  const hr = avgHeartRate || activity.avgHeartRate || activity.maxHeartRate || 0;
  const maxHR = activity.maxHeartRate || 0;
  
  // If no heart rate data, return minimum effort
  if (hr === 0) {
    return { rating: 1, label: 'Easy' };
  }
  
  // Estimate max heart rate if not available
  // Use the higher of: maxHR from workout, or estimate based on avg HR
  // If avg HR is very high (>180), likely max is higher
  let estimatedMaxHR = maxHR;
  if (!estimatedMaxHR || estimatedMaxHR < hr) {
    // If no max HR, estimate: if avg HR is high, max is likely higher
    estimatedMaxHR = hr > 180 ? hr + 20 : hr > 160 ? hr + 30 : 200;
  }
  
  // Calculate heart rate as percentage of max
  // This is the primary factor for effort in Apple Fitness
  const hrPercentage = hr / estimatedMaxHR;
  
  // Map HR percentage to effort rating (1-10 scale)
  // Apple Fitness zones:
  // 50-60% HR = Easy (1-3)
  // 60-70% HR = Moderate (4-5)
  // 70-85% HR = Hard (6-7)
  // 85-100% HR = Very Hard (8-10)
  let rating: number;
  if (hrPercentage < 0.50) {
    rating = 1;
  } else if (hrPercentage < 0.60) {
    rating = Math.round(1 + (hrPercentage - 0.50) / 0.10 * 2); // 1-3
  } else if (hrPercentage < 0.70) {
    rating = Math.round(3 + (hrPercentage - 0.60) / 0.10 * 2); // 4-5
  } else if (hrPercentage < 0.85) {
    rating = Math.round(5 + (hrPercentage - 0.70) / 0.15 * 2); // 6-7
  } else {
    rating = Math.round(7 + (hrPercentage - 0.85) / 0.15 * 3); // 8-10
  }
  
  // Ensure rating is between 1-10
  rating = Math.max(1, Math.min(10, rating));
  
  // Map to labels matching Apple Fitness app
  let label = 'Easy';
  if (rating <= 3) label = 'Easy';
  else if (rating <= 5) label = 'Moderate';
  else if (rating <= 7) label = 'Hard';
  else label = 'Very Hard';
  
  return { rating, label };
};

// Heart rate graph component using real data
interface HeartRateDataPoint {
  timestamp: Date;
  value: number;
}

const HeartRateGraph: React.FC<{ 
  data: HeartRateDataPoint[];
  startTime: Date;
  endTime: Date;
  avgHeartRate?: number;
}> = ({
  data,
  startTime,
  endTime,
  avgHeartRate,
}) => {
  const { width } = Dimensions.get('window');
  const chartWidth = width - 32 - 16; // padding + margins
  const chartHeight = 120;
  const padding = 16;
  
  if (!data || data.length === 0) {
    return (
      <View style={styles.graphContainer}>
        <Text style={styles.noDataText}>No heart rate data available</Text>
      </View>
    );
  }
  
  // Resample/smooth the data to reduce noise and improve visualization
  // Group data points into time bins and average values within each bin
  const maxPoints = 50; // Maximum number of points to display
  const binCount = Math.min(maxPoints, data.length);
  const bins: { values: number[]; timestamp: Date }[] = Array.from({ length: binCount }, () => ({ values: [], timestamp: new Date(0) }));
  
  const totalDuration = endTime.getTime() - startTime.getTime();
  
  data.forEach((point) => {
    const timeOffset = point.timestamp.getTime() - startTime.getTime();
    const binIndex = Math.min(
      Math.floor((timeOffset / totalDuration) * binCount),
      binCount - 1
    );
    bins[binIndex].values.push(point.value);
    if (!bins[binIndex].timestamp.getTime() || point.timestamp < bins[binIndex].timestamp) {
      bins[binIndex].timestamp = point.timestamp;
    }
  });
  
  // Calculate average for each bin and filter out empty bins
  const smoothedData = bins
    .map((bin, index) => {
      if (bin.values.length === 0) return null;
      const avg = bin.values.reduce((sum, val) => sum + val, 0) / bin.values.length;
      return {
        value: Math.round(avg),
        timestamp: bin.timestamp,
        index,
      };
    })
    .filter((point): point is { value: number; timestamp: Date; index: number } => point !== null);
  
  if (smoothedData.length === 0) {
    return (
      <View style={styles.graphContainer}>
        <Text style={styles.noDataText}>No heart rate data available</Text>
      </View>
    );
  }
  
  const values = smoothedData.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  
  const points = smoothedData.map((point, index) => {
    const x = (index / (smoothedData.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - ((point.value - min) / range) * (chartHeight - padding * 2) - padding;
    return { x, y, value: point.value, timestamp: point.timestamp };
  });
  
  // Generate time labels (start, middle, end)
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const midTime = new Date((startTime.getTime() + endTime.getTime()) / 2);
  const timeLabels = [formatTime(startTime), formatTime(midTime), formatTime(endTime)];
  
  return (
    <View style={styles.graphContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Background line */}
        <Line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#1f1f1f"
          strokeWidth={1}
        />
        
        {/* Heart rate line */}
        {points.map((point, index) => {
          if (index === 0) return null;
          const prev = points[index - 1];
          return (
            <Line
              key={`line-${index}`}
              x1={prev.x}
              y1={prev.y}
              x2={point.x}
              y2={point.y}
              stroke="#ff6b6b"
              strokeWidth={2}
            />
          );
        })}
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="#ff6b6b"
          />
        ))}
        
        {/* Y-axis labels */}
        <SvgText
          x={chartWidth - 8}
          y={padding + 4}
          fontSize={11}
          fill="#9a9a9a"
          textAnchor="end"
        >
          {Math.round(max)}
        </SvgText>
        <SvgText
          x={chartWidth - 8}
          y={chartHeight - padding + 4}
          fontSize={11}
          fill="#9a9a9a"
          textAnchor="end"
        >
          {Math.round(min)}
        </SvgText>
        
        {/* X-axis labels */}
        {timeLabels.map((label, index) => {
          const x = padding + (index / (timeLabels.length - 1)) * (chartWidth - padding * 2);
          return (
            <SvgText
              key={`label-${index}`}
              x={x}
              y={chartHeight - padding + 16}
              fontSize={11}
              fill="#9a9a9a"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
      {avgHeartRate && (
        <Text style={styles.heartRateAvg}>
          {Math.round(avgHeartRate)} BPM AVG
        </Text>
      )}
    </View>
  );
};

// Metric card component
const MetricCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

export default function ActivityDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ActivityDetailRoute>();
  const { activity } = route.params;
  
  const [heartRateData, setHeartRateData] = useState<HeartRateDataPoint[]>([]);
  const [loadingHeartRate, setLoadingHeartRate] = useState(false);
  const [calculatedAvgHeartRate, setCalculatedAvgHeartRate] = useState<number | undefined>(undefined);
  
  // Use calculated avg heart rate if activity doesn't have it
  const displayAvgHeartRate = activity.avgHeartRate || calculatedAvgHeartRate;

  const effort = calculateEffort(activity, displayAvgHeartRate);
  const startDate = new Date(activity.startTime);
  const endDate = new Date(startDate.getTime() + activity.duration * 1000);

  // Log all HealthKit data when entering the details page
  useEffect(() => {
    console.log('\n========================================');
    console.log('=== ACTIVITY DETAIL SCREEN - FULL HEALTHKIT DATA ===');
    console.log('========================================\n');
    
    // Log all activity data we have
    console.log('📊 ACTIVITY DATA (from our Activity object):');
    console.log(JSON.stringify(activity, null, 2));
    console.log('\n');
    
    // Try to fetch the original workout from HealthKit to see all raw data
    if (isHealthKitAvailable()) {
      // Use a wider date range (entire day) to ensure we catch the workout
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(startDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const options: HealthInputOptions = {
        startDate: dayStart.toISOString(),
        endDate: dayEnd.toISOString(),
      };
      
      AppleHealthKit.getAnchoredWorkouts(
        options,
        (err: Object, results: any) => {
          if (err) {
            console.log('❌ Error fetching workouts from HealthKit:', err);
            return;
          }
          
          if (results && results.data && results.data.length > 0) {
            console.log(`📋 Found ${results.data.length} workouts in date range`);
            
            // Try to match by ID first
            let matchingWorkout = results.data.find((workout: any) => workout.id === activity.id);
            
            // If not found by ID, try to match by start time and duration
            if (!matchingWorkout) {
              matchingWorkout = results.data.find((workout: any) => {
                const workoutStart = new Date(workout.start);
                const workoutDuration = workout.duration;
                
                // Match by start time and duration (within 1 second tolerance)
                const timeDiff = Math.abs(workoutStart.getTime() - startDate.getTime());
                const durationDiff = Math.abs(workoutDuration - activity.duration);
                
                return timeDiff < 1000 && durationDiff < 1;
              });
            }
            
            if (matchingWorkout) {
              console.log('✅ FOUND MATCHING WORKOUT IN HEALTHKIT');
              console.log(`  Workout ID: ${matchingWorkout.id}`);
              console.log(`  Workout start: ${matchingWorkout.start}`);
              console.log(`  Workout duration: ${matchingWorkout.duration}s`);
              console.log('\n📦 RAW WORKOUT OBJECT (all properties):');
              console.log(JSON.stringify(matchingWorkout, null, 2));
              console.log('\n');
              
              // Log all workout properties
              console.log('📋 WORKOUT PROPERTIES:');
              const workoutAny = matchingWorkout as any;
              Object.keys(workoutAny).forEach(key => {
                const value = workoutAny[key];
                if (typeof value !== 'object' || value === null) {
                  console.log(`  ${key}:`, value);
                } else if (Array.isArray(value)) {
                  console.log(`  ${key}: [Array of length ${value.length}]`);
                } else {
                  console.log(`  ${key}: [Object]`);
                }
              });
              console.log('\n');
              
              // Log metadata separately with detailed breakdown
              if (matchingWorkout.metadata) {
                console.log('🏷️  WORKOUT METADATA (all key-value pairs):');
                Object.entries(matchingWorkout.metadata).forEach(([key, value]) => {
                  console.log(`  ${key}:`, value, `(type: ${typeof value})`);
                });
                console.log('\n');
              }
              
              // Log statistics if available
              if (workoutAny.statistics) {
                console.log('📈 WORKOUT STATISTICS:');
                console.log(JSON.stringify(workoutAny.statistics, null, 2));
                console.log('\n');
              }
              
              // Log events if available
              if (workoutAny.events) {
                console.log('📅 WORKOUT EVENTS:');
                console.log(JSON.stringify(workoutAny.events, null, 2));
                console.log('\n');
              }
              
              // Log alternative property names
              if (workoutAny.workoutStatistics) {
                console.log('📊 WORKOUT STATISTICS (alt):');
                console.log(JSON.stringify(workoutAny.workoutStatistics, null, 2));
                console.log('\n');
              }
              
              if (workoutAny.workoutEvents) {
                console.log('📅 WORKOUT EVENTS (alt):');
                console.log(JSON.stringify(workoutAny.workoutEvents, null, 2));
                console.log('\n');
              }
              
              
            } else {
              console.log('⚠️  No matching workout found in HealthKit results');
              console.log(`  Looking for workout ID: ${activity.id}`);
              console.log(`  Looking for workout starting at: ${startDate.toISOString()}`);
              console.log(`  With duration: ${activity.duration} seconds`);
              console.log(`  Found ${results.data.length} workouts in time range:`);
              results.data.forEach((w: any, idx: number) => {
                const wStart = new Date(w.start);
                const timeDiff = Math.abs(wStart.getTime() - startDate.getTime());
                console.log(`    [${idx}] ID: ${w.id || 'N/A'}, Start: ${w.start}, Duration: ${w.duration}s, Activity: ${w.activityName || w.activityId}`);
                console.log(`        Time diff: ${timeDiff}ms, Duration diff: ${Math.abs(w.duration - activity.duration)}s`);
              });
            }
          } else {
            console.log('⚠️  No workouts returned from HealthKit');
            console.log(`  Query range: ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);
          }
          
          console.log('\n========================================');
          console.log('=== END HEALTHKIT DATA LOG ===');
          console.log('========================================\n');
        }
      );
    } else {
      console.log('⚠️  HealthKit not available on this device');
    }
  }, [activity]); // Only run once when activity changes
  
  // Fetch heart rate samples for the workout period
  // This will calculate avgHeartRate if not already available in activity data
  useEffect(() => {
    const fetchHeartRateData = async () => {
      if (!isHealthKitAvailable()) {
        return;
      }
      
      try {
        setLoadingHeartRate(true);
        const options: HealthInputOptions = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
        
        await new Promise<void>((resolve, reject) => {
          AppleHealthKit.getHeartRateSamples(
            options,
            (err: Object, results: HealthValue[]) => {
              if (err) {
                console.warn('Error fetching heart rate samples:', err);
                resolve();
                return;
              }
              
              const samples: HeartRateDataPoint[] = results.map((sample: HealthValue) => ({
                timestamp: new Date(sample.startDate),
                value: typeof sample.value === 'number' ? sample.value : parseFloat(String(sample.value)),
              })).filter(sample => !isNaN(sample.value));
              
              setHeartRateData(samples);
              
              // Calculate average heart rate from samples if not already in activity
              if (samples.length > 0 && !activity.avgHeartRate) {
                const avg = samples.reduce((sum, sample) => sum + sample.value, 0) / samples.length;
                setCalculatedAvgHeartRate(Math.round(avg));
              }
              
              resolve();
            }
          );
        });
      } catch (error) {
        console.error('Error fetching heart rate data:', error);
      } finally {
        setLoadingHeartRate(false);
      }
    };
    
    fetchHeartRateData();
  }, [activity.startTime, activity.duration]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          {Platform.OS === 'ios' ? (
            <SymbolView
              name="chevron.left"
              style={{ width: 20, height: 20 }}
              tintColor="#ffffff"
              weight="semibold"
              scale="medium"
            />
          ) : (
            <Text style={styles.backButtonText}>←</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.headerDate}>{formatDate(activity.startTime)}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Activity Summary */}
        <View style={styles.activitySummary}>
          <ActivityIcon activity={activity} size={64} />
          <View style={styles.activityInfo}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityTime}>{formatTimeRange(activity.startTime, activity.duration)}</Text>
          </View>
        </View>

        {/* Workout Details */}
        <GlassCard style={styles.workoutDetails} interactive>
          <TouchableOpacity style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            <SymbolView
              name="chevron.right"
              style={{ width: 16, height: 16 }}
              tintColor="#ffffff"
              weight="regular"
              scale="small"
            />
          </TouchableOpacity>
          
          <View style={styles.metricsGrid}>
            <MetricCard label="Workout Time" value={formatDuration(activity.duration)} color="#FFD700" />
            {activity.distance && (
              <MetricCard label="Distance" value={formatDistance(activity.distance)} color="#4b8af0" />
            )}
            <MetricCard label="Active Kilocalories" value={`${activity.activeCalories}KCAL`} color="#ff6b6b" />
            {activity.elevationGain && (
              <MetricCard label="Elevation Gain" value={formatElevation(activity.elevationGain)} color="#30D158" />
            )}
            {activity.avgPower && (
              <MetricCard label="Avg Power" value={formatPower(activity.avgPower)} color="#30D158" />
            )}
            {activity.avgCadence && (
              <MetricCard label="Avg Cadence" value={formatCadence(activity.avgCadence)} color="#4b8af0" />
            )}
            {activity.avgPace && (
              <MetricCard label="Avg Pace" value={formatPace(activity.avgPace)} color="#4b8af0" />
            )}
            {displayAvgHeartRate && (
              <MetricCard label="Avg Heart Rate" value={`${Math.round(displayAvgHeartRate)}BPM`} color="#ff6b6b" />
            )}
          </View>
        </GlassCard>

        {/* Effort */}
        <GlassCard style={styles.effortCard} interactive>
          <View style={styles.effortRow}>
            <View style={styles.effortLeft}>
              <Text style={styles.effortLabel}>Effort</Text>
              <SymbolView
                name="arrow.up.arrow.down"
                style={{ width: 12, height: 12, marginLeft: 4 }}
                tintColor="#ffffff"
                weight="regular"
                scale="small"
              />
            </View>
            <View style={styles.effortRight}>
              <View style={[styles.effortBadge, { backgroundColor: '#9b59b6' }]}>
                <Text style={styles.effortRating}>{effort.rating}</Text>
              </View>
              <Text style={[styles.effortLabel, { color: '#9b59b6', marginLeft: 8 }]}>{effort.label}</Text>
              <SymbolView
                name="chart.bar"
                style={{ width: 16, height: 16, marginLeft: 8 }}
                tintColor="#9b59b6"
                weight="regular"
                scale="small"
              />
            </View>
          </View>
        </GlassCard>

        {/* Note: Laps and Splits are not directly available from HealthKit API */}
        {/* These would need to be extracted from workout events or calculated from distance segments */}

        {/* Heart Rate */}
        {displayAvgHeartRate && (
          <GlassCard style={styles.heartRateCard} interactive>
            <TouchableOpacity style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Heart Rate</Text>
              <SymbolView
                name="chevron.right"
                style={{ width: 16, height: 16 }}
                tintColor="#ffffff"
                weight="regular"
                scale="small"
              />
            </TouchableOpacity>
            
            {loadingHeartRate ? (
              <View style={styles.graphContainer}>
                <Text style={styles.noDataText}>Loading heart rate data...</Text>
              </View>
            ) : (
              <HeartRateGraph
                data={heartRateData}
                startTime={startDate}
                endTime={endDate}
                avgHeartRate={displayAvgHeartRate}
              />
            )}
          </GlassCard>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  headerDate: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  activitySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  activityName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityTime: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
  workoutDetails: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  effortCard: {
    marginBottom: 16,
  },
  effortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  effortLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  effortRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  effortLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  effortBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effortRating: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  lapsCard: {
    marginBottom: 16,
  },
  splitsCard: {
    marginBottom: 16,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1c',
  },
  tableRowNumber: {
    width: 24,
    color: '#9a9a9a',
    fontSize: 14,
    marginRight: 8,
  },
  tableRowValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  heartRateCard: {
    marginBottom: 16,
  },
  graphContainer: {
    marginTop: 8,
  },
  heartRateAvg: {
    color: '#9a9a9a',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  noDataText: {
    color: '#9a9a9a',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
