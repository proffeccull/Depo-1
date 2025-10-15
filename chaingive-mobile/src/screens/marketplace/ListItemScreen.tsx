import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const ListItemScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'coins' | 'naira'>('naira');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('new');
  const [location, setLocation] = useState('');
  const [tradeType, setTradeType] = useState<'sell' | 'buy' | 'exchange'>('sell');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'both'>('both');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics',
    'Fashion',
    'Books',
    'Home & Garden',
    'Sports',
    'Vehicles',
    'Services',
    'Other',
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
    { value: 'refurbished', label: 'Refurbished' },
  ] as const;

  const tradeTypes = [
    { value: 'sell', label: 'Sell', icon: 'sell' },
    { value: 'buy', label: 'Buy', icon: 'shopping-cart' },
    { value: 'exchange', label: 'Exchange', icon: 'swap-horiz' },
  ] as const;

  const contactMethods = [
    { value: 'phone', label: 'Phone Only' },
    { value: 'email', label: 'Email Only' },
    { value: 'both', label: 'Both' },
  ] as const;

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your item.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description for your item.');
      return false;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return false;
    }
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category.');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please enter your location.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Mock item listing - replace with actual API call
      const itemData = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        currency,
        category,
        condition,
        location: location.trim(),
        tradeType,
        isNegotiable,
        contactMethod,
      };

      console.log('Listing item:', itemData);

      Alert.alert(
        'Item Listed!',
        'Your item has been successfully listed on the marketplace.',
        [
          {
            text: 'View Listing',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'List Another',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setPrice('');
              setCategory('');
              setLocation('');
              setTradeType('sell');
              setIsNegotiable(true);
              setContactMethod('both');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to list item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryButton = (cat: string) => (
    <TouchableOpacity
      key={cat}
      style={[
        styles.categoryButton,
        category === cat && styles.categoryButtonSelected,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCategory(cat);
      }}
    >
      <Text style={[
        styles.categoryButtonText,
        category === cat && styles.categoryButtonTextSelected,
      ]}>
        {cat}
      </Text>
    </TouchableOpacity>
  );

  const renderConditionButton = (cond: { value: 'new' | 'used' | 'refurbished'; label: string }) => (
    <TouchableOpacity
      key={cond.value}
      style={[
        styles.conditionButton,
        condition === cond.value && styles.conditionButtonSelected,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCondition(cond.value);
      }}
    >
      <Text style={[
        styles.conditionButtonText,
        condition === cond.value && styles.conditionButtonTextSelected,
      ]}>
        {cond.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTradeTypeButton = (type: { value: 'sell' | 'buy' | 'exchange'; label: string; icon: string }) => (
    <TouchableOpacity
      key={type.value}
      style={[
        styles.tradeTypeButton,
        tradeType === type.value && styles.tradeTypeButtonSelected,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTradeType(type.value);
      }}
    >
      <Icon
        name={type.icon as any}
        size={20}
        color={tradeType === type.value ? colors.white : colors.text.secondary}
      />
      <Text style={[
        styles.tradeTypeButtonText,
        tradeType === type.value && styles.tradeTypeButtonTextSelected,
      ]}>
        {type.label}
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
        <Text style={styles.headerTitle}>List New Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. iPhone 13 Pro Max 256GB"
            placeholderTextColor={colors.text.secondary}
            maxLength={100}
          />

          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item in detail..."
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Trade Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trade Type</Text>
          <View style={styles.tradeTypeContainer}>
            {tradeTypes.map((type) => renderTradeTypeButton(type))}
          </View>
        </View>

        {/* Price & Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price & Currency</Text>

          <View style={styles.priceContainer}>
            <View style={styles.currencySelector}>
              <TouchableOpacity
                style={[
                  styles.currencyButton,
                  currency === 'naira' && styles.currencyButtonSelected,
                ]}
                onPress={() => setCurrency('naira')}
              >
                <Text style={[
                  styles.currencyButtonText,
                  currency === 'naira' && styles.currencyButtonTextSelected,
                ]}>
                  ₦ Naira
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.currencyButton,
                  currency === 'coins' && styles.currencyButtonSelected,
                ]}
                onPress={() => setCurrency('coins')}
              >
                <Text style={[
                  styles.currencyButtonText,
                  currency === 'coins' && styles.currencyButtonTextSelected,
                ]}>
                  🪙 Coins
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.negotiableContainer}>
            <Text style={styles.negotiableLabel}>Price Negotiable</Text>
            <Switch
              value={isNegotiable}
              onValueChange={setIsNegotiable}
              trackColor={{ false: colors.gray[300], true: colors.primary + '50' }}
              thumbColor={isNegotiable ? colors.primary : colors.gray[400]}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categories.map(renderCategoryButton)}
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condition</Text>
          <View style={styles.conditionContainer}>
            {conditions.map(renderConditionButton)}
          </View>
        </View>

        {/* Location & Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Contact</Text>

          <Text style={styles.inputLabel}>Location *</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Lagos, Nigeria"
            placeholderTextColor={colors.text.secondary}
          />

          <Text style={styles.inputLabel}>Preferred Contact Method</Text>
          <View style={styles.contactContainer}>
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.contactButton,
                  contactMethod === method.value && styles.contactButtonSelected,
                ]}
                onPress={() => setContactMethod(method.value)}
              >
                <Text style={[
                  styles.contactButtonText,
                  contactMethod === method.value && styles.contactButtonTextSelected,
                ]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Icon name="add-circle" size={20} color={colors.white} />
              <Text style={styles.submitButtonText}>List Item</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.bodyRegular,
    backgroundColor: colors.white,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tradeTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    gap: spacing.sm,
  },
  tradeTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tradeTypeButtonText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  tradeTypeButtonTextSelected: {
    color: colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currencySelector: {
    flexDirection: 'row',
    marginRight: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  currencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  currencyButtonSelected: {
    backgroundColor: colors.primary,
  },
  currencyButtonText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  currencyButtonTextSelected: {
    color: colors.white,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.h3,
    backgroundColor: colors.white,
    color: colors.text.primary,
  },
  negotiableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  negotiableLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  categoryButtonTextSelected: {
    color: colors.white,
  },
  conditionContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conditionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  conditionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  conditionButtonText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  conditionButtonTextSelected: {
    color: colors.white,
  },
  contactContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  contactButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  contactButtonText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  contactButtonTextSelected: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default ListItemScreen;