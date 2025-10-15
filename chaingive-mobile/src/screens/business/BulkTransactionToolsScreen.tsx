import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
// import * as DocumentPicker from 'expo-document-picker'; // TODO: Install expo-document-picker

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface BulkTransaction {
  id: string;
  name: string;
  type: 'payment' | 'transfer' | 'payout';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  createdAt: string;
  completedAt?: string;
}

interface TransactionTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  sampleFile: string;
}

const BulkTransactionToolsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<BulkTransaction[]>([]);
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'history') {
        await loadTransactions();
      } else {
        await loadTemplates();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    // Mock data - replace with actual API call
    const mockTransactions: BulkTransaction[] = [
      {
        id: 'BULK-001',
        name: 'Employee Salary Payments',
        type: 'payment',
        status: 'completed',
        totalRecords: 150,
        processedRecords: 150,
        createdAt: '2024-01-15 09:00',
        completedAt: '2024-01-15 09:30',
      },
      {
        id: 'BULK-002',
        name: 'Vendor Payouts Q4',
        type: 'payout',
        status: 'processing',
        totalRecords: 75,
        processedRecords: 45,
        createdAt: '2024-01-15 14:00',
      },
      {
        id: 'BULK-003',
        name: 'Customer Refunds',
        type: 'transfer',
        status: 'failed',
        totalRecords: 25,
        processedRecords: 18,
        createdAt: '2024-01-14 16:30',
      },
    ];
    setTransactions(mockTransactions);
  };

  const loadTemplates = async () => {
    // Mock data - replace with actual API call
    const mockTemplates: TransactionTemplate[] = [
      {
        id: 'TEMP-001',
        name: 'Bulk Payment Template',
        description: 'Process multiple payments to different recipients',
        fields: ['recipient_name', 'recipient_email', 'amount', 'currency', 'description'],
        sampleFile: 'bulk_payments_sample.csv',
      },
      {
        id: 'TEMP-002',
        name: 'Employee Salary Template',
        description: 'Monthly salary payments for employees',
        fields: ['employee_id', 'employee_name', 'account_number', 'salary_amount', 'department'],
        sampleFile: 'employee_salary_sample.csv',
      },
      {
        id: 'TEMP-003',
        name: 'Vendor Payout Template',
        description: 'Bulk payouts to vendors and suppliers',
        fields: ['vendor_id', 'vendor_name', 'invoice_number', 'payout_amount', 'due_date'],
        sampleFile: 'vendor_payout_sample.csv',
      },
    ];
    setTemplates(mockTemplates);
  };

  const handleUploadFile = async (template: TransactionTemplate) => {
    // TODO: Install and implement expo-document-picker
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Upload File', `File upload functionality coming soon. Template: ${template.name}`);
  };

  const handleDownloadTemplate = (template: TransactionTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Download template file
    Alert.alert('Download Template', `Downloading ${template.sampleFile}`);
  };

  const handleViewTransaction = (transaction: BulkTransaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to transaction details
    Alert.alert('Transaction Details', `Viewing ${transaction.name}`);
  };

  const handleRetryTransaction = async (transaction: BulkTransaction) => {
    if (transaction.status !== 'failed') return;

    Alert.alert(
      'Retry Transaction',
      'Are you sure you want to retry this bulk transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            try {
              // TODO: Implement retry API call
              setTransactions(prev =>
                prev.map(t =>
                  t.id === transaction.id ? { ...t, status: 'processing' } : t
                )
              );
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Error', 'Failed to retry transaction');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: BulkTransaction['status']) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'processing': return colors.warning;
      case 'pending': return colors.primary;
      case 'failed': return colors.error;
      default: return colors.gray[400];
    }
  };

  const getTypeIcon = (type: BulkTransaction['type']) => {
    switch (type) {
      case 'payment': return 'payment';
      case 'transfer': return 'swap-horiz';
      case 'payout': return 'account-balance-wallet';
      default: return 'receipt';
    }
  };

  const renderTransaction = ({ item: transaction }: { item: BulkTransaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => handleViewTransaction(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Icon name={getTypeIcon(transaction.type) as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>{transaction.name}</Text>
          <Text style={styles.transactionId}>{transaction.id}</Text>
        </View>
        <View style={styles.transactionActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{transaction.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionProgress}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {transaction.processedRecords} of {transaction.totalRecords} processed
          </Text>
          <Text style={styles.progressPercent}>
            {Math.round((transaction.processedRecords / transaction.totalRecords) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(transaction.processedRecords / transaction.totalRecords) * 100}%`,
                backgroundColor: getStatusColor(transaction.status),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.transactionFooter}>
        <Text style={styles.transactionTime}>
          Created: {transaction.createdAt}
        </Text>
        {transaction.completedAt && (
          <Text style={styles.transactionTime}>
            Completed: {transaction.completedAt}
          </Text>
        )}
        {transaction.status === 'failed' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRetryTransaction(transaction)}
          >
            <Icon name="refresh" size={16} color={colors.primary} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTemplate = ({ item: template }: { item: TransactionTemplate }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateIcon}>
          <Icon name="description" size={24} color={colors.primary} />
        </View>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateDescription}>{template.description}</Text>
        </View>
      </View>

      <View style={styles.templateFields}>
        <Text style={styles.fieldsLabel}>Required Fields:</Text>
        <View style={styles.fieldsList}>
          {template.fields.map((field, index) => (
            <View key={field} style={styles.fieldChip}>
              <Text style={styles.fieldText}>{field.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.templateActions}>
        <TouchableOpacity
          style={[styles.templateButton, styles.downloadButton]}
          onPress={() => handleDownloadTemplate(template)}
        >
          <Icon name="download" size={16} color={colors.primary} />
          <Text style={styles.downloadButtonText}>Download Template</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.templateButton, styles.uploadButton]}
          onPress={() => handleUploadFile(template)}
        >
          <Icon name="upload" size={16} color={colors.white} />
          <Text style={styles.uploadButtonText}>Upload File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabButton = (tab: typeof activeTab, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bulk Transaction Tools</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {renderTabButton('history', 'Transaction History')}
        {renderTabButton('templates', 'Templates')}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : activeTab === 'history' ? (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="history" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyStateText}>No bulk transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your bulk transaction history will appear here
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={templates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="description" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyStateText}>No templates available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Templates will help you format your bulk transactions
                </Text>
              </View>
            }
          />
        )}
      </View>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    padding: spacing.md,
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  transactionId: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  transactionActions: {
    alignItems: 'flex-end',
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
  transactionProgress: {
    marginBottom: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  progressPercent: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionTime: {
    ...typography.caption,
    color: colors.gray[400],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.primary + '10',
    borderRadius: 6,
  },
  retryButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xxs,
    fontWeight: '500',
  },
  templateCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  templateDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: 2,
  },
  templateFields: {
    marginBottom: spacing.md,
  },
  fieldsLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  fieldsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fieldChip: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  fieldText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  downloadButton: {
    backgroundColor: colors.primary + '10',
  },
  downloadButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: colors.primary,
  },
  uploadButtonText: {
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

export default BulkTransactionToolsScreen;