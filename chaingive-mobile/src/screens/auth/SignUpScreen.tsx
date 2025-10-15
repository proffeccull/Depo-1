import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { registerUser } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  ProgressRing,
  ConfettiCelebration,
  PageTransition,
  LottieSuccess,
} from '../../components/animations';

const { width: screenWidth } = Dimensions.get('window');

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const totalSteps = 3;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await dispatch(registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
      })).unwrap();

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success animation
      setShowSuccess(true);

      // Show confetti
      setTimeout(() => {
        setShowConfetti(true);
      }, 1000);

      // Navigate to OTP screen after celebration
      setTimeout(() => {
        navigation.navigate('OTP', {
          phoneNumber: phoneNumber.trim(),
          type: 'registration',
        });
      }, 3000);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  const calculateProgress = () => {
    let completed = 0;
    if (firstName && lastName) completed += 1;
    if (email && phoneNumber) completed += 1;
    if (password && confirmPassword && password === confirmPassword) completed += 1;
    return completed / totalSteps;
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageTransition type="slideUp" duration={300}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Icon name="favorite" size={48} color={colors.primary} />
              <ProgressRing
                progress={calculateProgress()}
                size={80}
                strokeWidth={6}
                color={colors.primary}
                showPercentage
                animated
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ChainGive and start giving</Text>
            <Text style={styles.progressText}>
              {Math.round(calculateProgress() * 100)}% Complete
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              label="First Name"
              icon="person"
              error={errors.firstName}
              required
            />

            <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              label="Last Name"
              icon="person"
              error={errors.lastName}
              required
            />

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              label="Email Address"
              icon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <Input
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+234 801 234 5678"
              label="Phone Number"
              icon="phone"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              required
            />

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              label="Password"
              icon="lock"
              secureTextEntry
              showPasswordToggle
              error={errors.password}
              required
            />

            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              label="Confirm Password"
              icon="lock"
              secureTextEntry
              showPasswordToggle
              error={errors.confirmPassword}
              required
            />

            <Input
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="Enter referral code (optional)"
              label="Referral Code"
              icon="card-giftcard"
            />

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              fullWidth
              style={styles.signUpButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Premium Animations */}
      <LottieSuccess
        visible={showSuccess}
        onAnimationFinish={() => setShowSuccess(false)}
      />

      <ConfettiCelebration
        visible={showConfetti}
        message="🎉 Welcome to ChainGive!"
        submessage="Start making a difference today"
        onComplete={() => setShowConfetti(false)}
        confettiCount={200}
      />
      </PageTransition>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.screenPadding,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  termsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  termsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  signUpButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  signInText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SignUpScreen;
