import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../../components/common';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

export const PermissionRequestsScreen = () => {
  const navigation = useNavigation();

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissions', 'Notifications help you stay updated on your impact!');
    }
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissions', 'Location helps find nearby donation opportunities!');
    }
  };

  const handleContinue = async () => {
    await requestNotifications();
    await requestLocation();
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Permissions</Text>
      <Text style={styles.subtitle}>To provide the best experience</Text>

      <View style={styles.permission}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.permTitle}>Notifications</Text>
        <Text style={styles.permDesc}>Get updates on your donations and achievements</Text>
      </View>

      <View style={styles.permission}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.permTitle}>Location</Text>
        <Text style={styles.permDesc}>Find nearby donation opportunities</Text>
      </View>

      <Button
        title="Enable Permissions"
        onPress={handleContinue}
        accessibilityLabel="Enable notifications and location permissions"
      />
      <Button
        title="Skip for Now"
        onPress={() => navigation.navigate('Register')}
        variant="text"
        accessibilityLabel="Skip permissions and continue"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  permission: { padding: 20, backgroundColor: '#f5f5f5', borderRadius: 12, marginBottom: 16 },
  icon: { fontSize: 40, marginBottom: 8 },
  permTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  permDesc: { fontSize: 14, color: '#666' },
});
