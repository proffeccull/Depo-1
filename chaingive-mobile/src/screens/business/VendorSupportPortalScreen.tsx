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

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  lastUpdated: string;
  responses: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const VendorSupportPortalScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'contact'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    } else if (activeTab === 'faq') {
      loadFAQs();
    }
  }, [activeTab]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockTickets: SupportTicket[] = [
        {
          id: 'TKT-001',
          title: 'Payment not processing',
          description: 'Customer payment is stuck in processing status',
          status: 'in-progress',
          priority: 'high',
          category: 'Payments',
          createdAt: '2024-01-15 10:30',
          lastUpdated: '2024-01-15 14:20',
          responses: 3,
        },
        {
          id: 'TKT-002',
          title: 'Product listing issue',
          description: 'Unable to update product images',
          status: 'open',
          priority: 'medium',
          category: 'Products',
          createdAt: '2024-01-14 16:45',
          lastUpdated: '2024-01-14 16:45',
          responses: 0,
        },
        {
          id: 'TKT-003',
          title: 'Order fulfillment delay',
          description: 'Orders are taking longer than expected to ship',
          status: 'resolved',
          priority: 'low',
          category: 'Shipping',
          createdAt: '2024-01-13 09:15',
          lastUpdated: '2024-01-14 11:30',
          responses: 5,
        },
      ];
      setTickets(mockTickets);
    } catch (error) {
      Alert.alert('Error', 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadFAQs = async () => {
    try {
      // Mock data - replace with actual API call
      const mockFAQs: FAQ[] = [
        {
          id: 'FAQ-001',
          question: 'How do I set up my merchant account?',
          answer: 'To set up your merchant account, go to Settings > Business Profile and complete the onboarding process.',
          category: 'Account Setup',
        },
        {
          id: 'FAQ-002',
          question: 'What payment methods are supported?',
          answer: 'We support credit/debit cards, bank transfers, and cryptocurrency payments through our integrated gateways.',
          category: 'Payments',
        },
        {
          id: 'FAQ-003',
          question: 'How do I handle refunds?',
          answer: 'Refunds can be processed from the Payment Processing section. Select the transaction and choose the refund option.',
          category: 'Payments',
        },
        {
          id: 'FAQ-004',
          question: 'What are the shipping requirements?',
          answer: 'All products must be shipped within 3-5 business days. Tracking information should be provided to customers.',
          category: 'Shipping',
        },
      ];
      setFaqs(mockFAQs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load FAQs');
    }
  };

  const handleCreateTicket = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to create ticket screen
    Alert.alert('Create Support Ticket', 'Navigate to ticket creation form');
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to ticket details screen
    Alert.alert('Ticket Details', `Viewing ticket ${ticket.id}`);
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Contact Support',
      'Choose your preferred contact method:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Call', '+1-800-SUPPORT') },
        { text: 'Email', onPress: () => Alert.alert('Email', 'support@chaingive.com') },
        { text: 'Live Chat', onPress: () => Alert.alert('Live Chat', 'Opening live chat...') },
      ]
    );
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return colors.primary;
      case 'in-progress': return colors.warning;
      case 'resolved': return colors.success;
      case 'closed': return colors.gray[500];
      default: return colors.gray[400];
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.primary;
      case 'low': return colors.gray[500];
      default: return colors.gray[400];
    }
  };

  const renderTicket = ({ item: ticket }: { item: SupportTicket }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => handleViewTicket(ticket)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
          <Text style={styles.ticketId}>{ticket.id}</Text>
        </View>
        <View style={styles.ticketBadges}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
            <Text style={styles.priorityText}>{ticket.priority.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
            <Text style={styles.statusText}>{ticket.status.replace('-', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.ticketDescription} numberOfLines={2}>
        {ticket.description}
      </Text>

      <View style={styles.ticketFooter}>
        <Text style={styles.ticketCategory}>{ticket.category}</Text>
        <Text style={styles.ticketTime}>{ticket.lastUpdated}</Text>
      </View>

      {ticket.responses > 0 && (
        <View style={styles.responsesBadge}>
          <Icon name="chat" size={12} color={colors.primary} />
          <Text style={styles.responsesText}>{ticket.responses} responses</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFAQ = ({ item: faq }: { item: FAQ }) => (
    <View style={styles.faqCard}>
      <Text style={styles.faqQuestion}>{faq.question}</Text>
      <Text style={styles.faqAnswer}>{faq.answer}</Text>
      <Text style={styles.faqCategory}>{faq.category}</Text>
    </View>
  );

  const renderTabButton = (tab: typeof activeTab, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon name={icon as any} size={20} color={activeTab === tab ? colors.white : colors.primary} />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tickets':
        return (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Support Tickets</Text>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateTicket}>
                <Icon name="add" size={20} color={colors.white} />
                <Text style={styles.createButtonText}>New Ticket</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={tickets}
              renderItem={renderTicket}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.ticketsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon name="support" size={48} color={colors.gray[300]} />
                  <Text style={styles.emptyStateText}>No support tickets</Text>
                  <Text style={styles.emptyStateSubtext}>Create a ticket to get help</Text>
                </View>
              }
            />
          </View>
        );

      case 'faq':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <FlatList
              data={faqs}
              renderItem={renderFAQ}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.faqsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );

      case 'contact':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Contact Support</Text>

            <TouchableOpacity style={styles.contactOption} onPress={handleContactSupport}>
              <View style={[styles.contactIcon, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="phone" size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactSubtitle}>Speak directly with our support team</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption} onPress={handleContactSupport}>
              <View style={[styles.contactIcon, { backgroundColor: colors.success + '20' }]}>
                <Icon name="email" size={24} color={colors.success} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>Get detailed help via email</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption} onPress={handleContactSupport}>
              <View style={[styles.contactIcon, { backgroundColor: colors.warning + '20' }]}>
                <Icon name="chat" size={24} color={colors.warning} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactSubtitle}>Instant support through live chat</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.gray[400]} />
            </TouchableOpacity>

            <View style={styles.supportHours}>
              <Text style={styles.supportHoursTitle}>Support Hours</Text>
              <Text style={styles.supportHoursText}>
                Monday - Friday: 9:00 AM - 6:00 PM GMT{'\n'}
                Saturday: 10:00 AM - 4:00 PM GMT{'\n'}
                Sunday: Closed
              </Text>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {renderTabButton('tickets', 'Tickets', 'confirmation-number')}
        {renderTabButton('faq', 'FAQ', 'help')}
        {renderTabButton('contact', 'Contact', 'contact-support')}
      </View>

      {/* Content */}
      {renderContent()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.bodyRegular,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  createButtonText: {
    ...typography.caption,
    color: colors.white,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  ticketsList: {
    padding: spacing.md,
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  ticketId: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  ticketBadges: {
    flexDirection: 'row',
  },
  priorityBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: spacing.xs,
  },
  priorityText: {
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
  ticketDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketCategory: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  ticketTime: {
    ...typography.caption,
    color: colors.gray[400],
  },
  responsesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  responsesText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xxs,
  },
  faqsList: {
    padding: spacing.md,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  faqQuestion: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  faqCategory: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  contactSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: 2,
  },
  supportHours: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  supportHoursTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  supportHoursText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 20,
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

export default VendorSupportPortalScreen;