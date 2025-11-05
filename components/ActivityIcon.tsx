import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { Activity, mapHealthKitWorkoutTypeToSFSymbol } from '../utils/healthKit';

type ActivityIconName = 'running' | 'cycling' | 'hiit' | 'walking' | 'strength' | 'rowing' | 'football' | 'workout';

// Icons8 SF Symbols-style icons (download from https://icons8.com/icons/all--os-ios--style-sf-regular)
// Place downloaded SVG files in assets/icons/activity/ folder
const ACTIVITY_ICONS: Record<ActivityIconName, any> = {
  running: require('../assets/icons/activity/running.svg'),
  cycling: require('../assets/icons/activity/cycling.svg'),
  hiit: require('../assets/icons/activity/hiit.svg'),
  walking: require('../assets/icons/activity/walking.svg'),
  strength: require('../assets/icons/activity/strength.svg'),
  rowing: require('../assets/icons/activity/rowing.svg'),
  football: require('../assets/icons/activity/football.svg'),
  workout: require('../assets/icons/activity/workout.svg'),
};

// iOS Health app color scheme for activity icons
const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  running: '#30D158',      // Green (matches iOS running)
  cycling: '#007AFF',      // Blue (matches iOS cycling)
  hiit: '#FF9F0A',         // Orange (matches iOS HIIT)
  walking: '#5E5CE6',      // Purple (matches iOS walking)
  strength: '#FF453A',     // Red (matches iOS strength)
  rowing: '#0A84FF',       // Bright blue
  football: '#34C759',     // Apple green
  other: '#8E8E93',        // Gray (matches iOS other)
};

/**
 * Get the icon name for an activity type
 */
const getIconName = (type: Activity['type']): ActivityIconName => {
  const iconMap: Record<Activity['type'], ActivityIconName> = {
    running: 'running',
    cycling: 'cycling',
    hiit: 'hiit',
    walking: 'walking',
    strength: 'strength',
    rowing: 'rowing',
    football: 'football',
    other: 'workout',
  };
  return iconMap[type] || 'workout';
};

interface ActivityIconProps {
  activity: Activity;
  size?: number;
}

export default function ActivityIcon({ activity, size = 36 }: ActivityIconProps) {
  const iconName = getIconName(activity.type);
  const iconSource = ACTIVITY_ICONS[iconName];
  const backgroundColor = ACTIVITY_COLORS[activity.type];
  const iconSize = size * 0.6; // Icon size relative to circle
  const asset = Asset.fromModule(iconSource);

  // iOS: render real SF Symbols via expo-symbols
  if (Platform.OS === 'ios') {
    // Use the official SF Symbols mapping for HealthKit workout types
    // Prioritize raw HealthKit activity name/ID (like "Running", "HighIntensityIntervalTraining")
    // over formatted display names (like "Outdoor Run", "High-Intensity Interval Training")
    const rawHealthKitName = activity.healthKitActivityName;
    const rawHealthKitId = activity.healthKitActivityId;
    
    // Use raw HealthKit data if available, otherwise fall back to type
    const sfSymbolName = mapHealthKitWorkoutTypeToSFSymbol(
      rawHealthKitId || activity.type,
      rawHealthKitName
    );
    
    // Debug log for first activity to verify icon mapping
    if (Math.random() < 0.1) { // Log occasionally to avoid spam
      console.log('Activity icon mapping:', {
        activityType: activity.type,
        activityName: activity.name,
        healthKitActivityId: activity.healthKitActivityId,
        healthKitActivityName: activity.healthKitActivityName,
        sfSymbol: sfSymbolName,
      });
    }
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
        <SymbolView
          name={sfSymbolName}
          style={{ width: iconSize, height: iconSize }}
          tintColor="white"
          weight="semibold"
          scale="large"
          // Android/web fallback handled below, this path is iOS only
        />
      </View>
    );
  }

  // Android/Web fallback: use bundled SF-style SVGs
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <SvgUri width={iconSize} height={iconSize} color="#FFFFFF" fill="#FFFFFF" uri={asset.uri} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

