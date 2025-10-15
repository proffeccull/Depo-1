import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  PageTransition,
  LottieSuccess,
  ConfettiCelebration,
} from '../../components/animations';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import GradientCard from '../../components/common/GradientCard';
import { cryptoPaymentService } from '../../services';
import type { CryptoPaymentConfig, CryptoCoin } from '../../services';

const CryptoPaymentSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // BTCPay Config State
  const [config, setConfig] = useState<CryptoPaymentConfig | null>(null);
  const [btcpayServerUrl, setBtcpayServerUrl] = useState('');
  const [btcpayApiKey, setBtcpayApiKey] = useState('');
  const [btcpayStoreId, setBtcpayStoreId] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  // Crypto Coins State
  const [cryptoCoins, setCryptoCoins] = useState<CryptoCoin[]>([]);
  const [showAddCoinModal, setShowAddCoinModal] = useState(false);

  // Add Coin Form
  const [newCoinSymbol, setNewCoinSymbol] = useState('');
  const [newCoinName, setNewCoinName] = useState('');
  const [newCoinNetwork, setNewCoinNetwork] = useState('');
  const [newCoinWallet, setNewCoinWallet] = useState('');
  const [newCoinMinAmount, setNewCoinMinAmount] = useState('');
  const [newCoinMaxAmount, setNewCoinMaxAmount] = useState('');
  const [newCoinConfirmations, setNewCoinConfirmations] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, coinsData] = await Promise.all([
        cryptoPaymentService.getBTCPayConfig(),
        cryptoPaymentService.getCryptoCoins(),
      ]);

      if (configData) {
        setConfig(configData);
        setBtcpayServerUrl(configData.btcpayServerUrl);
        setBtcpayApiKey(configData.btcpayApiKey);
        setBtcpayStoreId(configData.btcpayStoreId);
        setIsEnabled(configData.isEnabled);
      }

      setCryptoCoins(coinsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load crypto payment data:', error);
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!btcpayServerUrl || !btcpayApiKey || !btcpayStoreId) {
      Alert.alert('Error', 'Please fill in all BTCPay Server fields');
      return;
    }

    try {
      setTesting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await cryptoPaymentService.testBTCPayConnection();

      setTesting(false);
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '✅ Connection Successful',
          `Connected to BTCPay Server!\n\nStore: ${result.storeInfo?.name || 'N/A'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('❌ Connection Failed', result.message);
      }
    } catch (error: any) {
      setTesting(false);
      Alert.alert(
        '❌ Connection Failed',
        error.response?.data?.message || 'Failed to connect to BTCPay Server'
      );
    }
  };

  const handleSaveBTCPayConfig = async () => {
    if (!btcpayServerUrl || !btcpayApiKey || !btcpayStoreId) {
      Alert.alert('Error', 'Please fill in all BTCPay Server fields');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const savedConfig = config
        ? await cryptoPaymentService.updateBTCPayConfig({
            btcpayServerUrl,
            btcpayApiKey,
            btcpayStoreId,
            isEnabled,
          })
        : await cryptoPaymentService.saveBTCPayConfig({
            btcpayServerUrl,
            btcpayApiKey,
            btcpayStoreId,
          });

      setConfig(savedConfig);
      setSaving(false);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setShowCelebration(false);
      }, 2500);

      Alert.alert('✅ Success', 'BTCPay Server configuration saved!');
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save BTCPay configuration');
    }
  };

  const handleAddCryptoCoin = async () => {
    if (!newCoinSymbol || !newCoinName || !newCoinNetwork || !newCoinWallet) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const newCoin = await cryptoPaymentService.addCryptoCoin({
        symbol: newCoinSymbol.toUpperCase(),
        name: newCoinName,
        network: newCoinNetwork,
        walletAddress: newCoinWallet,
        minAmount: parseFloat(newCoinMinAmount) || 10,
        maxAmount: parseFloat(newCoinMaxAmount) || 1000000,
        confirmationsRequired: parseInt(newCoinConfirmations) || 3,
        icon: getCryptoIcon(newCoinSymbol.toUpperCase()),
      });

      setCryptoCoins([...cryptoCoins, newCoin]);
      setSaving(false);
      setShowAddCoinModal(false);
      
      // Reset form
      setNewCoinSymbol('');
      setNewCoinName('');
      setNewCoinNetwork('');
      setNewCoinWallet('');
      setNewCoinMinAmount('');
      setNewCoinMaxAmount('');
      setNewCoinConfirmations('');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Success', `${newCoinSymbol.toUpperCase()} added successfully!`);
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to add crypto coin');
    }
  };

  const handleToggleCoin = async (coinId: string, currentStatus: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const updatedCoin = await cryptoPaymentService.toggleCryptoCoin(coinId, !currentStatus);
      
      setCryptoCoins(
        cryptoCoins.map((coin) => (coin.id === coinId ? updatedCoin : coin))
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle crypto coin');
    }
  };

  const handleDeleteCoin = async (coinId: string, coinSymbol: string) => {
    Alert.alert(
      'Delete Crypto Coin',
      `Are you sure you want to delete ${coinSymbol}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await cryptoPaymentService.deleteCryptoCoin(coinId);
              setCryptoCoins(cryptoCoins.filter((coin) => coin.id !== coinId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('✅ Success', `${coinSymbol} deleted successfully!`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete crypto coin');
            }
          },
        },
      ]
    );
  };

  const getCryptoIcon = (symbol: string): string => {
    const iconMap: Record<string, string> = {
      BTC: 'currency-btc',
      ETH: 'currency-eth',
      USDT: 'cash',
      USDC: 'cash-usd',
      LTC: 'litecoin',
      BCH: 'bitcoin',
      XRP: 'cash-multiple',
    };
    return iconMap[symbol] || 'currency-usd';
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
          <Text style={styles.loadingText}>Loading crypto settings...</Text>
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
          <Text style={styles.headerTitle}>Crypto Payment Settings</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('CryptoPaymentConfirmation');
            }}
          >
            <Icon name="payment" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* BTCPay Server Configuration */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="cloud" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>BTCPay Server Configuration</Text>
            </View>
            
            <GradientCard
              colors={[colors.primary, colors.secondary]}
              style={styles.btcpayCard}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Server URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://btcpay.example.com"
                  value={btcpayServerUrl}
                  onChangeText={setBtcpayServerUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                  placeholderTextColor={colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>API Key *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your BTCPay API Key"
                  value={btcpayApiKey}
                  onChangeText={setBtcpayApiKey}
                  autoCapitalize="none"
                  secureTextEntry
                  placeholderTextColor={colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Store ID *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your BTCPay Store ID"
                  value={btcpayStoreId}
                  onChangeText={setBtcpayStoreId}
                  autoCapitalize="none"
                  placeholderTextColor={colors.gray[400]}
                />
              </View>

              {config && (
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Enable Crypto Payments</Text>
                  <Switch
                    value={isEnabled}
                    onValueChange={(value) => {
                      setIsEnabled(value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    trackColor={{ false: colors.gray[300], true: colors.success }}
                    thumbColor={colors.white}
                  />
                </View>
              )}

              <View style={styles.buttonRow}>
                <Button
                  title="Test Connection"
                  onPress={handleTestConnection}
                  variant="outline"
                  icon="wifi"
                  loading={testing}
                  style={styles.halfButton}
                />
                <Button
                  title={config ? 'Update' : 'Save'}
                  onPress={handleSaveBTCPayConfig}
                  variant="primary"
                  icon="save"
                  loading={saving}
                  style={styles.halfButton}
                />
              </View>
            </GradientCard>

            {/* BTCPay Help */}
            <View style={styles.helpCard}>
              <Icon name="info" size={20} color={colors.info} />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>How to get BTCPay credentials:</Text>
                <Text style={styles.helpText}>
                  1. Login to your BTCPay Server{'\n'}
                  2. Go to Store Settings → Access Tokens{'\n'}
                  3. Create a new API Key with required permissions{'\n'}
                  4. Copy Store ID from Store Settings
                </Text>
              </View>
            </View>
          </View>

          {/* Crypto Coins Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="monetization-on" size={24} color={colors.gold} />
              <Text style={styles.sectionTitle}>Accepted Crypto Coins</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowAddCoinModal(true);
                }}
              >
                <Icon name="add-circle" size={28} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {cryptoCoins.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="currency-bitcoin" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No crypto coins added</Text>
                <Text style={styles.emptyMessage}>
                  Add crypto coins to accept payments from agents
                </Text>
              </View>
            ) : (
              <View style={styles.coinsGrid}>
                {cryptoCoins.map((coin) => (
                  <View key={coin.id} style={[styles.coinCard, shadows.card]}>
                    <View style={styles.coinHeader}>
                      <View
                        style={[
                          styles.coinIcon,
                          { backgroundColor: `${getCryptoColor(coin.symbol)}20` },
                        ]}
                      >
                        <Icon
                          name="currency-bitcoin"
                          size={24}
                          color={getCryptoColor(coin.symbol)}
                        />
                      </View>
                      <Switch
                        value={coin.isEnabled}
                        onValueChange={() => handleToggleCoin(coin.id, coin.isEnabled)}
                        trackColor={{ false: colors.gray[300], true: colors.success }}
                        thumbColor={colors.white}
                      />
                    </View>

                    <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                    <Text style={styles.coinName}>{coin.name}</Text>
                    <EnhancedBadge
                      value={coin.network}
                      color={colors.info}
                      size="small"
                      style={styles.coinBadge}
                    />

                    <View style={styles.coinDetails}>
                      <Text style={styles.coinLabel}>Wallet:</Text>
                      <Text style={styles.coinValue} numberOfLines={1}>
                        {coin.walletAddress}
                      </Text>
                    </View>

                    <View style={styles.coinDetails}>
                      <Text style={styles.coinLabel}>Range:</Text>
                      <Text style={styles.coinValue}>
                        ₦{coin.minAmount.toLocaleString()} - ₦{coin.maxAmount.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.coinDetails}>
                      <Text style={styles.coinLabel}>Confirmations:</Text>
                      <Text style={styles.coinValue}>{coin.confirmationsRequired}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteCoinButton}
                      onPress={() => handleDeleteCoin(coin.id, coin.symbol)}
                    >
                      <Icon name="delete" size={20} color={colors.error} />
                      <Text style={styles.deleteCoinText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Add Coin Modal */}
        <Modal
          visible={showAddCoinModal}
          onClose={() => setShowAddCoinModal(false)}
          title="Add Crypto Coin"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Symbol * (e.g., BTC, ETH)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="BTC"
                value={newCoinSymbol}
                onChangeText={setNewCoinSymbol}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Bitcoin"
                value={newCoinName}
                onChangeText={setNewCoinName}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Network *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Bitcoin Mainnet"
                value={newCoinNetwork}
                onChangeText={setNewCoinNetwork}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Wallet Address *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="bc1q..."
                value={newCoinWallet}
                onChangeText={setNewCoinWallet}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Min Amount (₦)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="10"
                value={newCoinMinAmount}
                onChangeText={setNewCoinMinAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Max Amount (₦)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="1000000"
                value={newCoinMaxAmount}
                onChangeText={setNewCoinMaxAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Confirmations Required</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="3"
                value={newCoinConfirmations}
                onChangeText={setNewCoinConfirmations}
                keyboardType="numeric"
              />
            </View>

            <Button
              title="Add Crypto Coin"
              onPress={handleAddCryptoCoin}
              variant="primary"
              icon="add"
              loading={saving}
            />
          </ScrollView>
        </Modal>

        {/* Success Animation */}
        {showSuccess && (
          <LottieSuccess size={200} onComplete={() => setShowSuccess(false)} />
        )}

        {/* Celebration */}
        {showCelebration && <ConfettiCelebration />}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  addButton: {
    padding: spacing.xs,
  },
  btcpayCard: {
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfButton: {
    flex: 1,
    marginBottom: 0,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  helpContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  helpTitle: {
    ...typography.bodySmallBold,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  helpText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  coinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  coinCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    width: '48%',
  },
  coinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  coinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinSymbol: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  coinName: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  coinBadge: {
    marginBottom: spacing.sm,
  },
  coinDetails: {
    marginBottom: spacing.xs,
  },
  coinLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  coinValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  deleteCoinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteCoinText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: spacing.md,
  },
  modalInputLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
});

export default CryptoPaymentSettingsScreen;
