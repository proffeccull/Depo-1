import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
// import { showToast } from '../../utils/toast'; // TODO: Implement toast utility

interface CryptoGateway {
  id: string;
  name: string;
  icon: string;
  description: string;
  supportedCurrencies: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  processingTime: string;
  isActive: boolean;
  minAmount: number;
  maxAmount: number;
}

const CryptoGatewaySelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [gateways, setGateways] = useState<CryptoGateway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      // Mock data - replace with actual API call
      const mockGateways: CryptoGateway[] = [
        {
          id: 'binance',
          name: 'Binance Pay',
          icon: 'account-balance-wallet',
          description: 'Fast and secure payments through Binance',
          supportedCurrencies: ['BTC', 'ETH', 'USDT', 'BNB'],
          fees: { percentage: 0.5, fixed: 0 },
          processingTime: '2-5 minutes',
          isActive: true,
          minAmount: 10,
          maxAmount: 10000,
        },
        {
          id: 'coinbase',
          name: 'Coinbase Commerce',
          icon: 'shopping-cart',
          description: 'Accept crypto payments worldwide',
          supportedCurrencies: ['BTC', 'ETH', 'USDT', 'USDC'],
          fees: { percentage: 1.0, fixed: 0 },
          processingTime: '5-15 minutes',
          isActive: true,
          minAmount: 5,
          maxAmount: 5000,
        },
        {
          id: 'nowpayments',
          name: 'NOWPayments',
          icon: 'payment',
          description: 'Multi-currency crypto gateway',
          supportedCurrencies: ['BTC', 'ETH', 'USDT', 'LTC', 'XRP'],
          fees: { percentage: 0.8, fixed: 0 },
          processingTime: '3-10 minutes',
          isActive: true,
          minAmount: 1,
          maxAmount: 2000,
        },
        {
          id: 'stripe-crypto',
          name: 'Stripe Crypto',
          icon: 'credit-card',
          description: 'Enterprise-grade crypto payments',
          supportedCurrencies: ['BTC', 'ETH', 'USDT'],
          fees: { percentage: 1.2, fixed: 0.30 },
          processingTime: '1-3 minutes',
          isActive: false,
          minAmount: 25,
          maxAmount: 10000,
        },
      ];
      setGateways(mockGateways);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payment gateways');
    } finally {
      setLoading(false);
    }
  };

  const handleGatewaySelect = (gateway: CryptoGateway) => {
    if (!gateway.isActive) {
      Alert.alert('Gateway Unavailable', 'This payment gateway is currently unavailable. Please select another option.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate('CoinPurchaseAmount', { gateway: gateway.id });
  };

  const renderGateway = ({ item: gateway }: { item: CryptoGateway }) => (
    <TouchableOpacity
      style={[
        styles.gatewayCard,
        !gateway.isActive && styles.gatewayCardDisabled,
      ]}
      onPress={() => handleGatewaySelect(gateway)}
      activeOpacity={gateway.isActive ? 0.7 : 1}
    >
      <View style={styles.gatewayHeader}>
        <View style={[
          styles.gatewayIcon,
          !gateway.isActive && styles.gatewayIconDisabled,
        ]}>
          <Icon
            name={gateway.icon as any}
            size={24}
            color={gateway.isActive ? colors.white : colors.gray[400]}
          />
        </View>
        <View style={styles.gatewayInfo}>
          <Text style={[
            styles.gatewayName,
            !gateway.isActive && styles.gatewayNameDisabled,
          ]}>
            {gateway.name}
          </Text>
          {!gateway.isActive && (
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
          )}
        </View>
        <Icon
          name="chevron-right"
          size={24}
          color={gateway.isActive ? colors.text.secondary : colors.gray[300]}
        />
      </View>

      <Text style={styles.gatewayDescription}>
        {gateway.description}
      </Text>

      <View style={styles.gatewayDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Processing Time:</Text>
          <Text style={styles.detailValue}>{gateway.processingTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fee:</Text>
          <Text style={styles.detailValue}>
            {gateway.fees.percentage}%{gateway.fees.fixed > 0 ? ` + ₦${gateway.fees.fixed}` : ''}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Currencies:</Text>
          <Text style={styles.detailValue}>
            {gateway.supportedCurrencies.join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Payment Gateway</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choose a cryptocurrency gateway to purchase Charity Coins
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={gateways}
            renderItem={renderGateway}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gatewaysList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
  gatewaysList: {
    paddingBottom: spacing.lg,
  },
  gatewayCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  gatewayCardDisabled: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  gatewayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gatewayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayIconDisabled: {
    backgroundColor: colors.gray[300],
  },
  gatewayInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  gatewayName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  gatewayNameDisabled: {
    color: colors.gray[400],
  },
  unavailableText: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
  },
  gatewayDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  gatewayDetails: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default CryptoGatewaySelectionScreen;