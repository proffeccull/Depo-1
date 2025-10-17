import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components/common';
import { useNavigation } from '@react-navigation/native';
import { useFormValidation, validators } from '../../utils/validation';
import { MerchantApi } from '../../api/merchant';

export const MerchantOnboardingScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const {
    values,
    errors,
    validate,
    validateAll,
    handleChange,
  } = useFormValidation({
    businessName: '',
    email: '',
    phone: '',
    category: '',
    description: '',
  });

  const handleSubmit = async () => {
    const isValid = validateAll({
      businessName: { value: values.businessName, validator: validators.required },
      email: { value: values.email, validator: validators.email },
      phone: { value: values.phone, validator: validators.phone },
      category: { value: values.category, validator: validators.required },
      description: { value: values.description, validator: validators.required },
    });

    if (!isValid) {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      await MerchantApi.createMerchant({
        name: values.businessName,
        email: values.email,
        phone: values.phone,
        category: values.category,
        description: values.description,
      });

      Alert.alert('Success', 'Your merchant application has been submitted successfully.');
      navigation.navigate('MerchantDashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit merchant application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Merchant Onboarding</Text>
      <Text style={styles.subtitle}>Join ChainGive as a merchant</Text>

      <Input
        label="Business Name"
        value={values.businessName}
        onChangeText={(text) => handleChange('businessName', text)}
        onBlur={() => validate('businessName', values.businessName, validators.required)}
        error={errors.businessName}
        placeholder="Enter business name"
        accessibilityLabel="Business name input"
      />

      <Input
        label="Email"
        value={values.email}
        onChangeText={(text) => handleChange('email', text)}
        onBlur={() => validate('email', values.email, validators.email)}
        error={errors.email}
        placeholder="business@example.com"
        keyboardType="email-address"
        accessibilityLabel="Email input"
      />

      <Input
        label="Phone"
        value={values.phone}
        onChangeText={(text) => handleChange('phone', text)}
        onBlur={() => validate('phone', values.phone, validators.phone)}
        error={errors.phone}
        placeholder="+234 800 000 0000"
        keyboardType="phone-pad"
        accessibilityLabel="Phone number input"
      />

      <Input
        label="Business Category"
        value={values.category}
        onChangeText={(text) => handleChange('category', text)}
        onBlur={() => validate('category', values.category, validators.required)}
        error={errors.category}
        placeholder="e.g., Retail, Services"
        accessibilityLabel="Business category input"
      />

      <Input
        label="Description"
        value={values.description}
        onChangeText={(text) => handleChange('description', text)}
        onBlur={() => validate('description', values.description, validators.required)}
        error={errors.description}
        placeholder="Tell us about your business"
        multiline
        numberOfLines={4}
        accessibilityLabel="Business description input"
      />

      <Button
        title="Submit Application"
        onPress={handleSubmit}
        loading={loading}
        accessibilityLabel="Submit merchant application"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
});
