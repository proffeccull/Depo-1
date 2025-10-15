import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'pending' | 'non-compliant' | 'requires-action';
  category: 'KYC' | 'AML' | 'Regulatory' | 'Security' | 'Data Privacy';
  lastChecked: string;
  nextReview?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceMetrics {
  overallScore: number;
  kycCompletion: number;
  amlAlerts: number;
  pendingReviews: number;
  complianceRate: number;
}

const ComplianceDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'non-compliant'>('all');

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      // Mock compliance items
      const mockItems: ComplianceItem[] = [
        {
          id: 'KYC-001',
          title: 'Customer KYC Verification',
          description: 'All customers must complete KYC verification process',
          status: 'compliant',
          category: 'KYC',
          lastChecked: '2024-01-15',
          nextReview: '2024-07-15',
          riskLevel: 'high',
        },
        {
          id: 'AML-001',
          title: 'Anti-Money Laundering Checks',
          description: 'Automated AML screening for all transactions',
          status: 'compliant',
          category: 'AML',
          lastChecked: '2024-01-14',
          nextReview: '2024-04-14',
          riskLevel: 'critical',
        },
        {
          id: 'REG-001',
          title: 'Regulatory Reporting',
          description: 'Monthly regulatory compliance reports submission',
          status: 'pending',
          category: 'Regulatory',
          lastChecked: '2024-01-10',
          nextReview: '2024-02-10',
          riskLevel: 'high',
        },
        {
          id: 'SEC-001',
          title: 'Data Encryption Standards',
          description: 'All sensitive data must be encrypted at rest and in transit',
          status: 'compliant',
          category: 'Security',
          lastChecked: '2024-01-12',
          nextReview: '2024-06-12',
          riskLevel: 'critical',
        },
        {
          id: 'DP-001',
          title: 'GDPR Compliance',
          description: 'Data processing must comply with GDPR requirements',
          status: 'requires-action',
          category: 'Data Privacy',
          lastChecked: '2024-01-08',
          nextReview: '2024-03-08',
          riskLevel: 'medium',
        },
      ];

      // Mock metrics
      const mockMetrics: ComplianceMetrics = {
        overallScore: 87.5,
        kycCompletion: 94.2,
        amlAlerts: 3,
        pendingReviews: 8,
        complianceRate: 91.3,
      };

      setComplianceItems(mockItems);
      setMetrics(mockMetrics);
    } catch (error) {
      Alert.alert('Error', 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item: ComplianceItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to compliance item details
    Alert.alert('Compliance Details', `Viewing ${item.title}`);
  };

  const handleTakeAction = (item: ComplianceItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to action screen based on item type
    Alert.alert('Take Action', `Taking action for ${item.title}`);
  };

  const handleGenerateReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Generate compliance report
    Alert.alert('Generate Report', 'Compliance report generation coming soon');
  };

  const filteredItems = complianceItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status === 'pending' || item.status === 'requires-action';
    if (filter === 'non-compliant') return item.status === 'non-compliant';
    return true;
  });

  const getStatusColor = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant': return colors.success;
      case 'pending': return colors.warning;
      case 'non-compliant': return colors.error;
      case 'requires-action': return colors.primary;
      default: return colors.gray[400];
    }
  };

  const getRiskColor = (risk: ComplianceItem['riskLevel']) => {
    switch (risk) {
      case 'low': return colors.success;
      case 'medium': return colors.warning;
      case 'high': return colors.error;
      case 'critical': return colors.error;
      default: return colors.gray[400];
    }
  };

  const getCategoryIcon = (category: ComplianceItem['category']) => {
    switch (category) {
      case 'KYC': return 'person';
      case 'AML': return 'security';
      case 'Regulatory': return 'gavel';
      case 'Security': return 'shield';
      case 'Data Privacy': return 'privacy-tip';
      default: return 'check-circle';
    }
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle: string,
    icon: string,
    color: string = colors.primary
  ) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderComplianceItem = ({ item }: { item: ComplianceItem }) => (
    <TouchableOpacity
      style={styles.complianceCard}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.complianceHeader}>
        <View style={styles.complianceIcon}>
          <Icon name={getCategoryIcon(item.category) as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.complianceInfo}>
          <Text style={styles.complianceTitle}>{item.title}</Text>
          <Text style={styles.complianceCategory}>{item.category}</Text>
        </View>
        <View style={styles.complianceBadges}>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.riskLevel) }]}>
            <Text style={styles.riskText}>{item.riskLevel.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.replace('-', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.complianceDescription}>{item.description}</Text>

      <View style={styles.complianceFooter}>
        <Text style={styles.complianceDate}>
          Last checked: {item.lastChecked}
        </Text>
        {item.nextReview && (
          <Text style={styles.complianceDate}>
            Next review: {item.nextReview}
          </Text>
        )}
      </View>

      {(item.status === 'pending' || item.status === 'requires-action') && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTakeAction(item)}
        >
          <Icon name="arrow-forward" size={16} color={colors.white} />
          <Text style={styles.actionButtonText}>Take Action</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterButtonText, filter === filterType && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading || !metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading compliance dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compliance Dashboard</Text>
        <TouchableOpacity onPress={handleGenerateReport}>
          <Icon name="assessment" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Compliance Score */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{metrics.overallScore}%</Text>
          <Text style={styles.scoreLabel}>Overall Compliance Score</Text>
          <View style={styles.scoreBar}>
            <View
              style={[styles.scoreFill, { width: `${metrics.overallScore}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Key Metrics */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'KYC Completion',
            `${metrics.kycCompletion}%`,
            'User verification rate',
            'verified-user',
            colors.success
          )}
          {renderMetricCard(
            'AML Alerts',
            metrics.amlAlerts,
            'Active alerts',
            'warning',
            colors.warning
          )}
          {renderMetricCard(
            'Pending Reviews',
            metrics.pendingReviews,
            'Require attention',
            'schedule',
            colors.primary
          )}
          {renderMetricCard(
            'Compliance Rate',
            `${metrics.complianceRate}%`,
            'Overall compliance',
            'check-circle',
            colors.success
          )}
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('pending', 'Pending')}
          {renderFilterButton('non-compliant', 'Non-Compliant')}
        </View>

        {/* Compliance Items */}
        <FlatList
          data={filteredItems}
          renderItem={renderComplianceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.complianceList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="check-circle" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyStateText}>No compliance items found</Text>
              <Text style={styles.emptyStateSubtext}>
                {filter === 'all' ? 'All items are compliant' : `No ${filter} items`}
              </Text>
            </View>
          }
        />
      </ScrollView>
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
  scoreSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  scoreValue: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  scoreLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  scoreFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  metricTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  metricSubtitle: {
    ...typography.caption,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: 2,
  },
  filters: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  complianceList: {
    paddingBottom: spacing.lg,
  },
  complianceCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  complianceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  complianceInfo: {
    flex: 1,
  },
  complianceTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  complianceCategory: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  complianceBadges: {
    alignItems: 'flex-end',
  },
  riskBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  riskText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  complianceDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  complianceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  complianceDate: {
    ...typography.caption,
    color: colors.gray[400],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.white,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.bodyRegular,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default ComplianceDashboardScreen;