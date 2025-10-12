import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
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
  LottieError,
  ConfettiCelebration,
} from '../../components/animations';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import Modal from '../../components/common/Modal';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/skeletons';
import { adminService } from '../../services';

interface Dispute {
  id: string;
  type: string;
  description: string;
  reportedBy: string;
  reportedUser: string;
  amount?: number;
  status: 'pending' | 'resolved' | 'escalated';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

const DisputeManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const disputes = await adminService.getPendingDisputes();
      setDisputes(disputes);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load disputes:', error);
      Alert.alert('Error', 'Failed to load disputes');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadDisputes();
    setRefreshing(false);
  };

  const handleDisputePress = (dispute: Dispute) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDispute(dispute);
    setShowResolveModal(true);
  };

  const handleResolveDispute = async (decision: 'approve' | 'reject' | 'escalate') => {
    if (!selectedDispute) return;

    if (!resolution.trim() && decision !== 'escalate') {
      Alert.alert('Error', 'Please provide a resolution comment');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await adminService.resolveDispute(selectedDispute.id, {
        decision,
        comment: resolution,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResolveModal(false);
      setResolution('');
      setSelectedDispute(null);
      
      setShowSuccess(true);
      setShowCelebration(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowCelebration(false);
      }, 2500);

      Alert.alert('Success', `Dispute ${decision}d successfully`);
      loadDisputes();
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve dispute');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.info;
    }
  };

  const renderDispute = ({ item: dispute }: { item: Dispute }) => (
    <TouchableOpacity
      style={[
        styles.disputeCard,
        shadows.medium,
        dispute.priority === 'high' && styles.highPriorityCard,
      ]}
      onPress={() => handleDisputePress(dispute)}
    >
      <View style={styles.disputeHeader}>
        <View style={styles.disputeType}>
          <Icon name="gavel" size={20} color={getPriorityColor(dispute.priority)} />
          <Text style={styles.disputeTypeText}>{dispute.type}</Text>
        </View>
        <EnhancedBadge
          value={dispute.priority.toUpperCase()}
          color={getPriorityColor(dispute.priority)}
          size="small"
          pulse={dispute.priority === 'high'}
        />
      </View>

      <Text style={styles.disputeDescription} numberOfLines={2}>
        {dispute.description}
      </Text>

      <View style={styles.disputeMeta}>
        <View style={styles.metaRow}>
          <Icon name="person" size={14} color={colors.text.tertiary} />
          <Text style={styles.metaText}>Reported by: {dispute.reportedBy}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="account-circle" size={14} color={colors.text.tertiary} />
          <Text style={styles.metaText}>Against: {dispute.reportedUser}</Text>
        </View>
      </View>

      {dispute.amount && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Disputed Amount:</Text>
          <CountUpAnimation
            value={dispute.amount}
            style={styles.amountValue}
            prefix="₦"
            decimals={0}
          />
        </View>
      )}

      <Text style={styles.disputeTime}>
        {new Date(dispute.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Dispute Management</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="gavel" size={24} color={colors.warning} />
            <CountUpAnimation
              value={disputes.length}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>Total Disputes</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="priority-high" size={24} color={colors.error} />
            <CountUpAnimation
              value={disputes.filter(d => d.priority === 'high').length}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
        </View>

        {/* Dispute List */}
        <FlatList
          data={disputes}
          renderItem={renderDispute}
          keyExtractor={(item) => item.id}
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
          ListEmptyComponent={
            loading ? (
              <View>
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} height={180} style={styles.skeletonCard} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="check-circle" size={64} color={colors.success} />
                <Text style={styles.emptyTitle}>No disputes</Text>
                <Text style={styles.emptyMessage}>
                  All disputes have been resolved!
                </Text>
              </View>
            )
          }
        />

        {/* Resolve Modal */}
        <Modal
          visible={showResolveModal}
          onClose={() => {
            setShowResolveModal(false);
            setResolution('');
          }}
          title="Resolve Dispute"
        >
          {selectedDispute && (
            <View>
              <Text style={styles.modalDescription}>{selectedDispute.description}</Text>
              
              <TextInput
                style={styles.resolutionInput}
                placeholder="Enter resolution comments..."
                value={resolution}
                onChangeText={setResolution}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <Button
                  label="Approve"
                  onPress={() => handleResolveDispute('approve')}
                  variant="primary"
                  icon="check"
                  className="mb-0"
                />
                <Button
                  label="Reject"
                  onPress={() => handleResolveDispute('reject')}
                  variant="premium"
                  icon="close"
                  className="mb-0"
                />
                <Button
                  label="Escalate"
                  onPress={() => handleResolveDispute('escalate')}
                  variant="outline"
                  icon="arrow-upward"
                  className="mb-0"
                />
              </View>
            </View>
          )}
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
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activeFilterTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
  },
  disputeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  highPriorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  disputeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  disputeTypeText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  disputeDescription: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  disputeMeta: {
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning + '10',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  amountLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  amountValue: {
    ...typography.bodyBold,
    color: colors.error,
  },
  disputeTime: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  modalDescription: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  resolutionInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.md,
    minHeight: 100,
  },
  modalActions: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
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
  },
  skeletonCard: {
    marginBottom: spacing.md,
  },
});

export default DisputeManagementScreen;
