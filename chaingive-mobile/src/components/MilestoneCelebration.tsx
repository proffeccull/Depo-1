import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  visible: boolean;
  milestone: { percentage: number; amount: number };
  onClose: () => void;
}

export const MilestoneCelebration: React.FC<Props> = ({ visible, milestone, onClose }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1);
      setTimeout(onClose, 3000);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient colors={['#FF6B6B', '#FFA500']} style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Milestone Reached!</Text>
          <Text style={styles.text}>{milestone.percentage}% Complete</Text>
          <Text style={styles.amount}>${milestone.amount.toLocaleString()}</Text>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  card: { padding: 32, borderRadius: 20, alignItems: 'center', minWidth: 280 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  text: { fontSize: 18, color: '#fff', marginBottom: 4 },
  amount: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
});
