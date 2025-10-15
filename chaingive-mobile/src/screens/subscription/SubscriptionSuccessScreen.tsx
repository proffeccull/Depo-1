import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { EnhancedButton } from '../../components/common/EnhancedButton';
import { DonationSuccessAnimation } from '../../components/animations/DonationSuccessAnimation';
import { ConfettiCelebration } from '../../components/animations/ConfettiCelebration';

interface SubscriptionSuccessScreenProps {
  route: {
    params: {
      plan: any;
    };
  };
  navigation: any;
}

const SubscriptionSuccessScreen: React.FC<SubscriptionSuccessScreenProps> = ({ route, navigation }) => {
  const { plan } = route.params;

  useEffect(() => {
    // Auto-navigate after 5 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const handleContinue = () => {
    navigation.navigate('Home');
  };

  const handleManageSubscription = () => {
    navigation.navigate('SubscriptionManagement');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ConfettiCelebration />
      
      <View style={styles.animationContainer}>
        <DonationSuccessAnimation />
      </View>

      <View style={styles.successContent}>
        <Text style={styles.successTitle}>🎉 Welcome to Premium!</Text>
        <Text style={styles.successSubtitle}>
          You've successfully subscribed to {plan.displayName}
        </Text>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Your Premium Benefits</Text>
          
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🪙</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{plan.coinMultiplier}x Coin Earnings</Text>
              <Text style={styles.benefitDescription}>
                Earn {plan.coinMultiplier} times more coins from all your donations
              </Text>
            </View>
          </View>

          {plan.features.priorityMatching && (
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Priority Matching</Text>
                <Text style={styles.benefitDescription}>
                  Get matched with donors faster than regular users
                </Text>
              </View>
            </View>
          )}

          {plan.features.exclusiveMarketplace && (
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🛍️</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Exclusive Marketplace</Text>
                <Text style={styles.benefitDescription}>
                  Access premium items and exclusive deals
                </Text>
              </View>
            </View>
          )}

          {plan.features.zeroTransactionFees && (
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>💸</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Zero Transaction Fees</Text>
                <Text style={styles.benefitDescription}>
                  No fees on donations and marketplace purchases
                </Text>
              </View>
            </View>
          )}

          {plan.features.earlyAccess && (
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Early Access</Text>
                <Text style={styles.benefitDescription}>
                  Be the first to try new features and updates
                </Text>
              </View>
            </View>
          )}

          {plan.features.dedicatedSupport && (
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🎧</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Dedicated Support</Text>
                <Text style={styles.benefitDescription}>
                  Priority customer support with faster response times
                </Text>
              </View>
            </View>
          )}

          {plan.features.advancedAnalytics && (
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>📊</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Advanced Analytics</Text>
                <Text style={styles.benefitDescription}>
                  Detailed insights into your giving impact and trends
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          
          <View style={styles.nextStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Start earning {plan.coinMultiplier}x coins on your next donation
            </Text>
          </View>
          
          <View style={styles.nextStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Explore the exclusive marketplace for premium items
            </Text>
          </View>
          
          <View style={styles.nextStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Manage your subscription anytime in your profile
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <EnhancedButton
            title="Continue to Home"
            onPress={handleContinue}
            variant="primary"
          />
          
          <EnhancedButton
            title="Manage Subscription"
            onPress={handleManageSubscription}
            variant="secondary"
          />
        </View>

        <Text style={styles.autoRedirectText}>
          You'll be automatically redirected to home in a few seconds...
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  animationContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  successTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  benefitsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  nextStepsCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  nextStepsTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumber: {
    ...typography.bodyBold,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.md,
  },
  stepText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  autoRedirectText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SubscriptionSuccessScreen;