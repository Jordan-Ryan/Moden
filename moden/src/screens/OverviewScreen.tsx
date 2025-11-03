import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { HeaderDate } from '../components/HeaderDate';
import { RingProgress } from '../components/RingProgress';
import { MiniLineChart } from '../components/MiniLineChart';
import { StatCard } from '../components/StatCard';
import { ActivityListItem } from '../components/ActivityListItem';
import { overviewMock } from '../data/mock/overview';
import { formatMinutes, formatPercent } from '../utils/format';

export const OverviewScreen: React.FC = () => {
	const { date, recovery, sleep, strain, activities, trends } = overviewMock;

	return (
		<ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
			<HeaderDate label={new Date(date).toDateString()} />

			{/* Hero rings */}
			<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<View style={{ alignItems: 'center', flex: 1 }}>
					<RingProgress size={120} strokeWidth={12} value={recovery.score} trackColor={theme.colors.surface2} progressColor={theme.colors.success}>
						<Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>{formatPercent(recovery.score)}</Text>
						<Text style={{ color: theme.colors.textMuted }}>Recovery</Text>
					</RingProgress>
				</View>
				<View style={{ alignItems: 'center', flex: 1 }}>
					<RingProgress size={120} strokeWidth={12} value={Math.min(strain.score / 21, 1)} trackColor={theme.colors.surface2} progressColor={theme.colors.accent}>
						<Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>{strain.score.toFixed(1)}</Text>
						<Text style={{ color: theme.colors.textMuted }}>Strain</Text>
					</RingProgress>
				</View>
				<View style={{ alignItems: 'center', flex: 1 }}>
					<RingProgress size={120} strokeWidth={12} value={sleep.durationMin / sleep.targetMin} trackColor={theme.colors.surface2} progressColor={theme.colors.accent}>
						<Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>{formatMinutes(sleep.durationMin)}</Text>
						<Text style={{ color: theme.colors.textMuted }}>Sleep</Text>
					</RingProgress>
				</View>
			</View>

			{/* Trends mini-card */}
			<View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.lg }}>
				<Text style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>HRV vs RHR</Text>
				<MiniLineChart data={trends.hrv} />
			</View>

			{/* Activities */}
			<View style={{ gap: theme.spacing.md }}>
				<Text style={{ color: theme.colors.textSecondary }}>Activities</Text>
				{activities.map(a => (
					<ActivityListItem key={a.id} title={a.type} durationMin={a.durationMin} start={a.start} end={a.end} />
				))}
			</View>

			{/* Key stats */}
			<View style={{ gap: theme.spacing.md }}>
				<Text style={{ color: theme.colors.textSecondary }}>Key Statistics</Text>
				<StatCard title="HRV" value={`${recovery.hrv}`}
					right={<MiniLineChart data={trends.hrv} width={120} height={50} />} />
				<StatCard title="Sleep Performance" value={formatPercent(sleep.durationMin / sleep.targetMin)}
					right={<MiniLineChart data={trends.stress} width={120} height={50} variant="area" />} />
				<StatCard title="Calories" value={`3,745`}
					right={<MiniLineChart data={[2,3,2,4,3,5,4]} width={120} height={50} />} />
			</View>
		</ScrollView>
	);
};
