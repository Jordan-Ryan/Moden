import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme/theme';

export const PlaceholderScreen: React.FC = () => {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
			<Text style={{ color: theme.colors.textSecondary }}>Coming soon</Text>
		</View>
	);
};
