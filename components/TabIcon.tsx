import React from 'react';
import { SvgUri } from 'react-native-svg';
import { View } from 'react-native';
import { Asset } from 'expo-asset';

type IconName = 'today' | 'settings' | 'sleep' | 'food' | 'heart-rate' | 'hydration' | 'mindfulness' | 'activity';

const ICONS: Record<IconName, any> = {
  today: require('../assets/icons/today.svg'),
  settings: require('../assets/icons/settings.svg'),
  sleep: require('../assets/icons/sleep.svg'),
  food: require('../assets/icons/food.svg'),
  'heart-rate': require('../assets/icons/heart-rate.svg'),
  hydration: require('../assets/icons/hydration.svg'),
  mindfulness: require('../assets/icons/mindfulness.svg'),
  activity: require('../assets/icons/activity.svg'),
};

export default function TabIcon({ name, color, size = 22 }: { name: IconName; color: string; size?: number }) {
  const source = ICONS[name];
  const asset = Asset.fromModule(source);
  return (
    <View style={{ width: size, height: size }}>
      <SvgUri width={size} height={size} color={color} fill={color} uri={asset.uri} />
    </View>
  );
}
