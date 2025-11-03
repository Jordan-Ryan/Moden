import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export type RingProgressProps = {
	size: number;
	strokeWidth: number;
	value: number; // 0..1
	trackColor: string;
	progressColor: string;
	children?: React.ReactNode;
};

export const RingProgress: React.FC<RingProgressProps> = ({
	size,
	strokeWidth,
	value,
	trackColor,
	progressColor,
	children,
}) => {
	const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
	const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
	const clamped = Math.max(0, Math.min(1, isFinite(value) ? value : 0));
	const offset = circumference * (1 - clamped);

	return (
		<View style={{ width: size, height: size }}>
			<Svg width={size} height={size}>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={trackColor}
					strokeWidth={strokeWidth}
					opacity={0.3}
					fill="none"
				/>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={progressColor}
					strokeWidth={strokeWidth}
					strokeDasharray={`${circumference} ${circumference}`}
					strokeDashoffset={offset}
					strokeLinecap="round"
					fill="none"
					rotation={-90}
					originX={size / 2}
					originY={size / 2}
				/>
			</Svg>
			<View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
				{children}
			</View>
		</View>
	);
};
