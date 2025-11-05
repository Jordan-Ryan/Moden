import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type DonutRingProps = {
  size?: number;
  stroke?: number;
  value: number; // consumed
  goal: number; // target
  color: string;
  label: string; // e.g., Protein
  targetLabel?: string; // e.g., 172g
  diffLabel?: string; // e.g., 10g over / left
  diffColor?: string;
};

export default function DonutRing({
  size = 106,
  stroke = 12,
  value,
  goal,
  color,
  label,
  targetLabel,
  diffLabel,
  diffColor,
}: DonutRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = goal > 0 ? value / goal : 0;
  const baseProgress = Math.max(0, Math.min(1, ratio));
  const dashOffset = circumference * (1 - baseProgress);

  const overflowRatio = Math.max(0, ratio - 1);
  const overflowRadius = radius + stroke * 0.25;
  const overflowCircumference = 2 * Math.PI * overflowRadius;
  const overflowArc = Math.min(overflowRatio, 0.4);
  const overflowDasharray = `${overflowCircumference * overflowArc} ${overflowCircumference}`;
  const overflowDashOffset = overflowCircumference * (1 - overflowArc);

  const toAlpha = (hex: string, alphaHex: string) => {
    if (!hex.startsWith('#') || hex.length !== 7) return hex;
    return `${hex}${alphaHex}`;
  };

  const valueColor = color;
  const labelColor = '#cfcfcf';
  const targetColor = '#7d7d7d';
  const trackColor = toAlpha(color, '33');
  const progressColor = color;
  const overflowColor = toAlpha(color, 'CC');

  return (
    <View style={[styles.container, { width: size }]}>
      <Svg height={size} width={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#101010" strokeWidth={stroke + 4} fill="#050505" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="transparent" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="transparent"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
        {overflowRatio > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={overflowRadius}
            stroke={overflowColor}
            strokeWidth={stroke * 0.55}
            strokeDasharray={overflowDasharray}
            strokeDashoffset={overflowDashOffset}
            strokeLinecap="round"
            fill="transparent"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>
      <View style={styles.centerContent}>
        <Text style={[styles.valueText, { color: valueColor }]}>{Math.round(value)}</Text>
        <Text style={[styles.centerLabel, { color: labelColor }]}>{label}</Text>
        {!!targetLabel && <Text style={[styles.centerTarget, { color: targetColor }]}>{targetLabel}</Text>}
      </View>
      {!!diffLabel && (
        <Text style={[styles.diffText, { color: diffColor ?? labelColor }]}>
          {diffLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -14 }],
  },
  valueText: { fontWeight: '700', fontSize: 18 },
  centerLabel: { fontSize: 9, marginTop: 2, fontWeight: '600' },
  centerTarget: { fontSize: 9, marginTop: 2 },
  diffText: { fontSize: 12, marginTop: 10, fontWeight: '600' },
});
