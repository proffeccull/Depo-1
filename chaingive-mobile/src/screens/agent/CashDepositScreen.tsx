import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  CountUpAnimation,
  LottieSuccess,
  ConfettiCelebration,
  FloatingHearts,
} from '../../components/animations';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';

const CashDepositScreen: React.FC = () => {
  const navigation = useNavigation();
  const [lookupPhone, setLookupPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const calculateCommission = (depositAmount: number) => {
    return depositAmount * 0.02; // 2% commission
  };

  const handleSubmit = () => {
    if (!lookupPhone.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter user phone number');
      return;
    }

    const depositAmount = Number(amount);
    if (!amount || depositAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const commission = calculateCommission(depositAmount);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setShowCelebration(false);
        
        Alert.alert(
          '💰 Deposit Successful!',
          `Amount: ₦${depositAmount.toLocaleString()}\n` +
          `Your Commission: ₦${commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n` +
          `User has been credited successfully!`,
          [
            {
              text: 'Done',
              onPress: () => {
                setLookupPhone('');
                setAmount('');
                navigation.goBack();
              },
            },
          ]
        );
      }, 2500);
      
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  const depositAmount = Number(amount) || 0;
  const commission = calculateCommission(depositAmount);

  return (
    <PageTransition type="slideUp">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cash Deposit</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions */}
          <View style={[styles.instructionsCard, shadows.medium]}>
            <Icon name="account-balance-wallet" size={24} color={colors.success} />
            <View style={styles.instructionsContent}>
              <Text style={styles.instructionsTitle}>Receive Cash Deposit</Text>
              <Text style={styles.instructionsText}>
                Accept cash from users and credit their ChainGive wallet
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, shadows.medium]}>
            <Input
              label="User Phone Number"
              value={lookupPhone}
              onChangeText={setLookupPhone}
              keyboardType="phone-pad"
              placeholder="e.g., 08012345678"
              icon="phone"
              editable={!loading}
            />

            <Input
              label="Amount (₦)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              icon="attach-money"
              editable={!loading}
              style={styles.amountInput}
            />

            {/* Commission Preview */}
            {depositAmount > 0 && (
              <View style={styles.commissionCard}>
                <View style={styles.commissionRow}>
                  <Text style={styles.commissionLabel}>Deposit Amount:</Text>
                  <CountUpAnimation
                    value={depositAmount}
                    style={styles.commissionAmount}
                    prefix="₦"
                    decimals={0}
                  />
                </View>
                <View style={styles.commissionDivider} />
                <View style={styles.commissionRow}>
                  <Text style={styles.commissionLabel}>Your Commission (2%):</Text>
                  <CountUpAnimation
                    value={commission}
                    style={styles.commissionValue}
                    prefix="₦"
                    decimals={2}
                  />
                </View>
              </View>
            )}

            <Button
              label={loading ? 'Processing...' : 'Log Deposit'}
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              icon="check-circle"
              className="mt-4"
            />
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, shadows.small]}>
            <Icon name="info" size={20} color={colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoText}>
                1. User gives you cash{'\n'}
                2. Enter their phone and amount{'\n'}
                3. Submit to credit their wallet{'\n'}
                4. Earn 2% commission instantly
              </Text>
            </View>
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmountsSection}>
            <Text style={styles.quickAmountsTitle}>Quick Amounts</Text>
            <View style={styles.quickAmountsGrid}>
              {[1000, 2000, 5000, 10000, 20000, 50000].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    depositAmount === quickAmount && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAmount(quickAmount.toString());
                  }}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      depositAmount === quickAmount && styles.quickAmountTextActive,
                    ]}
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Success Animation */}
        {showSuccess && (
          <LottieSuccess size={200} onComplete={() => setShowSuccess(false)} />
        )}

        {/* Celebration */}
        {showCelebration && (
          <>
            <ConfettiCelebration />
            <FloatingHearts count={12} />
          </>
        )}
      </SafeAreaView>
    </PageTransition>
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: colors.success + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  instructionsContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  instructionsTitle: {
    ...typography.bodyBold,
    color: colors.success,
    marginBottom: spacing.xxs,
  },
  instructionsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  amountInput: {
    marginTop: spacing.md,
  },
  commissionCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commissionLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  commissionAmount: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  commissionDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  commissionValue: {
    ...typography.h3,
    color: colors.success,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  quickAmountsSection: {
    marginBottom: spacing.lg,
  },
  quickAmountsTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  quickAmountButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAmountText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  quickAmountTextActive: {
    color: colors.white,
  },
});

export default CashDepositScreen;
