import React from 'react';
import { VictoryChart, VictoryLine, VictoryArea, VictoryTheme } from 'victory-native';
import { theme } from '../theme/theme';

export type MiniLineChartProps = {
	data: number[];
	width?: number;
	height?: number;
	variant?: 'line' | 'area';
};

export const MiniLineChart: React.FC<MiniLineChartProps> = ({ data, width = 140, height = 60, variant = 'line' }) => {
	const points = data.map((y, x) => ({ x, y }));
	return (
		<VictoryChart
			theme={VictoryTheme.material}
			padding={{ top: 8, bottom: 8, left: 8, right: 8 }}
			domainPadding={2}
			height={height}
			width={width}
		>
			{variant === 'area' ? (
				<VictoryArea
					style={{ data: { stroke: theme.colors.accent, fill: theme.colors.accent, fillOpacity: 0.15 } }}
					data={points}
				/>
			) : (
				<VictoryLine style={{ data: { stroke: theme.colors.accent } }} data={points} />
			)}
		</VictoryChart>
	);
};
