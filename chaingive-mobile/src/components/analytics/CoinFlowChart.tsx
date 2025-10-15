import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Svg, Path, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: screenWidth } = Dimensions.get('window');

interface CoinFlowData {
  date: string;
  earned: number;
  spent: number;
  net: number;
}

interface CoinFlowChartProps {
  data: CoinFlowData[];
  timeframe: '7d' | '30d' | '90d';
  onTimeframeChange?: (timeframe: '7d' | '30d' | '90d') => void;
}

const CoinFlowChart: React.FC<CoinFlowChartProps> = ({
  data,
  timeframe,
  onTimeframeChange,
}) => {
  const chartRef = useRef<View>(null);

  // Chart dimensions
  const chartWidth = screenWidth - spacing.md * 2;
  const chartHeight = 200;
  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Calculate scales
  const maxValue = Math.max(
    ...data.reduce((acc: number[], d) => [...acc, Math.abs(d.earned), Math.abs(d.spent), Math.abs(d.net)], [])
  );

  const xScale = (index: number) => (index / (data.length - 1)) * innerWidth + padding;
  const yScale = (value: number) => chartHeight - padding - ((value + maxValue) / (maxValue * 2)) * innerHeight;

  // Generate path for earned coins (green line)
  const earnedPath = data.reduce((path, point, index) => {
    const x = xScale(index);
    const y = yScale(point.earned);
    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');

  // Generate path for spent coins (red line)
  const spentPath = data.reduce((path, point, index) => {
    const x = xScale(index);
    const y = yScale(-point.spent); // Negative for spent
    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');

  // Generate path for net flow (blue line)
  const netPath = data.reduce((path, point, index) => {
    const x = xScale(index);
    const y = yScale(point.net);
    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return timeframe === '7d'
      ? date.toLocaleDateString('en-US', { weekday: 'short' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Coin Flow Over Time</Text>
        {onTimeframeChange && (
          <View style={styles.timeframeSelector}>
            {(['7d', '30d', '90d'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timeframeButton,
                  timeframe === period && styles.timeframeButtonActive,
                ]}
                onPress={() => onTimeframeChange(period)}
              >
                <Text style={[
                  styles.timeframeText,
                  timeframe === period && styles.timeframeTextActive,
                ]}>
                  {period === '7d' ? '7D' : period === '30d' ? '30D' : '90D'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer} ref={chartRef}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          <G>
            {/* Horizontal grid lines */}
            {[-maxValue, -maxValue/2, 0, maxValue/2, maxValue].map((value, index) => (
              <G key={`h-grid-${index}`}>
                <Line
                  x1={padding}
                  y1={yScale(value)}
                  x2={chartWidth - padding}
                  y2={yScale(value)}
                  stroke={colors.gray[200]}
                  strokeWidth={0.5}
                  strokeDasharray={index === 2 ? undefined : "2,2"}
                />
                <SvgText
                  x={padding - 10}
                  y={yScale(value) + 4}
                  fontSize={10}
                  fill={colors.text.secondary}
                  textAnchor="end"
                >
                  {formatValue(value)}
                </SvgText>
              </G>
            ))}
          </G>

          {/* Earned line (green) */}
          <Path
            d={earnedPath}
            stroke={colors.success}
            strokeWidth={2}
            fill="none"
          />

          {/* Spent line (red) */}
          <Path
            d={spentPath}
            stroke={colors.error}
            strokeWidth={2}
            fill="none"
          />

          {/* Net flow line (blue) */}
          <Path
            d={netPath}
            stroke={colors.primary}
            strokeWidth={3}
            fill="none"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <G key={`points-${index}`}>
              {/* Earned point */}
              <Circle
                cx={xScale(index)}
                cy={yScale(point.earned)}
                r={3}
                fill={colors.success}
              />

              {/* Spent point */}
              <Circle
                cx={xScale(index)}
                cy={yScale(-point.spent)}
                r={3}
                fill={colors.error}
              />

              {/* Net point */}
              <Circle
                cx={xScale(index)}
                cy={yScale(point.net)}
                r={4}
                fill={colors.primary}
                stroke={colors.white}
                strokeWidth={2}
              />
            </G>
          ))}

          {/* X-axis labels */}
          {data.filter((_, index) => index % Math.ceil(data.length / 5) === 0).map((point, index) => {
            const actualIndex = index * Math.ceil(data.length / 5);
            if (actualIndex >= data.length) return null;

            return (
              <SvgText
                key={`x-label-${actualIndex}`}
                x={xScale(actualIndex)}
                y={chartHeight - 10}
                fontSize={10}
                fill={colors.text.secondary}
                textAnchor="middle"
              >
                {formatDate(data[actualIndex].date)}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Net Flow</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Earned</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Spent</Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            +{data.reduce((sum, d) => sum + d.earned, 0).toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Total Earned</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            -{data.reduce((sum, d) => sum + d.spent, 0).toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[
            styles.summaryValue,
            { color: data.reduce((sum, d) => sum + d.net, 0) >= 0 ? colors.success : colors.error }
          ]}>
            {data.reduce((sum, d) => sum + d.net, 0) >= 0 ? '+' : ''}
            {data.reduce((sum, d) => sum + d.net, 0).toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Net Change</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 6,
  },
  timeframeButtonActive: {
    backgroundColor: colors.white,
    ...shadows.small,
  },
  timeframeText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: colors.primary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
});

export default CoinFlowChart;