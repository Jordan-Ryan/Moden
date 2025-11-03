import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { OverviewScreen } from '../screens/OverviewScreen';
import { theme } from '../theme/theme';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

export function RootTabs() {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarActiveTintColor: theme.colors.accent,
				tabBarInactiveTintColor: theme.colors.textMuted,
				tabBarStyle: {
					backgroundColor: theme.colors.surface,
					borderTopColor: 'transparent',
					elevation: 0,
				},
			}}
		>
			<Tab.Screen name="Overview" component={OverviewScreen} options={{
				tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: color }} />,
			}} />
			<Tab.Screen name="Sleep" component={PlaceholderScreen} options={{
				tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: color }} />,
			}} />
			<Tab.Screen name="Recovery" component={PlaceholderScreen} options={{
				tabBarIcon: ({ color }) => <View style={{ width: 18, height: 18, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }] }} />,
			}} />
			<Tab.Screen name="Strain" component={PlaceholderScreen} options={{
				tabBarIcon: ({ color }) => <View style={{ width: 20, height: 2, backgroundColor: color }} />,
			}} />
			<Tab.Screen name="Settings" component={PlaceholderScreen} options={{
				tabBarIcon: ({ color }) => <View style={{ width: 16, height: 16, borderRadius: 2, backgroundColor: color, opacity: 0.6 }} />,
			}} />
		</Tab.Navigator>
	);
}
