import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ThermometerProps {
  raised: number;
  goal: number;
  percentage: number;
  donorCount: number;
  title?: string;
}

export const FundraisingThermometer: React.FC<ThermometerProps> = ({
  raised,
  goal,
  percentage,
  donorCount,
  title,
}) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.thermometerContainer}>
        <View style={styles.thermometer}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53', '#FFA500']}
            style={[styles.fill, { height: `${percentage}%` }]}
          />
        </View>
        
        <View style={styles.labels}>
          <Text style={styles.goalText}>${goal.toLocaleString()}</Text>
          <Text style={styles.percentText}>{percentage}%</Text>
          <Text style={styles.raisedText}>${raised.toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.statText}>{donorCount} donors</Text>
        <Text style={styles.statText}>${(goal - raised).toLocaleString()} to go</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  thermometerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
  },
  thermometer: {
    width: 40,
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: 20,
  },
  labels: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 16,
    height: '100%',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  percentText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  raisedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
});
