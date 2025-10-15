import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { MotiView } from 'moti';
import Svg, {
  Line,
  Circle,
  Rect,
  Text as SvgText,
  G,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

interface ChartComponentProps {
  data: ChartDataPoint[];
  type?: 'line' | 'bar' | 'area' | 'pie';
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
  gradient?: boolean;
  colors?: string[];
  onPointPress?: (point: ChartDataPoint, index: number) => void;
  style?: ViewStyle;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  type = 'line',
  width = SCREEN_WIDTH - 40,
  height = 200,
  showGrid = true,
  showLabels = true,
  showTooltip = true,
  animated = true,
  gradient = false,
  colors: chartColors = [colors.primary, colors.secondary],
  onPointPress,
  style,
  title,
  xAxisLabel,
  yAxisLabel,
}) => {
  const [selectedPoint, setSelectedPoint] = React.useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate scales
  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yRange = maxY - minY || 1;

  const getX = (index: number) => (index / (data.length - 1)) * chartWidth + padding;
  const getY = (value: number) => chartHeight - ((value - minY) / yRange) * chartHeight + padding;

  const handlePointPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPoint(index);
    onPointPress?.(data[index], index);
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const numGridLines = 5;

    // Horizontal grid lines
    for (let i = 0; i <= numGridLines; i++) {
      const y = padding + (i * chartHeight) / numGridLines;
      gridLines.push(
        <Line
          key={`h-grid-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke={colors.gray[200]}
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      );
    }

    // Vertical grid lines
    for (let i = 0; i <= data.length - 1; i++) {
      const x = getX(i);
      gridLines.push(
        <Line
          key={`v-grid-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
          stroke={colors.gray[200]}
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      );
    }

    return <G>{gridLines}</G>;
  };

  const renderLineChart = () => {
    const pathData = data
      .map((point, index) => {
        const x = getX(index);
        const y = getY(point.y);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const areaPathData = `${pathData} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    return (
      <G>
        {/* Area fill */}
        {gradient && (
          <Defs>
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={chartColors[0]} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={chartColors[0]} stopOpacity={0.1} />
            </LinearGradient>
          </Defs>
        )}

        {gradient && (
          <Path
            d={areaPathData}
            fill="url(#areaGradient)"
            stroke="none"
          />
        )}

        {/* Line */}
        <Path
          d={pathData}
          fill="none"
          stroke={chartColors[0]}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = getX(index);
          const y = getY(point.y);

          return (
            <MotiView
              key={`point-${index}`}
              from={{ scale: 0 }}
              animate={{ scale: animated ? 1 : 1 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: index * 50,
              }}
            >
              <TouchableOpacity onPress={() => handlePointPress(index)}>
                <Circle
                  cx={x}
                  cy={y}
                  r={selectedPoint === index ? 6 : 4}
                  fill={chartColors[0]}
                  stroke={colors.white}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </G>
    );
  };

  const renderBarChart = () => {
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    return (
      <G>
        {data.map((point, index) => {
          const x = getX(index) - barWidth / 2;
          const barHeight = ((point.y - minY) / yRange) * chartHeight;
          const y = height - padding - barHeight;

          return (
            <MotiView
              key={`bar-${index}`}
              from={{ scaleY: 0 }}
              animate={{ scaleY: animated ? 1 : 1 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: index * 50,
              }}
            >
              <TouchableOpacity onPress={() => handlePointPress(index)}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={selectedPoint === index ? colors.secondary : chartColors[0]}
                  rx={4}
                />
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </G>
    );
  };

  const renderLabels = () => {
    if (!showLabels) return null;

    return (
      <G>
        {/* X-axis labels */}
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 5) !== 0) return null;
          const x = getX(index);
          return (
            <SvgText
              key={`x-label-${index}`}
              x={x}
              y={height - 10}
              fontSize={10}
              fill={colors.text.secondary}
              textAnchor="middle"
            >
              {point.label || point.x.toString()}
            </SvgText>
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = minY + (maxY - minY) * ratio;
          const y = getY(value);
          return (
            <SvgText
              key={`y-label-${ratio}`}
              x={10}
              y={y + 4}
              fontSize={10}
              fill={colors.text.secondary}
              textAnchor="start"
            >
              {Math.round(value)}
            </SvgText>
          );
        })}
      </G>
    );
  };

  const renderTooltip = () => {
    if (!showTooltip || selectedPoint === null) return null;

    const point = data[selectedPoint];
    const x = getX(selectedPoint);
    const y = getY(point.y);

    return (
      <G>
        {/* Tooltip line */}
        <Line
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
          stroke={colors.primary}
          strokeWidth={1}
          strokeDasharray="4,4"
        />

        {/* Tooltip box */}
        <G transform={`translate(${x + 10}, ${y - 30})`}>
          <Rect
            x={0}
            y={0}
            width={80}
            height={40}
            fill={colors.gray[800]}
            rx={4}
          />
          <SvgText
            x={40}
            y={15}
            fontSize={10}
            fill="white"
            textAnchor="middle"
            fontWeight="bold"
          >
            {point.label || point.x}
          </SvgText>
          <SvgText
            x={40}
            y={30}
            fontSize={12}
            fill="white"
            textAnchor="middle"
          >
            {point.y}
          </SvgText>
        </G>
      </G>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
      case 'area':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      {title && (
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      )}

      <Svg width={width} height={height}>
        {renderGrid()}
        {renderChart()}
        {renderLabels()}
        {renderTooltip()}
      </Svg>

      {/* Axis labels */}
      {xAxisLabel && (
        <Text
          style={{
            fontSize: 12,
            color: colors.text.secondary,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {xAxisLabel}
        </Text>
      )}

      {yAxisLabel && (
        <Text
          style={{
            fontSize: 12,
            color: colors.text.secondary,
            position: 'absolute',
            left: 0,
            top: height / 2,
            transform: [{ rotate: '-90deg' }],
            width: height,
            textAlign: 'center',
          }}
        >
          {yAxisLabel}
        </Text>
      )}
    </View>
  );
};

export default ChartComponent;