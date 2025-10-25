import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent, CreateEventData } from '../../api/community';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';

const EVENT_TYPES = [
  { label: 'Fundraising Event', value: 'fundraising' },
  { label: 'Community Meeting', value: 'community_meeting' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Celebration', value: 'celebration' },
];

export const CreateEventScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    maxAttendees: undefined,
    eventType: 'fundraising',
    fundraisingGoal: undefined,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        eventDate: selectedDate.toISOString().split('T')[0],
      }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setFormData(prev => ({
        ...prev,
        eventTime: selectedTime.toTimeString().split(' ')[0].substring(0, 5),
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }
    if (!formData.eventDate) {
      Alert.alert('Error', 'Please select an event date');
      return;
    }
    if (!formData.eventTime) {
      Alert.alert('Error', 'Please select an event time');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter an event location');
      return;
    }

    setLoading(true);
    try {
      await createEvent(formData);
      Alert.alert(
        'Success',
        'Event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create event'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Select Time';
    return timeString;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Community Event</Text>
        <Text style={styles.subtitle}>
          Organize events to bring your community together
        </Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter event title"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe your event"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Type *</Text>
          <View style={styles.pickerContainer}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.pickerOption,
                  formData.eventType === type.value && styles.pickerOptionSelected,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, eventType: type.value }))}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    formData.eventType === type.value && styles.pickerOptionTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>
                {formatDate(formData.eventDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Time *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>
                {formatTime(formData.eventTime)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter event location"
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            maxLength={200}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Max Attendees</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional"
              value={formData.maxAttendees?.toString() || ''}
              onChangeText={(text) => {
                const num = text ? parseInt(text) : undefined;
                setFormData(prev => ({ ...prev, maxAttendees: num }));
              }}
              keyboardType="numeric"
            />
          </View>

          {formData.eventType === 'fundraising' && (
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Fundraising Goal (₦)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Optional"
                value={formData.fundraisingGoal?.toString() || ''}
                onChangeText={(text) => {
                  const num = text ? parseFloat(text) : undefined;
                  setFormData(prev => ({ ...prev, fundraisingGoal: num }));
                }}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>
      </Card>

      {showDatePicker && (
        <DateTimePicker
          value={formData.eventDate ? new Date(formData.eventDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={
            formData.eventTime
              ? new Date(`2000-01-01T${formData.eventTime}:00`)
              : new Date()
          }
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Create Event"
          onPress={handleSubmit}
          loading={loading}
          style={styles.createButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formCard: {
    margin: 20,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pickerOptionTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
});