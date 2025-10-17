import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import { donationService, Match } from '../../services/donationService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import {
  DonationSuccessAnimation,
  FloatingHearts,
  ConfettiCelebration,
  PageTransition,
  CountUpAnimation,
} from '../../components/animations';

const { width: screenWidth } = Dimensions.get('window');

const GiveScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [faith, setFaith] = useState('');
  const [loading, setLoading] = useState(false);
  const [findingMatch, setFindingMatch] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [recipientName, setRecipientName] = useState('');

  const userBalance = user?.balance || 0;
  const suggestedAmounts = [1000, 2000, 5000, 10000];

  const handleAmountChange = (value: string) => {
    // Only allow numbers
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

  const handleFindMatch = async () => {
    const donationAmount = parseInt(amount);

    if (!donationAmount || donationAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (donationAmount < 500) {
      Alert.alert('Error', 'Minimum donation amount is ₦500');
      return;
    }

    if (donationAmount > userBalance) {
      Alert.alert('Insufficient Balance', 'Please deposit funds to continue');
      return;
    }

    setFindingMatch(true);
    try {
      const response = await donationService.giveDonation({
        amount: donationAmount,
        recipientPreference: 'algorithm',
        location: location || undefined,
        faith: faith || undefined,
      });

      setMatch(response.match);
      setShowMatchModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to find a match');
    } finally {
      setFindingMatch(false);
    }
  };

  const handleConfirmDonation = async () => {
    if (!match) return;

    setLoading(true);
    try {
      await donationService.confirmReceipt(match.id, true);

      // Store for animations
      setCompletedAmount(match.amount);
      setRecipientName(match.recipient.firstName);
      
      // Close modal
      setShowMatchModal(false);
      
      // Trigger success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show donation success animation
      setTimeout(() => {
        setShowDonationSuccess(true);
      }, 300);
      
      // Show hearts after 500ms
      setTimeout(() => {
        setShowHearts(true);
      }, 800);
      
      // Show confetti after 2 seconds
      setTimeout(() => {
        setShowConfetti(true);
      }, 2000);
      
      // Reset form
      setAmount('');
      setLocation('');
      setFaith('');
      setMatch(null);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Give Forward</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(userBalance)}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('DepositScreen')}
          >
            <Text style={styles.addFundsText}>+ Add Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How much would you like to give?</Text>
          <Input
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Enter amount"
            keyboardType="numeric"
            icon="money"
            label="Amount (₦)"
            required
          />

          {/* Suggested Amounts */}
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
        </View>

        {/* Preferences (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Help us find the best match for you
          </Text>

          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Lagos, Abuja"
            icon="location-on"
            label="Preferred Location"
          />

          <Input
            value={faith}
            onChangeText={setFaith}
            placeholder="e.g., Christian, Muslim"
            icon="favorite"
            label="Faith Preference"
          />
        </View>

        {/* How It Works */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} color={colors.info} />
            <Text style={styles.infoTitle}>How It Works</Text>
          </View>
          <Text style={styles.infoText}>
            1. We'll match you with someone who needs help{'\n'}
            2. Funds are held in escrow for 48 hours{'\n'}
            3. Recipient confirms receipt within 48 hours{'\n'}
            4. You earn Charity Coins for giving forward!
          </Text>
        </View>

        {/* Find Match Button */}
        <Button
          title="Find a Match"
          onPress={handleFindMatch}
          loading={findingMatch}
          disabled={!amount || parseInt(amount) <= 0}
          icon="search"
          fullWidth
          style={styles.findMatchButton}
        />
      </ScrollView>

      {/* Match Modal */}
      <Modal
        visible={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        title="Match Found!"
        scrollable={false}
      >
        {match && (
          <View>
            {/* Recipient Info */}
            <View style={styles.matchCard}>
              <View style={styles.matchAvatar}>
                <Icon name="person" size={48} color={colors.primary} />
              </View>
              <Text style={styles.matchName}>
                {match.recipient.firstName} {match.recipient.lastName}
              </Text>
              <View style={styles.matchDetails}>
                <View style={styles.matchDetailRow}>
                  <Icon name="star" size={16} color={colors.tertiary} />
                  <Text style={styles.matchDetailText}>
                    Trust Score: {match.recipient.trustScore}/100
                  </Text>
                </View>
                {match.recipient.location && (
                  <View style={styles.matchDetailRow}>
                    <Icon name="location-on" size={16} color={colors.text.secondary} />
                    <Text style={styles.matchDetailText}>
                      {match.recipient.location}
                    </Text>
                  </View>
                )}
                {match.recipient.faithPreference && (
                  <View style={styles.matchDetailRow}>
                    <Icon name="favorite" size={16} color={colors.error} />
                    <Text style={styles.matchDetailText}>
                      {match.recipient.faithPreference}
                    </Text>
                  </View>
                )}
              </View>

              {/* Match Score */}
              <View style={styles.matchScore}>
                <Text style={styles.matchScoreLabel}>Match Quality</Text>
                <Text style={styles.matchScoreValue}>
                  {Math.round(match.matchScore * 100)}%
                </Text>
              </View>
            </View>

            {/* Amount Summary */}
            <View style={styles.amountSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Donation Amount:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(match.amount)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Fee:</Text>
                <Text style={styles.summaryValue}>₦0</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(match.amount)}
                </Text>
              </View>
            </View>

            {/* Confirm Buttons */}
            <Button
              title="Confirm Donation"
              onPress={handleConfirmDonation}
              loading={loading}
              fullWidth
              style={styles.confirmButton}
            />
            <Button
              title="Find Another Match"
              onPress={() => {
                setShowMatchModal(false);
                setMatch(null);
              }}
              variant="outline"
              fullWidth
            />
          </View>
        )}
      </Modal>

      {/* Premium Animations */}
      {showDonationSuccess && (
        <DonationSuccessAnimation
          amount={completedAmount}
          recipientName={recipientName}
          onComplete={() => {
            setShowDonationSuccess(false);
            navigation.navigate('Home');
          }}
        />
      )}

      {showHearts && (
        <FloatingHearts
          count={20}
          duration={3000}
          startX={screenWidth / 2}
          startY={200}
          color={colors.error}
        />
      )}

      <ConfettiCelebration
        visible={showConfetti}
        message="🎉 Thank You!"
        submessage="Your generosity makes a difference"
        onComplete={() => setShowConfetti(false)}
        confettiCount={200}
      />
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
  placeholder: {
    width: 40,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    margin: layout.screenPadding,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
  },
  balanceAmount: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
    marginVertical: spacing.sm,
  },
  addFundsText: {
    ...typography.label,
    color: colors.white,
    textDecorationLine: 'underline',
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  suggestedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestedButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
  },
  suggestedButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  suggestedButtonText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  suggestedButtonTextActive: {
    color: colors.white,
  },
  infoCard: {
    marginHorizontal: layout.screenPadding,
    padding: spacing.md,
    backgroundColor: `${colors.info}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.info}30`,
    marginBottom: spacing.lg,
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
  findMatchButton: {
    marginHorizontal: layout.screenPadding,
  },
  matchCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  matchAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  matchName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  matchDetails: {
    alignItems: 'center',
  },
  matchDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  matchDetailText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  matchScore: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: `${colors.success}10`,
    borderRadius: 12,
    alignItems: 'center',
  },
  matchScoreLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  matchScoreValue: {
    ...typography.h2,
    color: colors.success,
    fontWeight: 'bold',
  },
  amountSummary: {
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.medium,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  confirmButton: {
    marginBottom: spacing.md,
  },
});

export default GiveScreen;
