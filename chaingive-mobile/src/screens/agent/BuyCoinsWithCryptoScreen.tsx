import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  PageTransition,
  CountUpAnimation,
  LottieSuccess,
  PulseRing,
} from '../../components/animations';
import Button from '../../components/common/Button';
import GradientCard from '../../components/common/GradientCard';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import Modal from '../../components/common/Modal';
import { cryptoPaymentService } from '../../services';
import type { CryptoCoin, CryptoPayment } from '../../services';

const BuyCoinsWithCryptoScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [cryptoCoins, setCryptoCoins] = useState<CryptoCoin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [ngnAmount, setNgnAmount] = useState(0);
  const [cryptoAmount, setCryptoAmount] = useState('0');
  const [creating, setCreating] = useState(false);
  const [payment, setPayment] = useState<CryptoPayment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Dummy exchange rates (in production, fetch from API)
  const exchangeRates: Record<string, number> = {
    BTC: 27000000, // 1 BTC = ₦27,000,000
    ETH: 1800000,  // 1 ETH = ₦1,800,000
    USDT: 750,     // 1 USDT = ₦750
    USDC: 750,     // 1 USDC = ₦750
    LTC: 90000,    // 1 LTC = ₦90,000
  };

  useEffect(() => {
    loadCryptoCoins();
  }, []);

  useEffect(() => {
    if (coinAmount && selectedCoin) {
      const amount = parseFloat(coinAmount);
      if (!isNaN(amount) && amount > 0) {
        // Assuming 1 coin = ₦100 (adjust as needed)
        const ngn = amount * 100;
        setNgnAmount(ngn);

        // Calculate crypto amount
        const rate = exchangeRates[selectedCoin.symbol] || 1;
        const crypto = ngn / rate;
        setCryptoAmount(crypto.toFixed(8));
      } else {
        setNgnAmount(0);
        setCryptoAmount('0');
      }
    }
  }, [coinAmount, selectedCoin]);

  const loadCryptoCoins = async () => {
    try {
      setLoading(true);
      const coins = await cryptoPaymentService.getAvailableCryptoCoins();
      setCryptoCoins(coins);
      if (coins.length > 0) {
        setSelectedCoin(coins[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load crypto coins:', error);
      Alert.alert('Error', 'Failed to load crypto payment options');
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedCoin || !coinAmount) {
      Alert.alert('Error', 'Please enter coin amount');
      return;
    }

    const amount = parseFloat(coinAmount);
    if (isNaN(amount) || amount < selectedCoin.minAmount || amount > selectedCoin.maxAmount) {
      Alert.alert(
        'Error',
        `Amount must be between ${selectedCoin.minAmount} and ${selectedCoin.maxAmount} coins`
      );
      return;
    }

    try {
      setCreating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const paymentData = await cryptoPaymentService.initiateAgentCryptoPurchase({
        coinAmount: amount,
        cryptoCoinId: selectedCoin.id,
      });

      setPayment(paymentData);
      setCreating(false);
      setShowPaymentModal(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      setCreating(false);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create payment'
      );
    }
  };

  const handleCopyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✅ Copied', 'Wallet address copied to clipboard');
  };

  const handleCopyAmount = async (amount: string) => {
    await Clipboard.setStringAsync(amount);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✅ Copied', 'Amount copied to clipboard');
  };

  const getCryptoColor = (symbol: string): string => {
    const colorMap: Record<string, string> = {
      BTC: '#F7931A',
      ETH: '#627EEA',
      USDT: '#26A17B',
      USDC: '#2775CA',
      LTC: '#BEBEBE',
      BCH: '#8DC351',
      XRP: '#23292F',
    };
    return colorMap[symbol] || colors.primary;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading crypto options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cryptoCoins.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Coins with Crypto</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Icon name="currency-bitcoin" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>Crypto Payments Unavailable</Text>
          <Text style={styles.emptyMessage}>
            Crypto payment options are not configured yet.{'\n'}
            Please contact admin or use cash deposit.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PageTransition type="slideUp">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Coins with Crypto</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Crypto Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Cryptocurrency</Text>
            <View style={styles.cryptoGrid}>
              {cryptoCoins.map((coin) => (
                <TouchableOpacity
                  key={coin.id}
                  style={[
                    styles.cryptoOption,
                    selectedCoin?.id === coin.id && styles.cryptoOptionSelected,
                    { borderColor: getCryptoColor(coin.symbol) },
                  ]}
                  onPress={() => {
                    setSelectedCoin(coin);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View
                    style={[
                      styles.cryptoIconSmall,
                      { backgroundColor: `${getCryptoColor(coin.symbol)}20` },
                    ]}
                  >
                    <Icon
                      name="currency-bitcoin"
                      size={20}
                      color={getCryptoColor(coin.symbol)}
                    />
                  </View>
                  <Text style={styles.cryptoSymbolText}>{coin.symbol}</Text>
                  <Text style={styles.cryptoNameText}>{coin.name}</Text>
                  <EnhancedBadge
                    value={coin.network}
                    color={colors.info}
                    size="small"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Purchase Form */}
          {selectedCoin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Purchase Details</Text>
              
              <GradientCard
                colors={[getCryptoColor(selectedCoin.symbol), colors.primary]}
                style={styles.purchaseCard}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Coin Amount</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Min: ${selectedCoin.minAmount}, Max: ${selectedCoin.maxAmount}`}
                    value={coinAmount}
                    onChangeText={setCoinAmount}
                    keyboardType="numeric"
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>

                <View style={styles.conversionCard}>
                  <View style={styles.conversionRow}>
                    <Text style={styles.conversionLabel}>NGN Amount:</Text>
                    <CountUpAnimation
                      value={ngnAmount}
                      style={styles.conversionValue}
                      prefix="₦"
                      decimals={0}
                    />
                  </View>
                  <View style={styles.conversionRow}>
                    <Text style={styles.conversionLabel}>Crypto Amount:</Text>
                    <Text style={styles.conversionValue}>
                      {cryptoAmount} {selectedCoin.symbol}
                    </Text>
                  </View>
                  <View style={styles.conversionRow}>
                    <Text style={styles.conversionLabel}>Exchange Rate:</Text>
                    <Text style={styles.conversionValueSmall}>
                      1 {selectedCoin.symbol} = ₦{exchangeRates[selectedCoin.symbol]?.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Purchase Coins"
                  onPress={handlePurchase}
                  variant="primary"
                  icon="shopping-cart"
                  loading={creating}
                  style={styles.purchaseButton}
                />
              </GradientCard>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <Icon name="info" size={20} color={colors.info} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>How it works:</Text>
                  <Text style={styles.infoText}>
                    1. Select cryptocurrency and enter amount{'\n'}
                    2. Send exact crypto amount to provided address{'\n'}
                    3. Admin confirms payment on blockchain{'\n'}
                    4. Coins credited to your account
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Payment Modal */}
        <Modal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Send Crypto Payment"
        >
          {payment && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>
                  Send exactly {payment.cryptoAmount} {payment.coinSymbol}
                </Text>
                <Text style={styles.paymentSubtitle}>
                  to the address below:
                </Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={payment.walletAddress}
                  size={200}
                  backgroundColor="white"
                />
              </View>

              {/* Wallet Address */}
              <View style={styles.addressCard}>
                <Text style={styles.addressLabel}>Wallet Address:</Text>
                <Text style={styles.addressText}>{payment.walletAddress}</Text>
                <Button
                  title="Copy Address"
                  onPress={() => handleCopyAddress(payment.walletAddress)}
                  variant="outline"
                  icon="content-copy"
                  style={styles.copyButton}
                />
              </View>

              {/* Amount */}
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Amount to Send:</Text>
                <Text style={styles.amountText}>
                  {payment.cryptoAmount} {payment.coinSymbol}
                </Text>
                <Button
                  title="Copy Amount"
                  onPress={() => handleCopyAmount(payment.cryptoAmount)}
                  variant="outline"
                  icon="content-copy"
                  style={styles.copyButton}
                />
              </View>

              {/* Warning */}
              <View style={styles.warningCard}>
                <Icon name="warning" size={20} color={colors.warning} />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Important:</Text>
                  <Text style={styles.warningText}>
                    • Send ONLY {payment.coinSymbol} to this address{'\n'}
                    • Send the EXACT amount shown{'\n'}
                    • Payment expires in 30 minutes{'\n'}
                    • Admin will confirm manually
                  </Text>
                </View>
              </View>

              <Button
                title="I've Sent the Payment"
                onPress={() => {
                  setShowPaymentModal(false);
                  Alert.alert(
                    '✅ Payment Pending',
                    'Your payment is pending admin confirmation. You will be notified once confirmed.',
                    [
                      {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                      },
                    ]
                  );
                }}
                variant="primary"
                icon="check-circle"
              />
            </ScrollView>
          )}
        </Modal>
      </SafeAreaView>
    </PageTransition>
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
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  cryptoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cryptoOption: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    width: '48%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  cryptoOptionSelected: {
    borderWidth: 2,
  },
  cryptoIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cryptoSymbolText: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  cryptoNameText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  purchaseCard: {
    padding: spacing.lg,
    borderRadius: 16,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  conversionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  conversionLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  conversionValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  conversionValueSmall: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  purchaseButton: {
    marginBottom: 0,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    ...typography.bodySmallBold,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  paymentTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  paymentSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  addressCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  amountCard: {
    backgroundColor: colors.success + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  amountText: {
    ...typography.h2,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  copyButton: {
    marginBottom: 0,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warningContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  warningTitle: {
    ...typography.bodySmallBold,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  warningText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default BuyCoinsWithCryptoScreen;
