import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText, ClipPath, Rect as SvgRect } from 'react-native-svg';

export type BarChartProps = {
  values: number[];
  height?: number;
  color?: string;
};

const computeNiceNumber = (value: number): number => {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;
  if (fraction <= 1) {
    niceFraction = 1;
  } else if (fraction <= 2) {
    niceFraction = 2;
  } else if (fraction <= 5) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }
  return Math.max(1, niceFraction * Math.pow(10, exponent));
};

export default function BarChart({ values, height = 160, color = '#f9a825' }: BarChartProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const paddingHorizontal = 16;
  const topAxis = 14;
  const bottomAxis = 26; // bottom x-axis + labels
  const rightAxis = 60;  // right y-axis + labels
  const chartWidth = screenWidth - paddingHorizontal * 2 - rightAxis;
  const chartHeight = height - bottomAxis - topAxis;

  const max = Math.max(1, ...values);
  const n = values.length;
  const gap = Math.max(2, Math.floor(chartWidth / (n * 6))); // responsive gap
  const barWidth = Math.max(4, Math.floor((chartWidth - gap * (n - 1)) / n));

  // X labels at 0, 6, 12, 18
  const xLabels = [0, 6, 12, 18];
  // Y labels (0 up to nice rounded max)
  let yStep = computeNiceNumber(max / 4);
  let yMax = yStep * 4;
  if (yMax < max) {
    yStep = computeNiceNumber(max / 3);
    yMax = yStep * 3;
  }
  const ticks = Math.max(3, Math.round(yMax / yStep));
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => Math.min(yMax, i * yStep));

  return (
    <Svg height={height} width={chartWidth + rightAxis}>
      <ClipPath id="clip" clipPathUnits="userSpaceOnUse">
        <SvgRect x={0} y={topAxis} width={chartWidth} height={chartHeight} />
      </ClipPath>
      <G x={0} y={topAxis}>
        {/* baseline */}
        <Line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#282828" strokeWidth={1} />
        {yTicks.map((y, i) => {
          const yPos = chartHeight - Math.round((y / yMax) * chartHeight);
          return (
            <G key={`grid-${i}`}>
              <Line x1={0} y1={yPos} x2={chartWidth} y2={yPos} stroke="#1f1f1f" strokeWidth={1} />
              <SvgText
                x={chartWidth + 6}
                y={yPos}
                fontSize={11}
                fill="#9a9a9a"
                textAnchor="start"
                alignmentBaseline="middle"
              >
                {Math.round(y).toLocaleString()}
              </SvgText>
            </G>
          );
        })}
        {xLabels.map((xHour) => {
          const x = xHour * (barWidth + gap);
          return (
            <G key={`tick-${xHour}`}>
              <Line x1={x} y1={chartHeight} x2={x} y2={chartHeight + 4} stroke="#404040" strokeWidth={1} />
              <SvgText
                x={x}
                y={chartHeight + 18}
                fontSize={11}
                fill="#9a9a9a"
                textAnchor="middle"
              >
                {xHour.toString().padStart(2, '0')}
              </SvgText>
            </G>
          );
        })}
      </G>

      {/* Bars */}
      <G clipPath="url(#clip)" y={topAxis}>
        {values.map((v, i) => {
          const x = i * (barWidth + gap);
          const h = Math.max(2, Math.round((v / yMax) * (chartHeight - 6)));
          return (
            <Rect key={i} x={x} y={chartHeight - h} width={barWidth} height={h} rx={2} ry={2} fill={color} />
          );
        })}
      </G>
    </Svg>
  );
}
