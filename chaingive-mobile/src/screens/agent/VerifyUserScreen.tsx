import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
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
  LottieError,
  PulseRing,
  ShimmerEffect,
} from '../../components/animations';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const VerifyUserScreen: React.FC = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleVerify = async () => {
    if (!phoneNumber.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter a phone number to verify');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    // Simulate API call (replace with actual service call)
    setTimeout(() => {
      // Mock: Randomly succeed or fail
      const success = Math.random() > 0.3;
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setUserData({
          name: 'John Doe',
          phoneNumber: phoneNumber,
          verified: true,
          trustScore: 85,
          totalDonations: 15,
        });
        setUserFound(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
        Alert.alert('User Not Found', 'No user found with this phone number.');
      }
      
      setLoading(false);
    }, 1500);
  };

  const handleApproveVerification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Verification Approved',
      `${userData?.name} has been verified successfully!`,
      [
        {
          text: 'Done',
          onPress: () => {
            setUserFound(false);
            setUserData(null);
            setPhoneNumber('');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRejectVerification = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Reject Verification',
      'Are you sure you want to reject this verification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setUserFound(false);
            setUserData(null);
            setPhoneNumber('');
            Alert.alert('Rejected', 'Verification has been rejected.');
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Verify User</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions Card */}
          <View style={[styles.instructionsCard, shadows.medium]}>
            <Icon name="info" size={24} color={colors.primary} />
            <View style={styles.instructionsContent}>
              <Text style={styles.instructionsTitle}>User Verification</Text>
              <Text style={styles.instructionsText}>
                Enter the user's phone number to look them up and verify their identity.
              </Text>
            </View>
          </View>

          {/* Phone Input */}
          <View style={[styles.inputCard, shadows.medium]}>
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="e.g., 08012345678"
              icon="phone"
              editable={!loading && !userFound}
            />

            {!userFound && (
              <Button
                title={loading ? 'Searching...' : 'Search User'}
                onPress={handleVerify}
                loading={loading}
                variant="primary"
                icon="search"
                fullWidth
                style={styles.searchButton}
              />
            )}
          </View>

          {/* User Details (if found) */}
          {userFound && userData && (
            <View style={[styles.userCard, shadows.large]}>
              {/* User Header */}
              <View style={styles.userHeader}>
                <PulseRing size={80} color={colors.success}>
                  <View style={styles.avatar}>
                    <Icon name="person" size={40} color={colors.white} />
                  </View>
                </PulseRing>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userPhone}>{userData.phoneNumber}</Text>
                  <View style={styles.verifiedBadge}>
                    <Icon name="verified" size={16} color={colors.success} />
                    <Text style={styles.verifiedText}>Verified User</Text>
                  </View>
                </View>
              </View>

              {/* User Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Icon name="star" size={20} color={colors.gold} />
                  <Text style={styles.statValue}>{userData.trustScore}</Text>
                  <Text style={styles.statLabel}>Trust Score</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Icon name="favorite" size={20} color={colors.primary} />
                  <Text style={styles.statValue}>{userData.totalDonations}</Text>
                  <Text style={styles.statLabel}>Donations</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title="Approve Verification"
                  onPress={handleApproveVerification}
                  variant="primary"
                  icon="check-circle"
                  fullWidth
                  style={styles.approveButton}
                />
                <Button
                  title="Reject"
                  onPress={handleRejectVerification}
                  variant="outline"
                  icon="cancel"
                  fullWidth
                />
              </View>
            </View>
          )}

          {/* Tips */}
          {!userFound && (
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Verification Tips</Text>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>
                  Ensure the user shows valid ID matching their profile
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>
                  Verify phone number matches the one they provided
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>
                  Check for any suspicious activity or red flags
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Success Animation */}
        {showSuccess && (
          <LottieSuccess size={200} onComplete={() => setShowSuccess(false)} />
        )}

        {/* Error Animation */}
        {showError && (
          <LottieError size={200} onComplete={() => setShowError(false)} />
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
    backgroundColor: colors.primary + '10',
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
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  instructionsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  searchButton: {
    marginTop: spacing.md,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  userPhone: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.success,
    marginLeft: spacing.xxs,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  actionButtons: {
    gap: spacing.sm,
  },
  approveButton: {
    marginBottom: spacing.sm,
  },
  tipsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  tipsTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default VerifyUserScreen;
