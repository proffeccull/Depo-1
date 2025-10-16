import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface CreateProposalModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ProposalData) => Promise<void>;
}

interface ProposalData {
  title: string;
  description: string;
  category: string;
  durationHours: number;
}

const categories = [
  {
    key: 'feature_request',
    label: 'Feature Request',
    description: 'Suggest new platform features',
    icon: 'lightbulb',
  },
  {
    key: 'charity_category',
    label: 'Charity Category',
    description: 'Add new donation categories',
    icon: 'volunteer-activism',
  },
  {
    key: 'platform_improvement',
    label: 'Platform Improvement',
    description: 'Improve existing features',
    icon: 'build',
  },
  {
    key: 'governance',
    label: 'Governance',
    description: 'Platform rules and policies',
    icon: 'gavel',
  },
];

const durationOptions = [
  { hours: 168, label: '7 days' },
  { hours: 336, label: '14 days' },
  { hours: 720, label: '30 days' },
];

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [durationHours, setDurationHours] = useState(168);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (title.length < 10) {
      Alert.alert('Error', 'Title must be at least 10 characters');
      return;
    }

    if (description.length < 50) {
      Alert.alert('Error', 'Description must be at least 50 characters');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        durationHours,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setDurationHours(168);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (title || description || category) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to close? Your draft will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={['down']}
      style={styles.modal}
      propagateSwipe
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dragIndicator} />
          <Text style={styles.title}>Create Proposal</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Icon name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter proposal title..."
              placeholderTextColor={colors.text.secondary}
              maxLength={100}
              multiline={false}
            />
            <Text style={styles.charCount}>
              {title.length}/100
            </Text>
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryCard,
                    category === cat.key && styles.categoryCardSelected,
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                  <Icon
                    name={cat.icon}
                    size={24}
                    color={category === cat.key ? colors.white : colors.primary}
                  />
                  <Text
                    style={[
                      styles.categoryTitle,
                      category === cat.key && styles.categoryTitleSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                  <Text
                    style={[
                      styles.categoryDesc,
                      category === cat.key && styles.categoryDescSelected,
                    ]}
                  >
                    {cat.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your proposal in detail..."
              placeholderTextColor={colors.text.secondary}
              multiline={true}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>
              {description.length}/1000
            </Text>
          </View>

          {/* Duration Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Voting Duration</Text>
            <View style={styles.durationOptions}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.hours}
                  style={[
                    styles.durationButton,
                    durationHours === option.hours && styles.durationButtonSelected,
                  ]}
                  onPress={() => setDurationHours(option.hours)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      durationHours === option.hours && styles.durationTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Icon name="info" size={16} color={colors.info} />
              <Text style={styles.infoText}>
                Proposals require 10 votes minimum to be valid
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="stars" size={16} color={colors.tertiary} />
              <Text style={styles.infoText}>
                Earn 50 coins for creating a successful proposal
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!title.trim() || !description.trim() || !category || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim() || !category || loading}
          >
            <Text style={[
              styles.submitText,
              (!title.trim() || !description.trim() || !category || loading) && styles.submitTextDisabled,
            ]}>
              {loading ? 'Creating...' : 'Create Proposal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
    backgroundColor: colors.gray[50],
  },
  charCount: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  categoryTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  categoryTitleSelected: {
    color: colors.primary,
  },
  categoryDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryDescSelected: {
    color: colors.primary,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
    backgroundColor: colors.gray[50],
    height: 120,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  durationButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  durationText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  durationTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  submitTextDisabled: {
    color: colors.gray[500],
  },
});