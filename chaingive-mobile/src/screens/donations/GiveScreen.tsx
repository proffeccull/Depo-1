import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import { donationService, Match } from '../../services/donationService';
import Input from '../../components/common/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/common/Modal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { MotiView } from 'moti';
import {
  DonationSuccessAnimation,
  FloatingHearts,
  ConfettiCelebration,
  PageTransition,
  CountUpAnimation,
} from '../../components/animations';

const { width: screenWidth } = Dimensions.get('window');

const GiveScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [faith, setFaith] = useState('');
  const [loading, setLoading] = useState(false);
  const [findingMatch, setFindingMatch] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [recipientName, setRecipientName] = useState('');

  const userBalance = user?.balance || 0;
  const suggestedAmounts = [1000, 2000, 5000, 10000];

  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleFindMatch = async () => {
    const donationAmount = parseInt(amount);

    if (!donationAmount || donationAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (donationAmount < 500) {
      Alert.alert('Error', 'Minimum donation amount is ₦500');
      return;
    }

    if (donationAmount > userBalance) {
      Alert.alert('Insufficient Balance', 'Please deposit funds to continue');
      return;
    }

    setFindingMatch(true);
    try {
      const response = await donationService.giveDonation({
        amount: donationAmount,
        location: location || undefined,
        faithPreference: faith || undefined,
      });

      setMatch(response.match);
      setShowMatchModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to find a match');
    } finally {
      setFindingMatch(false);
    }
  };

  const handleConfirmDonation = async () => {
    if (!match) return;

    setLoading(true);
    try {
      // Store for animations
      setCompletedAmount(match.amount);
      setRecipientName(match.recipient.firstName);
      
      // Close modal
      setShowMatchModal(false);
      
      // Trigger success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show donation success animation
      setTimeout(() => {
        setShowDonationSuccess(true);
      }, 300);
      
      // Show hearts after 500ms
      setTimeout(() => {
        setShowHearts(true);
      }, 800);
      
      // Show confetti after 2 seconds
      setTimeout(() => {
        setShowConfetti(true);
      }, 2000);
      
      // Reset form
      setAmount('');
      setLocation('');
      setFaith('');
      setMatch(null);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} className="text-gray-800 dark:text-white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800 dark:text-white">Give Forward</Text>
          <View className="w-10" />
        </View>

        {/* Balance Card */}
        <View className="bg-primary-500 m-4 p-6 rounded-2xl items-center">
          <Text className="text-sm text-white opacity-90">Available Balance</Text>
          <Text className="text-4xl text-white font-bold my-2">
            {formatCurrency(userBalance)}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('DepositScreen')}
          >
            <Text className="text-sm text-white underline">
              + Add Funds
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">How much would you like to give?</Text>
          <Input
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Enter amount"
            keyboardType="numeric"
            icon="money"
            label="Amount (₦)"
            required
          />

          {/* Suggested Amounts */}
          <View className="flex-row flex-wrap gap-2 mt-4">
            {suggestedAmounts.map((suggested) => (
              <TouchableOpacity
                key={suggested}
                className={`py-2 px-4 rounded-full border ${
                  amount === suggested.toString()
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 bg-white dark:bg-gray-700'
                }`}
                onPress={() => setAmount(suggested.toString())}
              >
                <Text
                  className={`text-sm ${
                    amount === suggested.toString()
                      ? 'text-white'
                      : 'text-gray-800 dark:text-white'
                  }`}
                >
                  {formatCurrency(suggested)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferences (Optional) */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-1">Preferences (Optional)</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Help us find the best match for you
          </Text>

          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Lagos, Abuja"
            icon="location-on"
            label="Preferred Location"
          />

          <Input
            value={faith}
            onChangeText={setFaith}
            placeholder="e.g., Christian, Muslim"
            icon="favorite"
            label="Faith Preference"
          />
        </View>

        {/* How It Works */}
        <View className="mx-4 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-2xl border border-blue-200 dark:border-blue-800 mb-6">
          <View className="flex-row items-center mb-2">
            <Icon name="info" size={20} className="text-blue-500" />
            <Text className="text-base font-bold text-blue-500 ml-2">How It Works</Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-300 leading-6">
            1. We'll match you with someone who needs help{'\n'}
            2. Funds are held in escrow for 48 hours{'\n'}
            3. Recipient confirms receipt within 48 hours{'\n'}
            4. You earn Charity Coins for giving forward!
          </Text>
        </View>

        {/* Find Match Button */}
        <Button
          label="Find a Match"
          onPress={handleFindMatch}
          loading={findingMatch}
          disabled={!amount || parseInt(amount) <= 0}
          icon="search"
          className="mx-4"
        />
        </MotiView>
      </ScrollView>

      {/* Match Modal */}
      <Modal
        visible={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        title="Match Found!"
        scrollable={false}
      >
        {match && (
          <View>
            {/* Recipient Info */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/50 items-center justify-center mb-2">
                <Icon name="person" size={48} className="text-primary-500" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {match.recipient.firstName} {match.recipient.lastName}
              </Text>
              <View className="items-center">
                <View className="flex-row items-center mb-1">
                  <Icon name="star" size={16} className="text-yellow-500" />
                  <Text className="text-base text-gray-600 dark:text-gray-300 ml-1">
                    Trust Score: {match.recipient.trustScore}/100
                  </Text>
                </View>
                {match.recipient.location && (
                  <View className="flex-row items-center mb-1">
                    <Icon name="location-on" size={16} className="text-gray-500" />
                    <Text className="text-base text-gray-600 dark:text-gray-300 ml-1">
                      {match.recipient.location}
                    </Text>
                  </View>
                )}
                {match.recipient.faithPreference && (
                  <View className="flex-row items-center">
                    <Icon name="favorite" size={16} className="text-red-500" />
                    <Text className="text-base text-gray-600 dark:text-gray-300 ml-1">
                      {match.recipient.faithPreference}
                    </Text>
                  </View>
                )}
              </View>

              {/* Match Score */}
              <View className="mt-4 p-4 bg-green-50 dark:bg-green-900/50 rounded-2xl items-center">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Match Quality</Text>
                <Text className="text-3xl font-bold text-green-500">
                  {Math.round(match.matchScore * 100)}%
                </Text>
              </View>
            </View>

            {/* Amount Summary */}
            <View className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-6">
              <View className="flex-row justify-between mb-1">
                <Text className="text-base text-gray-600 dark:text-gray-300">Donation Amount:</Text>
                <Text className="text-base font-bold text-gray-800 dark:text-white">
                  {formatCurrency(match.amount)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-base text-gray-600 dark:text-gray-300">Service Fee:</Text>
                <Text className="text-base font-bold text-gray-800 dark:text-white">₦0</Text>
              </View>
              <View className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1 flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800 dark:text-white">Total:</Text>
                <Text className="text-lg font-bold text-primary-500">
                  {formatCurrency(match.amount)}
                </Text>
              </View>
            </View>

            {/* Confirm Buttons */}
            <Button
              label="Confirm Donation"
              onPress={handleConfirmDonation}
              loading={loading}
              className="mb-4"
            />
            <Button
              label="Find Another Match"
              onPress={() => {
                setShowMatchModal(false);
                setMatch(null);
              }}
              variant="outline"
            />
          </View>
        )}
      </Modal>

      {/* Premium Animations */}
      {showDonationSuccess && (
        <DonationSuccessAnimation
          amount={completedAmount}
          recipientName={recipientName}
          onComplete={() => {
            setShowDonationSuccess(false);
            navigation.navigate('Home');
          }}
        />
      )}

      {showHearts && (
        <FloatingHearts
          count={20}
          duration={3000}
          startX={screenWidth / 2}
          startY={200}
          color={colors.error}
        />
      )}

      <ConfettiCelebration
        visible={showConfetti}
        message="🎉 Thank You!"
        submessage="Your generosity makes a difference"
        onComplete={() => setShowConfetti(false)}
        confettiCount={200}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing['4xl'],
  },
});

export default GiveScreen;
