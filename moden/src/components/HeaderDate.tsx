import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

export type HeaderDateProps = {
	label: string;
	onPrev?: () => void;
	onNext?: () => void;
};

export const HeaderDate: React.FC<HeaderDateProps> = ({ label, onPrev, onNext }) => {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
			<TouchableOpacity onPress={onPrev} accessibilityLabel="Previous day">
				<View style={{ width: 24, height: 24, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: theme.colors.textSecondary, transform: [{ rotate: '45deg' }] }} />
			</TouchableOpacity>
			<Text style={{ color: theme.colors.textPrimary, fontSize: 16 }}>{label}</Text>
			<TouchableOpacity onPress={onNext} accessibilityLabel="Next day">
				<View style={{ width: 24, height: 24, borderRightWidth: 2, borderTopWidth: 2, borderColor: theme.colors.textSecondary, transform: [{ rotate: '45deg' }] }} />
			</TouchableOpacity>
		</View>
	);
};
