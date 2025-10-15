
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchAvailableAgents,
  requestCoinPurchase,
  confirmPayment,
  fetchPendingPurchases,
} from '../../store/slices/coinPurchaseSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Import premium coin components
import {
  CoinBalanceWidget,
  CoinFOMOBanner,
  CoinParticleSystem,
  coinSounds,
} from '../../components/coins';
import { FadeInView } from '../../components/animated';
import { showToast } from '../../components/common/Toast';
import { useFormValidation, validators } from '../../utils/validation';
import InlineError from '../../components/common/InlineError';

const { width: screenWidth } = Dimensions.get('window');

const EnhancedCoinPurchaseScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { availableAgents, pendingPurchases, loading } = useSelector(
    (state: RootState) => state.coinPurchase
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank_transfer' | 'mobile_money' | 'cash'>('mobile_money');
  const [currentPurchase, setCurrentPurchase] = useState<any>(null);
  const [showParticleEffect, setShowParticleEffect] = useState(false);
  const [showFOMOBanner, setShowFOMOBanner] = useState(true);

  const { errors, validate, validateAll, clearErrors } = useFormValidation();

  useEffect(() => {
    dispatch(fetchAvailableAgents());
    dispatch(fetchPendingPurchases());
  }, [dispatch]);

  const handleSelectAgent = (agent: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    coinSounds.playCoinPurchase();
    setSelectedAgent(agent);
    setShowPurchaseModal(true);
    clearErrors();
  };

  const handleRequestPurchase = async () => {
    const isValid = validateAll({
      quantity: { value: quantity, validator: (v) => {
        const num = parseInt(v);
        if (isNaN(num)) return 'Invalid quantity';
        if (num < 10) return 'Minimum is 10 coins';
        if (num > 10000) return 'Maximum is 10,000 coins';
        if (num > selectedAgent.coinBalance) return `Agent only has ${selectedAgent.coinBalance} coins`;
        return null;
      }},
    });

    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await dispatch(
        requestCoinPurchase({
          agentId: selectedAgent.id,
          quantity: parseInt(quantity),
        })
      ).unwrap();

      setCurrentPurchase(result);
      setShowPurchaseModal(false);
      setShowPaymentModal(true);
      setQuantity('');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Purchase request created! Complete payment.', 'success');
      setShowParticleEffect(true);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to create purchase request');
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentPurchase) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(
        confirmPayment({
          transactionId: currentPurchase.id,
          paymentMethod: selectedPaymentMethod,
        })
      ).unwrap();

      setShowPaymentModal(false);
      setCurrentPurchase(null);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Payment confirmed! Waiting for agent verification.', 'success');
      coinSounds.playCoinRain();

      dispatch(fetchPendingPurchases());
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to confirm payment');
    }
  };

  const renderAgent = ({ item }: { item: any }) => (
    <FadeInView duration={400} delay={Math.random() * 300}>
      <TouchableOpacity
        style={styles.agentCard}
        onPress={() => handleSelectAgent(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[colors.white, colors.gray[50]]}
          style={styles.agentCardGradient}
        >
          <View style={styles.agentHeader}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentInitials}>
                {item.user.firstName[0]}{item.user.lastName[0]}
              </Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>
                {item.user.firstName} {item.user.lastName}
              </Text>
              <Text style={styles.agentCode}>Agent Code: {item.agentCode}</Text>
              <Text style={styles.agentLocation}>
                📍 {item.user.locationCity}
              </Text>
            </View>
            <View style={styles.coinStats}>
              <View style={styles.coinBalanceContainer}>
                <Icon name="monetization-on" size={16} color={colors.tertiary} />
                <Text style={styles.coinBalance}>{item.coinBalance.toLocaleString()}</Text>
              </View>
              <Text style={styles.coinLabel}>coins available</Text>
            </View>
          </View>

          <View style={styles.agentFooter}>
            <View style={styles.agentMetrics}>
              <View style={styles.metric}>
                <Icon name="star" size={14} color={colors.tertiary} />
                <Text style={styles.metricText}>{item.user.trustScore}/10</Text>
              </View>
              <View style={styles.metric}>
                <Icon name="access-time" size={14} color={colors.text.secondary} />
                <Text style={styles.metricText}>~2 min</Text>
              </View>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.price}>₦{item.pricePerCoin}/coin</Text>
              <Text style={styles.savings}>
                Save ₦{(100 - item.pricePerCoin) * 100} per 100 coins
              </Text>
            </View>
          </View>

          {/* Scarcity indicator */}
          {item.coinBalance < 1000 && (
            <View style={styles.scarcityBadge}>
              <Text style={styles.scarcityText}>⚡ Low Stock!</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </FadeInView>
  );

  const renderPendingPurchase = ({ item }: { item: any }) => (
    <FadeInView duration={300}>
      <View style={styles.pendingCard}>
        <View style={styles.pendingHeader}>
          <Icon name="hourglass-empty" size={24} color={colors.warning} />
          <View style={styles.pendingInfo}>
            <Text style={styles.pendingTitle}>
              {item.quantity.toLocaleString()} coins - ₦{item.totalPrice.toLocaleString()}
            </Text>
            <Text style={styles.pendingStatus}>
              {item.status === 'escrowed' ? 'Waiting for payment' :
               item.status === 'paid' ? 'Waiting for agent confirmation' :
               'Processing'}
            </Text>
          </View>
        </View>
        <Text style={styles.pendingTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
        <View style={styles.pendingProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: item.status === 'escrowed' ? '33%' :
                         item.status === 'paid' ? '66%' : '100%'
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.status === 'escrowed' ? 'Payment Pending' :
             item.status === 'paid' ? 'Agent Verification' : 'Complete'}
          </Text>
        </View>
      </View>
    </FadeInView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Coin Balance Widget - Always Visible */}
      <CoinBalanceWidget
        balance={user?.charityCoins || 0}
        trend="up"
        change24h={150}
        animation="pulse"
        size="medium"
        showQuickActions={true}
        onQuickAction={(action) => {
          switch (action) {
            case 'buy':
              // Already on buy screen
              break;
            case 'earn':
              navigation.navigate('GiveScreen');
              break;
            case 'spend':
              navigation.navigate('MarketplaceScreen');
              break;
            case 'history':
              navigation.navigate('CoinPurchaseHistory');
              break;
          }
        }}
      />

      {/* FOMO Banner */}
      {showFOMOBanner && (
        <CoinFOMOBanner
          message="Flash Sale! Buy 1000+ coins and get 10% bonus coins free!"
          urgency="high"
          timer={3600}
          action="Buy Now"
          reward={100}
          onPress={() => {
            setShowFOMOBanner(false);
            // Scroll to agents
          }}
        />
      )}

      {/* Particle Effects */}
      {showParticleEffect && (
        <CoinParticleSystem
          trigger={showParticleEffect}
          type="rain"
          intensity="medium"
          duration={2000}
          onComplete={() => setShowParticleEffect(false)}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Charity Coins</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CoinPurchaseHistory' as never)}>
            <Icon name="history" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <FadeInView duration={300}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.primary + '20', colors.primary + '10']}
                style={styles.statGradient}
              >
                <Icon name="account-balance-wallet" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{user?.charityCoins || 0}</Text>
                <Text style={styles.statLabel}>Your Coins</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.success + '20', colors.success + '10']}
                style={styles.statGradient}
              >
                <Icon name="trending-up" size={24} color={colors.success} />
                <Text style={styles.statValue}>+{user?.charityCoins ? Math.floor(user.charityCoins * 0.15) : 0}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.tertiary + '20', colors.tertiary + '10']}
                style={styles.statGradient}
              >
                <Icon name="local-offer" size={24} color={colors.tertiary} />
                <Text style={styles.statValue}>₦{user?.charityCoins ? (user.charityCoins * 100).toLocaleString() : '0'}</Text>
                <Text style={styles.statLabel}>Value</Text>
              </LinearGradient>
            </View>
          </View>
        </FadeInView>

        {/* Pending Purchases */}
        {pendingPurchases.length > 0 && (
          <FadeInView duration={400} delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Purchases</Text>
              <FlatList
                data={pendingPurchases}
                renderItem={renderPendingPurchase}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pendingList}
              />
            </View>
          </FadeInView>
        )}

        {/* Available Agents */}
        <FadeInView duration={500} delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Agents</Text>
            <Text style={styles.sectionSubtitle}>
              Buy coins securely from verified agents in your area
            </Text>
          </View>
        </FadeInView>

        {loading && availableAgents.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : availableAgents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="person-off" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>No Agents Available</Text>
            <Text style={styles.emptyMessage}>
              There are no agents with coins in your area right now. Try again later.
            </Text>
          </View>
        ) : (
          <FlatList
            data={availableAgents}
            renderItem={renderAgent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buy Coins</Text>

            {selectedAgent && (
              <>
                <View style={styles.agentSummary}>
                  <Text style={styles.agentSummaryText}>
                    From: {selectedAgent.user.firstName} {selectedAgent.user.lastName}
                  </Text>
                  <Text style={styles.agentSummaryText}>
                    Rate: ₦{selectedAgent.pricePerCoin}/coin
                  </Text>
                  <Text style={styles.agentSummaryText}>
                    Available: {selectedAgent.coinBalance.toLocaleString()} coins
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Quantity (coins)</Text>
                <TextInput
                  style={[styles.input, errors.quantity && styles.inputError]}
                  value={quantity}
                  onChangeText={(text) => {
                    setQuantity(text);
                    validate('quantity', text, (v) => {
                      const num = parseInt(v);
                      if (isNaN(num)) return 'Invalid quantity';
                      if (num < 10) return 'Minimum is 10 coins';
                      if (num > 10000) return 'Maximum is 10,000 coins';
                      if (num > selectedAgent.coinBalance) return `Agent only has ${selectedAgent.coinBalance} coins`;
                      return null;
                    });
                  }}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                />
                {errors.quantity && <InlineError message={errors.quantity} />}

                {quantity && !errors.quantity && (
                  <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>
                      ₦{(parseInt(quantity) * selectedAgent.pricePerCoin).toLocaleString()}
                    </Text>
                    {parseInt(quantity) >= 1000 && (
                      <Text style={styles.bonusText}>
                        🎁 Bonus: +{Math.floor(parseInt(quantity) * 0.1)} coins free!
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowPurchaseModal(false);
                      clearErrors();
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleRequestPurchase}
                    disabled={loading || !!errors.quantity || !quantity}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.confirmButtonText}>Request Purchase</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Payment</Text>

            {currentPurchase && (
              <>
                <View style={styles.instructionCard}>
                  <Icon name="info" size={24} color={colors.info} />
                  <Text style={styles.instructionText}>
                    Send ₦{currentPurchase.totalPrice.toLocaleString()} to the agent and confirm below.
                    Agent's coins are locked until payment is confirmed.
                  </Text>
                </View>

                <View style={styles.purchaseSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Coins:</Text>
                    <Text style={styles.summaryValue}>{currentPurchase.quantity.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total:</Text>
                    <Text style={styles.summaryValue}>₦{currentPurchase.totalPrice.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Expires in:</Text>
                    <Text style={[styles.summaryValue, { color: colors.warning }]}>30 minutes</Text>
                  </View>
                  {currentPurchase.quantity >= 1000 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Bonus:</Text>
                      <Text style={[styles.summaryValue, { color: colors.success }]}>
                        +{Math.floor(currentPurchase.quantity * 0.1)} coins
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  {['mobile_money', 'bank_transfer', 'cash'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethod,
                        selectedPaymentMethod === method && styles.paymentMethodSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedPaymentMethod(method as any);
                      }}
                    >
                      <Text style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method && styles.paymentMethodTextSelected,
                      ]}>
                        {method === 'mobile_money' ? '📱 Mobile Money' :
                         method === 'bank_transfer' ? '🏦 Bank Transfer' :
                         '💵 Cash'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowPaymentModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.confirmButtonText}>Confirm Payment Sent</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: spacing['4xl'],
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (screenWidth - layout.screenPadding * 2 - spacing.md * 2) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.card,
  },
  statGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  agentCard: {
    marginVertical: spacing.sm,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.card,
  },
  agentCardGradient: {
    padding: spacing.lg,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInitials: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  agentInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  agentName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  agentCode: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  agentLocation: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  coinStats: {
    alignItems: 'flex-end',
  },
  coinBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  coinBalance: {
    ...typography.h3,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  coinLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  agentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  agentMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  metricText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.h4,
    color: colors.success,
    fontWeight: 'bold',
  },
  savings: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  scarcityBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  scarcityText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  pendingList: {
    paddingVertical: spacing.sm,
  },
  pendingCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 300,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    ...shadows.card,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pendingInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  pendingTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  pendingStatus: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  pendingTime: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  pendingProgress: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    minHeight: 400,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  agentSummary: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  agentSummaryText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputLabel: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.sm,
    ...typography.body,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.white,
  },
  totalAmount: {
    ...typography.h1,
    color: colors.white,
    marginTop: spacing.xs,
    fontWeight: 'bold',
  },
  bonusText: {
    ...typography.bodySmall,
    color: colors.white,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
  instructionCard: {
    backgroundColor: colors.info + '20',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.info,
    marginLeft: spacing.sm,
    flex: 1,
  },
  purchaseSummary: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.h4,
    color: colors.text.primary,
  },
  paymentMethods: {
    gap: spacing.sm,
  },
  paymentMethod: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
  },
  paymentMethodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentMethodText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  paymentMethodTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default EnhancedCoinPurchaseScreen;