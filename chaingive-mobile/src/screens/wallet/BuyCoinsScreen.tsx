import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import { locationService, NearbyAgent } from '../../services/locationService';
import { walletService } from '../../services/walletService';
import Input from '../../components/common/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/common/Modal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  ConfettiCelebration,
  PulseRing,
  CountUpAnimation,
  PageTransition,
  LottieSuccess,
  FloatingHearts,
} from '../../components/animations';

const { width: screenWidth } = Dimensions.get('window');

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';

const BuyCoinsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [agents, setAgents] = useState<NearbyAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<NearbyAgent | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [requesting, setRequesting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedCoins, setPurchasedCoins] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [purchasedCoins, setPurchasedCoins] = useState(0);

  const suggestedAmounts = [1000, 2000, 5000, 10000];

  useEffect(() => {
    fetchNearbyAgents();
  }, []);

  const fetchNearbyAgents = async () => {
    try {
      setLoading(true);
      const response = await locationService.findNearbyAgents({
        // Can add user location here
        city: user?.city,
        state: user?.state,
      });
      setAgents(response.agents);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchNearbyAgents();
    setRefreshing(false);
  };

  const handleAgentConfirmation = (coins: number) => {
    // This would be called when agent confirms payment
    setPurchasedCoins(coins);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowConfetti(true);
    }, 1000);
    
    setTimeout(() => {
      setShowHearts(true);
    }, 1500);
  };

  const handleSelectAgent = (agent: NearbyAgent) => {
    setSelectedAgent(agent);
    setShowPurchaseModal(true);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleRequestCoins = async () => {
    if (!selectedAgent) return;

    const purchaseAmount = parseInt(amount);

    if (!purchaseAmount || purchaseAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (purchaseAmount < 500) {
      Alert.alert('Error', 'Minimum purchase amount is ₦500');
      return;
    }

    if (purchaseAmount > selectedAgent.availableCoins) {
      Alert.alert('Error', `Agent only has ${formatCurrency(selectedAgent.availableCoins)} available`);
      return;
    }

    setRequesting(true);
    try {
      const response = await walletService.requestAgentCoinPurchase({
        agentId: selectedAgent.id,
        amount: purchaseAmount,
        paymentMethod,
      });

      setShowPurchaseModal(false);
      
      Alert.alert(
        'Request Sent!',
        `Your coin purchase request has been sent to ${selectedAgent.firstName}.\n\n` +
        `Amount: ${formatCurrency(purchaseAmount)}\n` +
        `Agent's coins are now locked in escrow.\n\n` +
        `Next Steps:\n` +
        `1. Send ${formatCurrency(purchaseAmount)} to the agent via ${paymentMethod}\n` +
        `2. Agent confirms payment received\n` +
        `3. You get credited automatically\n\n` +
        `Agent Contact: ${selectedAgent.phoneNumber}`,
        [
          {
            text: 'View Pending',
            onPress: () => navigation.navigate('PendingCoinPurchases'),
          },
          {
            text: 'OK',
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to request coins');
    } finally {
      setRequesting(false);
    }
  };

  const renderAgentCard = ({ item: agent }: { item: NearbyAgent }) => (
    <TouchableOpacity
      style={styles.agentCard}
      onPress={() => handleSelectAgent(agent)}
    >
      <View style={styles.agentAvatar}>
        <Icon name="person" size={32} color={colors.primary} />
        {agent.isOnline && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.agentInfo}>
        <View style={styles.agentHeader}>
          <Text style={styles.agentName}>
            {agent.firstName} {agent.lastName}
          </Text>
          {agent.isOnline && (
            <View style={styles.onlineTag}>
              <Text style={styles.onlineTagText}>Online</Text>
            </View>
          )}
        </View>
        
        <View style={styles.agentDetails}>
          <View style={styles.agentDetailRow}>
            <Icon name="location-on" size={14} color={colors.text.secondary} />
            <Text style={styles.agentDetailText}>
              {agent.location.city}, {agent.location.state}
            </Text>
          </View>
          
          <View style={styles.agentDetailRow}>
            <Icon name="star" size={14} color={colors.tertiary} />
            <Text style={styles.agentDetailText}>
              {agent.rating.toFixed(1)} ({agent.totalTransactions} transactions)
            </Text>
          </View>
          
          <View style={styles.agentDetailRow}>
            <Icon name="account-balance-wallet" size={14} color={colors.success} />
            <Text style={styles.agentDetailText}>
              Available: {formatCurrency(agent.availableCoins)}
            </Text>
          </View>
        </View>
      </View>
      
      <Icon name="chevron-right" size={24} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyStateTitle}>No Agents Available</Text>
      <Text style={styles.emptyStateSubtitle}>
        No agents found in your area. Try again later.
      </Text>
      <Button
        label="Refresh"
        onPress={fetchNearbyAgents}
        variant="outline"
        className="min-w-[120px]"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Coins from Agent</Text>
        <TouchableOpacity
          style={styles.pendingButton}
          onPress={() => navigation.navigate('PendingCoinPurchases')}
        >
          <Icon name="pending" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Icon name="info" size={20} color={colors.info} />
          <Text style={styles.infoTitle}>How It Works</Text>
        </View>
        <Text style={styles.infoText}>
          1. Select an agent near you{'\n'}
          2. Enter amount you want to buy{'\n'}
          3. Agent's coins are locked in escrow{'\n'}
          4. Send cash/payment to agent{'\n'}
          5. Agent confirms and releases coins{'\n'}
          6. You get credited automatically!
        </Text>
      </View>

      {/* Agents List */}
      <FlatList
        data={agents}
        renderItem={renderAgentCard}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={loading ? null : renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title={`Buy from ${selectedAgent?.firstName}`}
      >
        {selectedAgent && (
          <View>
            {/* Agent Info */}
            <View style={styles.modalAgentInfo}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Agent:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedAgent.firstName} {selectedAgent.lastName}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Phone:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedAgent.phoneNumber}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Location:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedAgent.location.city}, {selectedAgent.location.state}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Available:</Text>
                <Text style={[styles.modalInfoValue, { color: colors.success }]}>
                  {formatCurrency(selectedAgent.availableCoins)}
                </Text>
              </View>
            </View>

            {/* Amount Input */}
            <Input
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="Enter amount"
              keyboardType="numeric"
              icon="money"
              label="Amount (₦)"
              required
            />

            {/* Quick Amounts */}
            <Text style={styles.quickAmountLabel}>Quick amounts:</Text>
            <View style={styles.suggestedAmounts}>
              {suggestedAmounts.map((suggested) => (
                <TouchableOpacity
                  key={suggested}
                  style={[
                    styles.suggestedButton,
                    amount === suggested.toString() && styles.suggestedButtonActive,
                  ]}
                  onPress={() => setAmount(suggested.toString())}
                >
                  <Text
                    style={[
                      styles.suggestedButtonText,
                      amount === suggested.toString() && styles.suggestedButtonTextActive,
                    ]}
                  >
                    {formatCurrency(suggested)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Method */}
            <Text style={styles.sectionLabel}>Payment Method:</Text>
            <View style={styles.paymentMethods}>
              {(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY'] as PaymentMethod[]).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === method && styles.paymentMethodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method && styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Request Button */}
            <Button
              label={`Request ${amount ? formatCurrency(parseInt(amount)) : '₦0'}`}
              onPress={handleRequestCoins}
              loading={requesting}
              disabled={!amount || parseInt(amount) <= 0}
              className="mt-2"
            />
          </View>
        )}
      </Modal>

      {/* Premium Animations */}
      <LottieSuccess
        visible={showSuccess}
        onAnimationFinish={() => setShowSuccess(false)}
      />

      <ConfettiCelebration
        visible={showConfetti}
        message="💰 Coins Received!"
        submessage={`${purchasedCoins} coins added to your balance`}
        onComplete={() => {
          setShowConfetti(false);
          navigation.goBack();
        }}
        confettiCount={200}
      />

      {showHearts && (
        <FloatingHearts
          count={20}
          duration={3000}
          startX={screenWidth / 2}
          startY={200}
          color={colors.gold}
        />
      )}
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
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  pendingButton: {
    padding: spacing.xs,
  },
  infoCard: {
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: `${colors.info}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.info}30`,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.label,
    color: colors.info,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  listContent: {
    padding: layout.screenPadding,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  agentContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseContainer: {
    position: 'absolute',
    top: -5,
    left: -5,
  },
  onlineBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  agentInfo: {
    flex: 1,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  agentName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  onlineTag: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlineTagText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
  },
  agentDetails: {},
  agentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  agentDetailText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalAgentInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  modalInfoLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  modalInfoValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  quickAmountLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  suggestedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  suggestedButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
  },
  suggestedButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  suggestedButtonText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  suggestedButtonTextActive: {
    color: colors.white,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  paymentMethodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  paymentMethodText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  paymentMethodTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default BuyCoinsScreen;
