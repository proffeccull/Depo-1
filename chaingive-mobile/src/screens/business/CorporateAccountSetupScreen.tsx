import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface CorporateFormData {
  companyName: string;
  industry: string;
  companySize: string;
  headquarters: string;
  taxId: string;
  registrationNumber: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  enableMultiUser: boolean;
  enableBulkOperations: boolean;
  enableAdvancedReporting: boolean;
}

const CorporateAccountSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<CorporateFormData>({
    companyName: '',
    industry: '',
    companySize: '',
    headquarters: '',
    taxId: '',
    registrationNumber: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    billingAddress: '',
    enableMultiUser: false,
    enableBulkOperations: false,
    enableAdvancedReporting: false,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CorporateFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    const requiredFields: (keyof CorporateFormData)[] = [
      'companyName', 'industry', 'companySize', 'headquarters',
      'contactPerson', 'contactEmail', 'contactPhone', 'billingAddress'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to submit corporate account setup
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Corporate account setup completed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to set up corporate account');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof CorporateFormData,
    placeholder: string,
    required = false,
    multiline = false,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}{required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={formData[field] as string}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderSwitch = (
    label: string,
    field: keyof CorporateFormData,
    description: string
  ) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDescription}>{description}</Text>
      </View>
      <Switch
        value={formData[field] as boolean}
        onValueChange={(value) => handleInputChange(field, value)}
        trackColor={{ false: colors.gray[300], true: colors.primary + '50' }}
        thumbColor={formData[field] ? colors.primary : colors.gray[400]}
      />
    </View>
  );

  const renderPicker = (
    label: string,
    field: keyof CorporateFormData,
    options: string[],
    required = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}{required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.pickerOption,
              formData[field] === option && styles.pickerOptionSelected,
            ]}
            onPress={() => handleInputChange(field, option)}
          >
            <Text style={[
              styles.pickerOptionText,
              formData[field] === option && styles.pickerOptionTextSelected,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Corporate Account Setup</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Set up your corporate account with advanced features for enterprise use
        </Text>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          {renderInput('Company Name', 'companyName', 'Enter your company name', true)}
          {renderInput('Industry', 'industry', 'e.g., Technology, Finance, Healthcare', true)}
          {renderPicker('Company Size', 'companySize', [
            '1-10 employees',
            '11-50 employees',
            '51-200 employees',
            '201-1000 employees',
            '1000+ employees'
          ], true)}
          {renderInput('Headquarters Location', 'headquarters', 'City, Country', true)}
          {renderInput('Tax ID', 'taxId', 'Enter company tax identification number')}
          {renderInput('Registration Number', 'registrationNumber', 'Company registration number')}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Contact</Text>
          {renderInput('Contact Person', 'contactPerson', 'Full name of primary contact', true)}
          {renderInput('Email Address', 'contactEmail', 'contact@company.com', true, false, 'email-address')}
          {renderInput('Phone Number', 'contactPhone', '+1 (555) 123-4567', true, false, 'phone-pad')}
          {renderInput('Billing Address', 'billingAddress', 'Complete billing address', true, true)}
        </View>

        {/* Feature Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Features</Text>
          {renderSwitch(
            'Multi-User Access',
            'enableMultiUser',
            'Allow multiple users to access this corporate account'
          )}
          {renderSwitch(
            'Bulk Operations',
            'enableBulkOperations',
            'Enable bulk transaction processing and management tools'
          )}
          {renderSwitch(
            'Advanced Reporting',
            'enableAdvancedReporting',
            'Access to detailed analytics and enterprise reporting'
          )}
        </View>

        {/* Pricing Information */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Corporate Plan Pricing</Text>
          <View style={styles.pricingBreakdown}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Base Plan</Text>
              <Text style={styles.pricingValue}>₦50,000/month</Text>
            </View>
            {formData.enableMultiUser && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Multi-User Access</Text>
                <Text style={styles.pricingValue}>₦15,000/month</Text>
              </View>
            )}
            {formData.enableBulkOperations && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Bulk Operations</Text>
                <Text style={styles.pricingValue}>₦10,000/month</Text>
              </View>
            )}
            {formData.enableAdvancedReporting && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Advanced Reporting</Text>
                <Text style={styles.pricingValue}>₦8,000/month</Text>
              </View>
            )}
            <View style={[styles.pricingRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Monthly</Text>
              <Text style={styles.totalValue}>
                ₦{(50000 +
                  (formData.enableMultiUser ? 15000 : 0) +
                  (formData.enableBulkOperations ? 10000 : 0) +
                  (formData.enableAdvancedReporting ? 8000 : 0)
                ).toLocaleString()}/month
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Setting Up Account...' : 'Complete Corporate Setup'}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  pickerOptionTextSelected: {
    color: colors.white,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  switchDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pricingCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  pricingTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  pricingBreakdown: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  pricingLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  pricingValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  totalValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default CorporateAccountSetupScreen;