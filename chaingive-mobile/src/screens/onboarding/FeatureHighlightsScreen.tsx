import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Button } from '../../components/common';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const features = [
  { id: '1', icon: '💰', title: 'Easy Donations', description: 'Donate with just a few taps' },
  { id: '2', icon: '🎮', title: 'Gamification', description: 'Earn badges and climb leaderboards' },
  { id: '3', icon: '📊', title: 'Track Impact', description: 'See your real-time donation impact' },
  { id: '4', icon: '🔒', title: 'Secure', description: 'Bank-level security for all transactions' },
];

export const FeatureHighlightsScreen = () => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < features.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('PermissionRequests');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={features}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      
      <View style={styles.dots}>
        {features.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
        ))}
      </View>

      <Button
        title={currentIndex === features.length - 1 ? 'Continue' : 'Next'}
        onPress={handleNext}
        accessibilityLabel={currentIndex === features.length - 1 ? 'Continue to permissions' : 'Next feature'}
      />
      <Button
        title="Skip"
        onPress={() => navigation.navigate('PermissionRequests')}
        variant="text"
        accessibilityLabel="Skip feature highlights"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: { width, padding: 40, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 80, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  description: { fontSize: 16, color: '#666', textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#4CAF50', width: 24 },
});
