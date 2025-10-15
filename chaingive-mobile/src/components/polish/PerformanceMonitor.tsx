import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  renderTime: number;
  jsHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceMonitorProps {
  style?: ViewStyle;
  showDetails?: boolean;
  autoUpdate?: boolean;
  updateInterval?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  style,
  showDetails = false,
  autoUpdate = true,
  updateInterval = 1000,
  onMetricsUpdate,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    networkRequests: 0,
    renderTime: 0,
    jsHeapSize: 0,
    jsHeapSizeLimit: 0,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(autoUpdate);
  const intervalRef = useRef<NodeJS.Timeout>();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => stopMonitoring();
  }, [isMonitoring]);

  const startMonitoring = () => {
    intervalRef.current = setInterval(collectMetrics, updateInterval);
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const collectMetrics = () => {
    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;

    // Calculate FPS
    frameCountRef.current++;
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Get memory info (if available)
      let memoryUsage = 0;
      let jsHeapSize = 0;
      let jsHeapSizeLimit = 0;

      if (global.performance && (global.performance as any).memory) {
        const memory = (global.performance as any).memory;
        jsHeapSize = memory.usedJSHeapSize;
        jsHeapSizeLimit = memory.jsHeapSizeLimit;
        memoryUsage = (jsHeapSize / jsHeapSizeLimit) * 100;
      }

      const newMetrics: PerformanceMetrics = {
        fps: Math.min(fps, 60), // Cap at 60 FPS
        memoryUsage,
        cpuUsage: 0, // Would need native module for accurate CPU usage
        networkRequests: 0, // Would need network monitoring
        renderTime: deltaTime,
        jsHeapSize,
        jsHeapSizeLimit,
      };

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);
    }
  };

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const toggleMonitoring = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMonitoring(!isMonitoring);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return colors.success;
    if (value >= thresholds.warning) return colors.warning;
    return colors.error;
  };

  const getMemoryColor = (usage: number) => {
    if (usage < 50) return colors.success;
    if (usage < 80) return colors.warning;
    return colors.error;
  };

  const renderMetricItem = (
    label: string,
    value: string | number,
    unit: string,
    color: string,
    icon: string
  ) => (
    <View
      key={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name={icon} size={20} color={color} style={{ marginRight: 12 }} />
        <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '500' }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 14, color: color, fontWeight: 'bold' }}>
        {typeof value === 'number' ? value.toFixed(1) : value} {unit}
      </Text>
    </View>
  );

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={[
        {
          backgroundColor: 'white',
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={toggleExpanded}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          backgroundColor: isMonitoring ? colors.primary : colors.gray[200],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MotiView
            animate={{
              scale: isMonitoring ? [1, 1.2, 1] : 1,
            }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: isMonitoring,
            }}
          >
            <Icon
              name="speed"
              size={24}
              color={isMonitoring ? 'white' : colors.text.secondary}
            />
          </MotiView>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: isMonitoring ? 'white' : colors.text.primary,
              marginLeft: 12,
            }}
          >
            Performance Monitor
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleMonitoring}
            style={{
              padding: 8,
              marginRight: 8,
            }}
          >
            <Icon
              name={isMonitoring ? 'pause' : 'play-arrow'}
              size={20}
              color={isMonitoring ? 'white' : colors.text.secondary}
            />
          </TouchableOpacity>

          <Icon
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={isMonitoring ? 'white' : colors.text.secondary}
          />
        </View>
      </TouchableOpacity>

      {/* Main Metrics */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
          {/* FPS */}
          <View style={{ alignItems: 'center' }}>
            <MotiView
              animate={{
                scale: metrics.fps < 30 ? [1, 1.1, 1] : 1,
              }}
              transition={{
                type: 'timing',
                duration: 500,
                loop: metrics.fps < 30,
              }}
            >
              <Icon
                name="timeline"
                size={32}
                color={getPerformanceColor(metrics.fps, { good: 50, warning: 30 })}
              />
            </MotiView>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: getPerformanceColor(metrics.fps, { good: 50, warning: 30 }),
                marginTop: 4,
              }}
            >
              {metrics.fps}
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>FPS</Text>
          </View>

          {/* Memory */}
          <View style={{ alignItems: 'center' }}>
            <Icon
              name="memory"
              size={32}
              color={getMemoryColor(metrics.memoryUsage)}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: getMemoryColor(metrics.memoryUsage),
                marginTop: 4,
              }}
            >
              {metrics.memoryUsage.toFixed(1)}%
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>Memory</Text>
          </View>

          {/* CPU */}
          <View style={{ alignItems: 'center' }}>
            <Icon
              name="developer-board"
              size={32}
              color={getPerformanceColor(100 - metrics.cpuUsage, { good: 80, warning: 60 })}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: getPerformanceColor(100 - metrics.cpuUsage, { good: 80, warning: 60 }),
                marginTop: 4,
              }}
            >
              {metrics.cpuUsage.toFixed(1)}%
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>CPU</Text>
          </View>
        </View>

        {/* Detailed Metrics */}
        {isExpanded && showDetails && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.text.primary,
                marginBottom: 12,
              }}
            >
              Detailed Metrics
            </Text>

            <ScrollView style={{ maxHeight: 200 }}>
              {renderMetricItem(
                'Frame Rate',
                metrics.fps,
                'FPS',
                getPerformanceColor(metrics.fps, { good: 50, warning: 30 }),
                'timeline'
              )}

              {renderMetricItem(
                'Memory Usage',
                metrics.memoryUsage,
                '%',
                getMemoryColor(metrics.memoryUsage),
                'memory'
              )}

              {renderMetricItem(
                'JS Heap Size',
                formatBytes(metrics.jsHeapSize),
                '',
                getMemoryColor((metrics.jsHeapSize / metrics.jsHeapSizeLimit) * 100),
                'storage'
              )}

              {renderMetricItem(
                'Render Time',
                metrics.renderTime,
                'ms',
                getPerformanceColor(1000 / metrics.renderTime, { good: 30, warning: 15 }),
                'timer'
              )}

              {renderMetricItem(
                'Network Requests',
                metrics.networkRequests,
                '',
                colors.info,
                'wifi'
              )}
            </ScrollView>
          </MotiView>
        )}
      </View>
    </MotiView>
  );
};

export default PerformanceMonitor;