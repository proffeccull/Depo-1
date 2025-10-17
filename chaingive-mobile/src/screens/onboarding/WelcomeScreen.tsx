import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from '../../components/common';
import { useNavigation } from '@react-navigation/native';

export const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to ChainGive</Text>
      <Text style={styles.subtitle}>Make a difference, one donation at a time</Text>
      
      <View style={styles.features}>
        <Text style={styles.feature}>🎯 Track your impact</Text>
        <Text style={styles.feature}>🏆 Earn rewards</Text>
        <Text style={styles.feature}>🤝 Join communities</Text>
      </View>

      <Button
        title="Get Started"
        onPress={() => navigation.navigate('FeatureHighlights')}
        accessibilityLabel="Get started with ChainGive"
      />
      <Button
        title="Sign In"
        onPress={() => navigation.navigate('Login')}
        variant="secondary"
        accessibilityLabel="Sign in to existing account"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  features: { marginBottom: 32 },
  feature: { fontSize: 18, marginBottom: 12, textAlign: 'center' },
});
