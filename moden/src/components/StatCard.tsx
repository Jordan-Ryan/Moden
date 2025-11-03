import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme/theme';

export type StatCardProps = {
	title: string;
	value: string;
	subtitle?: string;
	right?: React.ReactNode;
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, right }) => {
	return (
		<View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
			<View style={{ flex: 1 }}>
				<Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>{title}</Text>
				<Text style={{ color: theme.colors.textPrimary, fontSize: 20 }}>{value}</Text>
				{subtitle ? <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>{subtitle}</Text> : null}
			</View>
			{right ? <View>{right}</View> : null}
		</View>
	);
};
