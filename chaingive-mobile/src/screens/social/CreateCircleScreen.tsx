import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { createGivingCircle } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { showToast } from '../../components/common/Toast';

const CreateCircleScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { balance } = useSelector((state: RootState) => state.coin);
  const { loading } = useSelector((state: RootState) => state.social);

  const [circleName, setCircleName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'invite-only'>('public');
  const [isPremium, setIsPremium] = useState(false);
  const [prizePool, setPrizePool] = useState('');

  const creationCost = isPremium ? 200 : 50; // coins
  const canAfford = balance.current >= creationCost;

  const handleCreateCircle = async () => {
    if (!circleName.trim()) {
      showToast('Please enter a circle name', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    if (!canAfford) {
      showToast('Insufficient coins to create this circle', 'error');
      return;
    }

    if (isPremium && (!prizePool || parseInt(prizePool) < 1000)) {
      showToast('Premium circles need at least 1,000 coins in prize pool', 'error');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const circleData = {
        name: circleName.trim(),
        description: description.trim(),
        privacy,
        isPremium,
        ...(isPremium && { prizePool: parseInt(prizePool) }),
      };

      await dispatch(createGivingCircle(circleData)).unwrap();

      showToast('Circle created successfully!', 'success');
      navigation.goBack();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to create circle', 'error');
    }
  };

  const privacyOptions = [
    {
      value: 'public' as const,
      label: 'Public',
      description: 'Anyone can join and view',
      icon: 'public',
    },
    {
      value: 'private' as const,
      label: 'Private',
      description: 'Members only, invite required',
      icon: 'lock',
    },
    {
      value: 'invite-only' as const,
      label: 'Invite Only',
      description: 'Admin approval required',
      icon: 'person-add',
    },
  ];

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
          <Text style={styles.headerTitle}>Create Circle</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Circle Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Circle Name</Text>
          <TextInput
            style={styles.textInput}
            value={circleName}
            onChangeText={setCircleName}
            placeholder="Enter circle name"
            maxLength={50}
          />
          <Text style={styles.charCount}>{circleName.length}/50</Text>
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your circle's mission and goals..."
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        {/* Privacy Settings */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Privacy</Text>
          {privacyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.privacyOption,
                privacy === option.value && styles.privacyOptionSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPrivacy(option.value);
              }}
            >
              <View style={styles.privacyOptionContent}>
                <Icon
                  name={option.icon}
                  size={20}
                  color={privacy === option.value ? colors.white : colors.text.primary}
                />
                <View style={styles.privacyOptionText}>
                  <Text style={[
                    styles.privacyOptionTitle,
                    privacy === option.value && styles.privacyOptionTitleSelected,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.privacyOptionDescription,
                    privacy === option.value && styles.privacyOptionDescriptionSelected,
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              {privacy === option.value && (
                <Icon name="check" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium Toggle */}
        <View style={styles.inputSection}>
          <View style={styles.premiumHeader}>
            <View>
              <Text style={styles.inputLabel}>Premium Circle</Text>
              <Text style={styles.premiumDescription}>
                Advanced features, bigger prize pools, and premium visibility
              </Text>
            </View>
            <Switch
              value={isPremium}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsPremium(value);
              }}
              trackColor={{ false: colors.gray[300], true: colors.tertiary }}
              thumbColor={isPremium ? colors.white : colors.gray[400]}
            />
          </View>

          {isPremium && (
            <View style={styles.premiumFeatures}>
              <Text style={styles.premiumFeaturesTitle}>Premium Features:</Text>
              <View style={styles.featureList}>
                <View style={styles.feature}>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Custom circle themes</Text>
                </View>
                <View style={styles.feature}>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Advanced analytics</Text>
                </View>
                <View style={styles.feature}>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Bigger prize pools</Text>
                </View>
                <View style={styles.feature}>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>Admin controls</Text>
                </View>
              </View>

              {/* Prize Pool Input */}
              <View style={styles.prizePoolSection}>
                <Text style={styles.prizePoolLabel}>Prize Pool (coins)</Text>
                <TextInput
                  style={styles.prizePoolInput}
                  value={prizePool}
                  onChangeText={setPrizePool}
                  placeholder="Minimum 1,000"
                  keyboardType="numeric"
                />
                <Text style={styles.prizePoolHelp}>
                  Coins distributed to challenge winners
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Cost Summary */}
        <View style={styles.costSection}>
          <Text style={styles.costTitle}>Creation Cost</Text>
          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Base Fee</Text>
              <Text style={styles.costValue}>{isPremium ? '200' : '50'} coins</Text>
            </View>
            {isPremium && prizePool && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Prize Pool</Text>
                <Text style={styles.costValue}>{parseInt(prizePool).toLocaleString()} coins</Text>
              </View>
            )}
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {(creationCost + (isPremium && prizePool ? parseInt(prizePool) : 0)).toLocaleString()} coins
              </Text>
            </View>
          </View>

          {!canAfford && (
            <View style={styles.insufficientFunds}>
              <Icon name="warning" size={16} color={colors.error} />
              <Text style={styles.insufficientFundsText}>
                Insufficient coins. You need {creationCost - balance.current} more coins.
              </Text>
            </View>
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!canAfford || !circleName.trim() || !description.trim()) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateCircle}
          disabled={!canAfford || !circleName.trim() || !description.trim() || loading}
        >
          <Text style={[
            styles.createButtonText,
            (!canAfford || !circleName.trim() || !description.trim()) && styles.createButtonTextDisabled,
          ]}>
            {loading ? 'Creating...' : 'Create Circle'}
          </Text>
        </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  inputSection: {
    marginBottom: spacing['2xl'],
  },
  inputLabel: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: colors.white,
    color: colors.text.primary,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  privacyOption: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  privacyOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  privacyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyOptionText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  privacyOptionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  privacyOptionTitleSelected: {
    color: colors.white,
  },
  privacyOptionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  privacyOptionDescriptionSelected: {
    color: colors.white,
    opacity: 0.9,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  premiumDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    flex: 1,
    marginRight: spacing.md,
  },
  premiumFeatures: {
    backgroundColor: colors.tertiary + '10',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.tertiary + '30',
  },
  premiumFeaturesTitle: {
    ...typography.bodyBold,
    color: colors.tertiary,
    marginBottom: spacing.md,
  },
  featureList: {
    gap: spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  prizePoolSection: {
    marginTop: spacing.lg,
  },
  prizePoolLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  prizePoolInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: colors.white,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  prizePoolHelp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  costSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  costTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  costBreakdown: {
    gap: spacing.sm,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  costValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
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
  insufficientFunds: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  insufficientFundsText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  createButtonTextDisabled: {
    color: colors.gray[500],
  },
});

export default CreateCircleScreen;