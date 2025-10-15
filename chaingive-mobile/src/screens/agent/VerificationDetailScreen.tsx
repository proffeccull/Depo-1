import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
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
  ConfettiCelebration,
  FloatingHearts,
  PulseRing,
} from '../../components/animations';
import Button from '../../components/common/Button';
import EnhancedBadge from '../../components/common/EnhancedBadge';

interface RouteParams {
  requestId: string;
}

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  verificationType: 'KYC' | 'ID' | 'AGENT';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    idCard?: string;
    selfie?: string;
    proofOfAddress?: string;
  };
  userInfo: {
    trustScore: number;
    totalDonations: number;
    accountAge: string;
  };
}

const VerificationDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadVerificationDetails();
  }, [requestId]);

  const loadVerificationDetails = async () => {
    // Simulate API call
    setTimeout(() => {
      setRequest({
        id: requestId,
        userId: 'user-123',
        userName: 'John Doe',
        userPhone: '+234 801 234 5678',
        userEmail: 'john.doe@example.com',
        verificationType: 'KYC',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        documents: {
          idCard: 'https://via.placeholder.com/400x250',
          selfie: 'https://via.placeholder.com/250x250',
          proofOfAddress: 'https://via.placeholder.com/400x250',
        },
        userInfo: {
          trustScore: 85,
          totalDonations: 12,
          accountAge: '3 months',
        },
      });
      setLoading(false);
    }, 1000);
  };

  const handleApprove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Approve Verification',
      `Are you sure you want to approve ${request?.userName}'s verification?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowSuccess(true);
            setShowCelebration(true);
            
            setTimeout(() => {
              setShowSuccess(false);
              setShowCelebration(false);
              Alert.alert(
                '✅ Verification Approved',
                `${request?.userName} has been successfully verified!`,
                [
                  {
                    text: 'Done',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            }, 2500);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.prompt(
      'Reject Verification',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: (reason) => {
            if (!reason?.trim()) {
              Alert.alert('Error', 'Please provide a reason');
              return;
            }
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setShowError(true);
            
            setTimeout(() => {
              setShowError(false);
              Alert.alert(
                '❌ Verification Rejected',
                `${request?.userName}'s verification has been rejected.`,
                [
                  {
                    text: 'Done',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            }, 2000);
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: colors.warning, icon: 'pending', label: 'Pending Review' };
      case 'approved':
        return { color: colors.success, icon: 'check-circle', label: 'Approved' };
      case 'rejected':
        return { color: colors.error, icon: 'cancel', label: 'Rejected' };
      default:
        return { color: colors.gray[500], icon: 'help', label: status };
    }
  };

  if (loading || !request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="description" size={64} color={colors.gray[300]} />
          <Text style={styles.loadingText}>Loading verification details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(request.status);

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
          <Text style={styles.headerTitle}>Verification Detail</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusConfig.color}20` },
              shadows.small,
            ]}
          >
            <Icon name={statusConfig.icon} size={20} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {/* User Info Card */}
          <View style={[styles.userCard, shadows.medium]}>
            <View style={styles.userHeader}>
              <PulseRing size={70} color={colors.primary}>
                <View style={styles.avatar}>
                  <Icon name="person" size={36} color={colors.white} />
                </View>
              </PulseRing>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{request.userName}</Text>
                <View style={styles.userMeta}>
                  <Icon name="phone" size={14} color={colors.text.secondary} />
                  <Text style={styles.userMetaText}>{request.userPhone}</Text>
                </View>
                <View style={styles.userMeta}>
                  <Icon name="email" size={14} color={colors.text.secondary} />
                  <Text style={styles.userMetaText}>{request.userEmail}</Text>
                </View>
              </View>
            </View>

            {/* User Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="star" size={18} color={colors.gold} />
                <Text style={styles.statValue}>{request.userInfo.trustScore}</Text>
                <Text style={styles.statLabel}>Trust Score</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="favorite" size={18} color={colors.primary} />
                <Text style={styles.statValue}>{request.userInfo.totalDonations}</Text>
                <Text style={styles.statLabel}>Donations</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="schedule" size={18} color={colors.info} />
                <Text style={styles.statValue}>{request.userInfo.accountAge}</Text>
                <Text style={styles.statLabel}>Account Age</Text>
              </View>
            </View>
          </View>

          {/* Documents Section */}
          <View style={[styles.documentsCard, shadows.medium]}>
            <Text style={styles.sectionTitle}>Submitted Documents</Text>

            {request.documents.idCard && (
              <View style={styles.documentItem}>
                <Text style={styles.documentLabel}>ID Card</Text>
                <Image
                  source={{ uri: request.documents.idCard }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {request.documents.selfie && (
              <View style={styles.documentItem}>
                <Text style={styles.documentLabel}>Selfie</Text>
                <Image
                  source={{ uri: request.documents.selfie }}
                  style={[styles.documentImage, styles.selfieImage]}
                  resizeMode="cover"
                />
              </View>
            )}

            {request.documents.proofOfAddress && (
              <View style={styles.documentItem}>
                <Text style={styles.documentLabel}>Proof of Address</Text>
                <Image
                  source={{ uri: request.documents.proofOfAddress }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, shadows.small]}>
            <Icon name="info" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Review all documents carefully before making a decision.
            </Text>
          </View>

          {/* Action Buttons */}
          {request.status === 'pending' && (
            <View style={styles.actionButtons}>
              <Button
                title="Approve Verification"
                onPress={handleApprove}
                variant="primary"
                icon="check-circle"
                fullWidth
                style={styles.approveButton}
              />
              <Button
                title="Reject"
                onPress={handleReject}
                variant="danger"
                icon="cancel"
                fullWidth
              />
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

        {/* Celebration */}
        {showCelebration && (
          <>
            <ConfettiCelebration />
            <FloatingHearts count={10} />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  statusText: {
    ...typography.bodyBold,
    marginLeft: spacing.sm,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  userMetaText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
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
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  documentsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  documentItem: {
    marginBottom: spacing.md,
  },
  documentLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  selfieImage: {
    height: 250,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  approveButton: {
    marginBottom: 0,
  },
});

export default VerificationDetailScreen;
