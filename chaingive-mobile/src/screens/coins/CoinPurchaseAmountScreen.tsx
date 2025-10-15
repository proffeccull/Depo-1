import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useFormValidation, validators } from '../../utils/validation';
import InlineError from '../../components/common/InlineError';

interface RouteParams {
  gateway: string;
}

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

const CoinPurchaseAmountScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { gateway } = route.params as RouteParams;

  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [gatewayData, setGatewayData] = useState<CryptoGateway | null>(null);
  const [loading, setLoading] = useState(true);

  const { errors, validate, validateAll, clearErrors } = useFormValidation();

  useEffect(() => {
    loadGatewayData();
  }, [gateway]);

  const loadGatewayData = async () => {
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
      ];

      const selectedGateway = mockGateways.find(g => g.id === gateway);
      if (selectedGateway) {
        setGatewayData(selectedGateway);
        setSelectedCurrency(selectedGateway.supportedCurrencies[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load gateway information');
    } finally {
      setLoading(false);
    }
  };

  const calculateCoins = (cryptoAmount: number) => {
    if (!gatewayData) return 0;
    // Mock conversion rate - replace with actual rate
    const mockRates: Record<string, number> = {
      BTC: 45000, // USD per BTC
      ETH: 3000,  // USD per ETH
      USDT: 1,    // USD per USDT
      BNB: 300,   // USD per BNB
      USDC: 1,    // USD per USDC
      LTC: 70,    // USD per LTC
      XRP: 0.5,   // USD per XRP
    };

    const usdValue = cryptoAmount * (mockRates[selectedCurrency] || 1);
    const feeAmount = usdValue * (gatewayData.fees.percentage / 100) + gatewayData.fees.fixed;
    const netAmount = usdValue - feeAmount;

    // Assuming 1 coin = 1 USD for simplicity
    return Math.max(0, netAmount);
  };

  const handleContinue = () => {
    if (!gatewayData || !amount) return;

    const numAmount = parseFloat(amount);
    const coins = calculateCoins(numAmount);

    if (coins < gatewayData.minAmount) {
      Alert.alert('Invalid Amount', `Minimum purchase is ${gatewayData.minAmount} coins`);
      return;
    }

    if (coins > gatewayData.maxAmount) {
      Alert.alert('Invalid Amount', `Maximum purchase is ${gatewayData.maxAmount} coins`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate('CryptoPayment', {
      purchaseId: 'mock-purchase-id', // Replace with actual purchase ID
      gateway: gateway,
      amount: numAmount,
      currency: selectedCurrency,
      estimatedCoins: coins,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading gateway details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gatewayData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Gateway Not Found</Text>
          <Text style={styles.errorMessage}>
            The selected payment gateway is not available.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const coins = amount ? calculateCoins(parseFloat(amount)) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Amount</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gateway Info */}
        <View style={styles.gatewayCard}>
          <View style={styles.gatewayHeader}>
            <View style={styles.gatewayIcon}>
              <Icon name={gatewayData.icon as any} size={24} color={colors.white} />
            </View>
            <View style={styles.gatewayInfo}>
              <Text style={styles.gatewayName}>{gatewayData.name}</Text>
              <Text style={styles.gatewayDescription}>{gatewayData.description}</Text>
            </View>
          </View>
        </View>

        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Cryptocurrency</Text>
          <View style={styles.currencyGrid}>
            {gatewayData.supportedCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyButton,
                  selectedCurrency === currency && styles.currencyButtonSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCurrency(currency);
                }}
              >
                <Text style={[
                  styles.currencyText,
                  selectedCurrency === currency && styles.currencyTextSelected,
                ]}>
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount to Send</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={colors.text.secondary}
            />
            <Text style={styles.currencyLabel}>{selectedCurrency}</Text>
          </View>
        </View>

        {/* Calculation */}
        {amount && (
          <View style={styles.calculationCard}>
            <Text style={styles.calculationTitle}>Transaction Summary</Text>

            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Amount:</Text>
              <Text style={styles.calculationValue}>{amount} {selectedCurrency}</Text>
            </View>

            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Fee:</Text>
              <Text style={styles.calculationValue}>
                {gatewayData.fees.percentage}%{gatewayData.fees.fixed > 0 ? ` + $${gatewayData.fees.fixed}` : ''}
              </Text>
            </View>

            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Processing Time:</Text>
              <Text style={styles.calculationValue}>{gatewayData.processingTime}</Text>
            </View>

            <View style={[styles.calculationRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Estimated Coins:</Text>
              <Text style={styles.totalValue}>{Math.round(coins).toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Limits */}
        <View style={styles.limitsCard}>
          <Text style={styles.limitsTitle}>Purchase Limits</Text>
          <Text style={styles.limitsText}>
            Minimum: {gatewayData.minAmount.toLocaleString()} coins
          </Text>
          <Text style={styles.limitsText}>
            Maximum: {gatewayData.maxAmount.toLocaleString()} coins
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!amount || coins < gatewayData.minAmount || coins > gatewayData.maxAmount) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!amount || coins < gatewayData.minAmount || coins > gatewayData.maxAmount}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
          <Icon name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.button,
    color: colors.white,
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
  },
  gatewayCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  gatewayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gatewayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  gatewayInfo: {
    flex: 1,
  },
  gatewayName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  gatewayDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  currencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    minWidth: 80,
    alignItems: 'center',
  },
  currencyButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  currencyText: {
    ...typography.bodyBold,
    color: colors.text.secondary,
  },
  currencyTextSelected: {
    color: colors.primary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  amountInput: {
    flex: 1,
    padding: spacing.md,
    ...typography.h3,
    color: colors.text.primary,
  },
  currencyLabel: {
    ...typography.h4,
    color: colors.text.secondary,
    marginRight: spacing.md,
    fontWeight: 'bold',
  },
  calculationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  calculationTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  calculationLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  calculationValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  totalValue: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  limitsCard: {
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  limitsTitle: {
    ...typography.h4,
    color: colors.warning,
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  limitsText: {
    ...typography.bodySmall,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  continueButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default CoinPurchaseAmountScreen;