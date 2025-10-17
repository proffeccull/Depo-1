import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Card } from '../../components/common';

export const NotificationPreferencesScreen = () => {
  const [prefs, setPrefs] = useState({
    donations: true,
    badges: true,
    leaderboard: false,
    social: true,
    marketing: false,
  });

  const toggle = (key: string) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Preferences</Text>
      
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.label}>Donation Updates</Text>
            <Text style={styles.desc}>Get notified about your donations</Text>
          </View>
          <Switch
            value={prefs.donations}
            onValueChange={() => toggle('donations')}
            accessibilityLabel="Toggle donation notifications"
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.label}>Badge Unlocks</Text>
            <Text style={styles.desc}>Celebrate your achievements</Text>
          </View>
          <Switch
            value={prefs.badges}
            onValueChange={() => toggle('badges')}
            accessibilityLabel="Toggle badge notifications"
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.label}>Leaderboard Updates</Text>
            <Text style={styles.desc}>Track your ranking changes</Text>
          </View>
          <Switch
            value={prefs.leaderboard}
            onValueChange={() => toggle('leaderboard')}
            accessibilityLabel="Toggle leaderboard notifications"
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.label}>Social Activity</Text>
            <Text style={styles.desc}>Friends and community updates</Text>
          </View>
          <Switch
            value={prefs.social}
            onValueChange={() => toggle('social')}
            accessibilityLabel="Toggle social notifications"
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.label}>Marketing</Text>
            <Text style={styles.desc}>News and promotions</Text>
          </View>
          <Switch
            value={prefs.marketing}
            onValueChange={() => toggle('marketing')}
            accessibilityLabel="Toggle marketing notifications"
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1, marginRight: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  desc: { fontSize: 12, color: '#666' },
});
