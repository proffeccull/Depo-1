import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components/common';
import { useFormValidation, validators } from '../../utils/validation';
import { CorporateApi } from '../../api/corporate';
import { useNavigation } from '@react-navigation/native';

export const CorporateAccountSetupScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const {
    values,
    errors,
    validate,
    validateAll,
    handleChange,
  } = useFormValidation({
    companyName: '',
    industry: '',
    size: '',
    contactName: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async () => {
    const isValid = validateAll({
      companyName: { value: values.companyName, validator: validators.required },
      industry: { value: values.industry, validator: validators.required },
      size: { value: values.size, validator: validators.required },
      contactName: { value: values.contactName, validator: validators.required },
      email: { value: values.email, validator: validators.email },
      phone: { value: values.phone, validator: validators.phone },
    });

    if (!isValid) {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      await CorporateApi.createCorporateAccount({
        name: values.companyName,
        industry: values.industry,
        companySize: values.size,
        contactName: values.contactName,
        contactEmail: values.email,
        contactPhone: values.phone,
      });

      Alert.alert('Success', 'Your corporate account has been created successfully.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create corporate account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Corporate Account Setup</Text>
      
      <Input
        label="Company Name"
        value={values.companyName}
        onChangeText={(text) => handleChange('companyName', text)}
        onBlur={() => validate('companyName', values.companyName, validators.required)}
        error={errors.companyName}
        accessibilityLabel="Company name"
      />
      
      <Input
        label="Industry"
        value={values.industry}
        onChangeText={(text) => handleChange('industry', text)}
        onBlur={() => validate('industry', values.industry, validators.required)}
        error={errors.industry}
        accessibilityLabel="Industry"
      />
      
      <Input
        label="Company Size"
        value={values.size}
        onChangeText={(text) => handleChange('size', text)}
        onBlur={() => validate('size', values.size, validators.required)}
        error={errors.size}
        placeholder="e.g., 50-100 employees"
        accessibilityLabel="Company size"
      />
      
      <Input
        label="Contact Name"
        value={values.contactName}
        onChangeText={(text) => handleChange('contactName', text)}
        onBlur={() => validate('contactName', values.contactName, validators.required)}
        error={errors.contactName}
        accessibilityLabel="Contact name"
      />
      
      <Input
        label="Email"
        value={values.email}
        onChangeText={(text) => handleChange('email', text)}
        onBlur={() => validate('email', values.email, validators.email)}
        error={errors.email}
        keyboardType="email-address"
        accessibilityLabel="Email"
      />
      
      <Input
        label="Phone"
        value={values.phone}
        onChangeText={(text) => handleChange('phone', text)}
        onBlur={() => validate('phone', values.phone, validators.phone)}
        error={errors.phone}
        keyboardType="phone-pad"
        accessibilityLabel="Phone"
      />

      <Button title="Create Account" onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
});
