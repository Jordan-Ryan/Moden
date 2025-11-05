import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from './GlassCard';

const DEFAULT_ACTIVE = '#ffffff';
const DEFAULT_INACTIVE = '#8f8f8f';

const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const safeBottom = Math.max(insets.bottom - 6, 0);
  const mainRoutes =
    state.routes.length > 1 ? state.routes.slice(0, state.routes.length - 1) : state.routes;
  const trailingRoute =
    state.routes.length > 1 ? state.routes[state.routes.length - 1] : undefined;

  const renderTab = (
    route: typeof state.routes[number],
    index: number,
    shape: 'pill' | 'circle'
  ) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.indexOf(route);
    const activeColor = options.tabBarActiveTintColor ?? DEFAULT_ACTIVE;
    const inactiveColor = options.tabBarInactiveTintColor ?? DEFAULT_INACTIVE;
    const color = isFocused ? activeColor : inactiveColor;
    const labelFromOptions = options.tabBarLabel ?? options.title ?? route.name;
    const label =
      typeof labelFromOptions === 'string'
        ? labelFromOptions
        : labelFromOptions({ focused: isFocused, color, position: 'below-icon' });
    const icon = options.tabBarIcon
      ? options.tabBarIcon({ focused: isFocused, color, size: shape === 'circle' ? 22 : 18 })
      : null;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    if (shape === 'circle') {
      return (
        <GlassCard
          key={route.key}
          interactive
          effect="clear"
          tintColor="rgba(16,16,16,0.55)"
          colorScheme="dark"
          style={[
            styles.trailingGlass,
            isFocused && styles.trailingGlassActive,
          ]}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.trailingTouchable}
            activeOpacity={0.8}
          >
            {icon}
          </TouchableOpacity>
        </GlassCard>
      );
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.mainTabButton, isFocused && styles.mainTabButtonActive]}
        activeOpacity={0.8}
      >
        <View style={styles.mainTabContent}>
          <View style={styles.mainTabIcon}>{icon}</View>
          <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.outer, { paddingBottom: safeBottom + 8 }]}>
      <View style={styles.barRow}>
        <GlassCard
          interactive
          effect="clear"
          tintColor="rgba(16,16,16,0.45)"
          colorScheme="dark"
          style={styles.mainGlass}
        >
          <View style={styles.mainRow}>
            {mainRoutes.map((route, idx) => renderTab(route, idx, 'pill'))}
          </View>
        </GlassCard>
        {trailingRoute && renderTab(trailingRoute, state.routes.length - 1, 'circle')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  mainGlass: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 28,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  mainTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: 'transparent',
    minWidth: 60,
  },
  mainTabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  mainTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingGlass: {
    padding: 8,
    borderRadius: 28,
    minWidth: 52,
  },
  trailingGlassActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  trailingTouchable: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassTabBar;
