import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { io, Socket } from 'socket.io-client';

import { AppDispatch, RootState } from '../../store/store';
import { fetchUserAnalytics } from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

interface ImpactData {
  totalLivesImpacted: number;
  currentDonationAmount: number;
  realTimeUpdates: {
    newDonations: number;
    livesImpacted: number;
    timestamp: string;
  }[];
  impactBreakdown: {
    education: number;
    healthcare: number;
    environment: number;
    poverty: number;
    emergency: number;
  };
}

const DonationImpactDashboard: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userAnalytics, loading } = useSelector((state: RootState) => state.analytics);

  const [impactData, setImpactData] = useState<ImpactData>({
    totalLivesImpacted: 0,
    currentDonationAmount: 0,
    realTimeUpdates: [],
    impactBreakdown: {
      education: 0,
      healthcare: 0,
      environment: 0,
      poverty: 0,
      emergency: 0,
    },
  });

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserAnalytics(user.id));
      initializeSocketConnection();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [dispatch, user?.id]);

  const initializeSocketConnection = () => {
    try {
      socketRef.current = io(process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000', {
        transports: ['websocket'],
        timeout: 20000,
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to real-time impact updates');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from real-time impact updates');
      });

      socketRef.current.on('impact-update', (data: any) => {
        handleRealTimeUpdate(data);
      });

      socketRef.current.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    setImpactData((prevData: ImpactData) => ({
      ...prevData,
      totalLivesImpacted: prevData.totalLivesImpacted + (data.livesImpacted || 0),
      currentDonationAmount: prevData.currentDonationAmount + (data.donationAmount || 0),
      realTimeUpdates: [
        {
          newDonations: data.donationAmount || 0,
          livesImpacted: data.livesImpacted || 0,
          timestamp: new Date().toISOString(),
        },
        ...prevData.realTimeUpdates.slice(0, 9), // Keep last 10 updates
      ],
      impactBreakdown: {
        ...prevData.impactBreakdown,
        [data.category || 'education']: prevData.impactBreakdown[data.category || 'education'] + (data.livesImpacted || 0),
      },
    }));

    // Haptic feedback for real-time updates
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getImpactColor = (category: string) => {
    switch (category) {
      case 'education': return colors.primary;
      case 'healthcare': return colors.success;
      case 'environment': return colors.info;
      case 'poverty': return colors.warning;
      case 'emergency': return colors.error;
      default: return colors.secondary;
    }
  };

  const getImpactIcon = (category: string) => {
    switch (category) {
      case 'education': return 'school';
      case 'healthcare': return 'local-hospital';
      case 'environment': return 'nature';
      case 'poverty': return 'people';
      case 'emergency': return 'warning';
      default: return 'favorite';
    }
  };

  const renderImpactCard = (category: string, lives: number) => (
    <View key={category} style={styles.impactCard}>
      <View style={[styles.impactIcon, { backgroundColor: getImpactColor(category) + '20' }]}>
        <Icon name={getImpactIcon(category)} size={24} color={getImpactColor(category)} />
      </View>
      <View style={styles.impactContent}>
        <AnimatedNumber
          value={lives}
          style={styles.impactValue}
          formatter={formatNumber}
        />
        <Text style={styles.impactLabel}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
      </View>
    </View>
  );

  const renderRealTimeUpdate = (update: any, index: number) => (
    <View key={index} style={styles.updateCard}>
      <View style={styles.updateIcon}>
        <Icon name="trending-up" size={16} color={colors.success} />
      </View>
      <View style={styles.updateContent}>
        <Text style={styles.updateText}>
          +{formatCurrency(update.newDonations)} impacted {update.livesImpacted} lives
        </Text>
        <Text style={styles.updateTime}>
          {new Date(update.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your impact...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donation Impact</Text>
          <View style={styles.connectionIndicator}>
            <View style={[styles.connectionDot, { backgroundColor: isConnected ? colors.success : colors.error }]} />
            <Text style={styles.connectionText}>
              {isConnected ? 'Live' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Real-time Stats */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.statsCard}
        >
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Real-Time Impact</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Real-Time Updates', 'This dashboard shows live updates of your donation impact as they happen worldwide.')}
              style={styles.infoButton}
            >
              <Icon name="info" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <AnimatedNumber
                value={impactData.totalLivesImpacted}
                style={styles.statValue}
                formatter={formatNumber}
              />
              <Text style={styles.statLabel}>Lives Impacted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AnimatedNumber
                value={impactData.currentDonationAmount}
                style={styles.statValue}
                formatter={formatCurrency}
              />
              <Text style={styles.statLabel}>Total Donated</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Impact Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact by Category</Text>
          <View style={styles.impactGrid}>
            {Object.entries(impactData.impactBreakdown).map(([category, lives]) =>
              renderImpactCard(category, lives as number)
            )}
          </View>
        </View>

        {/* Real-Time Updates Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Updates</Text>
          <View style={styles.updatesContainer}>
            {impactData.realTimeUpdates.length === 0 ? (
              <View style={styles.emptyUpdates}>
                <Icon name="timeline" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No Recent Updates</Text>
                <Text style={styles.emptyText}>
                  Real-time updates will appear here as your donations make an impact.
                </Text>
              </View>
            ) : (
              impactData.realTimeUpdates.map(renderRealTimeUpdate)
            )}
          </View>
        </View>

        {/* Impact Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Visualization</Text>
          <View style={styles.visualizationCard}>
            <Text style={styles.visualizationText}>
              Every donation you make creates a ripple effect, helping multiple people through our partner organizations.
            </Text>
            <View style={styles.rippleContainer}>
              <View style={[styles.ripple, styles.ripple1]} />
              <View style={[styles.ripple, styles.ripple2]} />
              <View style={[styles.ripple, styles.ripple3]} />
              <View style={styles.rippleCenter}>
                <Icon name="favorite" size={32} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  statsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsTitle: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoButton: {
    padding: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h1,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  impactCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    width: (screenWidth - spacing.md * 3) / 2,
    alignItems: 'center',
    ...shadows.card,
  },
  impactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  impactContent: {
    alignItems: 'center',
  },
  impactValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  impactLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  updatesContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    ...shadows.card,
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  updateContent: {
    flex: 1,
  },
  updateText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  updateTime: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  emptyUpdates: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  visualizationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  visualizationText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  rippleContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.primary + '40',
    borderRadius: 60,
  },
  ripple1: {
    width: 60,
    height: 60,
  },
  ripple2: {
    width: 90,
    height: 90,
  },
  ripple3: {
    width: 120,
    height: 120,
  },
  rippleCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DonationImpactDashboard;