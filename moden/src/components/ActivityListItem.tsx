import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme/theme';
import { formatMinutes } from '../utils/format';

export type ActivityListItemProps = {
	icon?: React.ReactNode;
	title: string;
	durationMin: number;
	start: string;
	end: string;
};

export const ActivityListItem: React.FC<ActivityListItemProps> = ({ icon, title, durationMin, start, end }) => {
	return (
		<View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
			<View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.surface2, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.lg }}>
				{icon}
			</View>
			<View style={{ flex: 1 }}>
				<Text style={{ color: theme.colors.textPrimary }}>{title}</Text>
				<Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>{start} – {end}</Text>
			</View>
			<Text style={{ color: theme.colors.textSecondary }}>{formatMinutes(durationMin)}</Text>
		</View>
	);
};
