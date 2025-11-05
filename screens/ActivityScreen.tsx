import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import ActivityIcon from '../components/ActivityIcon';
import GlassCard from '../components/GlassCard';
import { getActivitiesForDateRange, Activity, isHealthKitAvailable } from '../utils/healthKit';
import { ActivityStackParamList } from '../navigation/ActivityStack';
import { StackNavigationProp } from '@react-navigation/stack';

type FilterType = 'all' | 'running' | 'cycling' | 'hiit' | 'strength' | 'walking' | 'rowing' | 'football' | 'other';

interface FilterOption {
  id: FilterType;
  label: string;
}

const FILTERS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'running', label: 'Running' },
  { id: 'cycling', label: 'Cycling' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'strength', label: 'Strength' },
  { id: 'walking', label: 'Walking' },
  { id: 'rowing', label: 'Rowing' },
  { id: 'football', label: 'Football' },
  { id: 'other', label: 'Other' },
];

interface GroupedActivity {
  month: string;
  year: number;
  activities: Activity[];
}

const formatMonthYear = (date: Date): { month: string; year: number } => {
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return { month, year };
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Check if within last 7 days
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Otherwise show date
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

const formatMetric = (activity: Activity): string => {
  // Show distance for activities that typically have distance (running, cycling, walking, rowing)
  // Check by category to catch all variants (indoor/outdoor, etc.)
  const distanceCategories = ['Running', 'Cycling', 'Walking', 'Rowing'];
  const distanceTypes = ['running', 'cycling', 'walking', 'rowing'];
  
  const shouldShowDistance = activity.distance && (
    distanceCategories.includes(activity.category) || 
    distanceTypes.includes(activity.type)
  );
  
  if (shouldShowDistance) {
    const km = activity.distance / 1000;
    return `${km.toFixed(2)}KM`;
  }
  
  // Otherwise show calories
  return `${activity.activeCalories}KCAL`;
};

type ActivityScreenNavigationProp = StackNavigationProp<ActivityStackParamList, 'ActivityList'>;

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ActivityScreenNavigationProp>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  const loadActivities = React.useCallback(async () => {
    if (!isHealthKitAvailable()) {
      setError('HealthKit is unavailable on this device.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch last 6 months of activities
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const fetchedActivities = await getActivitiesForDateRange(startDate, endDate);
      
      // Sort by date (most recent first)
      const sorted = fetchedActivities.sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });

      setActivities(sorted);
    } catch (e) {
      console.error('Failed to load activities', e);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadActivities();
    }, [loadActivities])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadActivities();
    } finally {
      setRefreshing(false);
    }
  }, [loadActivities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (selectedFilter === 'all') {
      return activities;
    }
    return activities.filter(activity => activity.type === selectedFilter);
  }, [activities, selectedFilter]);

  // Group activities by month
  const groupedActivities = useMemo(() => {
    const groups: Record<string, GroupedActivity> = {};

    filteredActivities.forEach(activity => {
      const date = new Date(activity.startTime);
      const { month, year } = formatMonthYear(date);
      const key = `${month} ${year}`;

      if (!groups[key]) {
        groups[key] = {
          month,
          year,
          activities: [],
        };
      }

      groups[key].activities.push(activity);
    });

    // Convert to array and sort by date (most recent first)
    return Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.activities[0].startTime);
      const dateB = new Date(b.activities[0].startTime);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredActivities]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterContainer, { paddingHorizontal: 16 }]}
        style={styles.filterScroll}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.id && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activities List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor="#4b8af0"
            colors={['#4b8af0']}
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && groupedActivities.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities found</Text>
            <Text style={styles.emptySubtext}>Your workouts will appear here</Text>
          </View>
        )}

        {groupedActivities.map((group) => (
          <View key={`${group.month}-${group.year}`} style={styles.monthSection}>
            <Text style={styles.monthHeader}>
              {group.month} {group.year}
            </Text>
            {group.activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                onPress={() => navigation.navigate('ActivityDetail', { activity })}
                activeOpacity={0.7}
              >
                <GlassCard style={styles.activityCard} interactive>
                  <View style={styles.activityRow}>
                    <ActivityIcon activity={activity} size={48} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityMetric}>{formatMetric(activity)}</Text>
                    </View>
                    <Text style={styles.activityDate}>{formatDate(activity.startTime)}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
    paddingVertical: 8,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  filterScroll: {
    marginBottom: 4,
    maxHeight: 24,
    height: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    height: 20,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: 12,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  filterButtonActive: {
    backgroundColor: '#30D158',
    borderColor: '#30D158',
  },
  filterButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 14,
  },
  filterButtonTextActive: {
    color: '#ffffff',
    lineHeight: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
    marginBottom: 12,
  },
  errorText: {
    color: '#ff6b6b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#9a9a9a',
    fontSize: 14,
  },
  monthSection: {
    marginBottom: 24,
  },
  monthHeader: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  activityCard: {
    marginBottom: 12,
    padding: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityMetric: {
    color: '#30D158',
    fontSize: 24,
    fontWeight: '700',
  },
  activityDate: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
