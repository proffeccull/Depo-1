import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store/store';
import { uploadReviewVideo } from '../../store/slices/trustSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoUploadInterfaceProps {
  reviewId: string;
  onUploadSuccess?: (videoUrl: string) => void;
  onUploadError?: (error: string) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
  quality?: 'low' | 'medium' | 'high';
}

type UploadState = 'idle' | 'recording' | 'recorded' | 'uploading' | 'processing' | 'completed' | 'error';

export const VideoUploadInterface: React.FC<VideoUploadInterfaceProps> = ({
  reviewId,
  onUploadSuccess,
  onUploadError,
  onCancel,
  maxDuration = 60,
  quality = 'medium',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [uploadProgress]);

  useEffect(() => {
    if (uploadState === 'recording') {
      startRecordingTimer();
    } else {
      stopRecordingTimer();
    }

    return () => stopRecordingTimer();
  }, [uploadState]);

  const startRecordingTimer = () => {
    setRecordingDuration(0);
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= maxDuration) {
          handleStopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  };

  const handleStartRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setUploadState('recording');
      setErrorMessage('');

      // Simulate camera access (in real implementation, use expo-camera)
      // For demo purposes, we'll simulate recording
      setTimeout(() => {
        if (uploadState === 'recording') {
          // Simulate successful recording
          setRecordedVideo('mock-video-uri');
          setUploadState('recorded');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 3000);

    } catch (error) {
      setUploadState('error');
      setErrorMessage('Failed to access camera');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleStopRecording = () => {
    if (uploadState === 'recording') {
      setUploadState('recorded');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRetakeVideo = () => {
    Haptics.selectionAsync();
    setRecordedVideo(null);
    setRecordingDuration(0);
    setUploadState('idle');
  };

  const handleUploadVideo = async () => {
    if (!recordedVideo || !user) return;

    try {
      setUploadState('uploading');
      setUploadProgress(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Dispatch upload action
      const result = await dispatch(uploadReviewVideo({
        reviewId,
        videoUri: recordedVideo,
        userId: user.id,
      })).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState('processing');

      // Simulate processing delay
      setTimeout(() => {
        setUploadState('completed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onUploadSuccess?.(result.videoUrl);
      }, 1500);

    } catch (error) {
      setUploadState('error');
      setErrorMessage('Upload failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onUploadError?.(error as string);
    }
  };

  const handleCancel = () => {
    Haptics.selectionAsync();
    Alert.alert(
      'Cancel Upload',
      'Are you sure you want to cancel? Your recording will be lost.',
      [
        { text: 'Keep Recording', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            onCancel?.();
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateConfig = () => {
    switch (uploadState) {
      case 'idle':
        return {
          title: 'Record Your Review',
          subtitle: 'Share your experience with a video review',
          primaryAction: 'Start Recording',
          primaryColor: colors.primary,
          showRecording: false,
        };
      case 'recording':
        return {
          title: 'Recording...',
          subtitle: `Keep sharing your experience • ${formatDuration(recordingDuration)}`,
          primaryAction: 'Stop Recording',
          primaryColor: colors.error,
          showRecording: true,
        };
      case 'recorded':
        return {
          title: 'Review Your Video',
          subtitle: 'Check your recording before uploading',
          primaryAction: 'Upload Video',
          primaryColor: colors.success,
          showRecording: false,
        };
      case 'uploading':
        return {
          title: 'Uploading...',
          subtitle: 'Processing your video review',
          primaryAction: null,
          primaryColor: colors.primary,
          showRecording: false,
        };
      case 'processing':
        return {
          title: 'Processing...',
          subtitle: 'AI verification in progress',
          primaryAction: null,
          primaryColor: colors.primary,
          showRecording: false,
        };
      case 'completed':
        return {
          title: 'Upload Complete!',
          subtitle: 'Your video review has been verified and published',
          primaryAction: 'Done',
          primaryColor: colors.success,
          showRecording: false,
        };
      case 'error':
        return {
          title: 'Upload Failed',
          subtitle: errorMessage || 'Something went wrong',
          primaryAction: 'Try Again',
          primaryColor: colors.error,
          showRecording: false,
        };
      default:
        return {
          title: 'Record Your Review',
          subtitle: 'Share your experience with a video review',
          primaryAction: 'Start Recording',
          primaryColor: colors.primary,
          showRecording: false,
        };
    }
  };

  const stateConfig = getStateConfig();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancel}
            disabled={uploadState === 'uploading' || uploadState === 'processing'}
          >
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{stateConfig.title}</Text>
            <Text style={styles.subtitle}>{stateConfig.subtitle}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Recording Preview */}
          <View style={styles.previewContainer}>
            {uploadState === 'recording' && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC</Text>
              </View>
            )}

            <View style={styles.cameraPreview}>
              {recordedVideo ? (
                <View style={styles.videoPreview}>
                  <Icon name="videocam" size={48} color={colors.gray[400]} />
                  <Text style={styles.previewText}>Video Recorded</Text>
                  <Text style={styles.durationText}>
                    Duration: {formatDuration(recordingDuration)}
                  </Text>
                </View>
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Icon name="videocam" size={64} color={colors.gray[300]} />
                  <Text style={styles.placeholderText}>
                    {uploadState === 'recording' ? 'Recording...' : 'Tap to start recording'}
                  </Text>
                </View>
              )}
            </View>

            {/* Recording Timer */}
            {uploadState === 'recording' && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                  {formatDuration(recordingDuration)}
                </Text>
                <View style={styles.timerProgress}>
                  <View
                    style={[
                      styles.timerProgressFill,
                      { width: `${(recordingDuration / maxDuration) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Upload Progress */}
          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {uploadState === 'uploading' ? 'Uploading...' : 'Processing...'}
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>
                {Math.round(uploadProgress)}%
              </Text>
            </View>
          )}

          {/* Trust Indicators */}
          <View style={styles.trustContainer}>
            <View style={styles.trustItem}>
              <Icon name="verified" size={20} color="#FFD700" />
              <Text style={styles.trustText}>Verified & Secure</Text>
            </View>
            <View style={styles.trustItem}>
              <Icon name="privacy-tip" size={20} color="#FFD700" />
              <Text style={styles.trustText}>Private Review</Text>
            </View>
            <View style={styles.trustItem}>
              <Icon name="stars" size={20} color="#FFD700" />
              <Text style={styles.trustText}>Earn Coins</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {uploadState === 'recorded' && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetakeVideo}
            >
              <Icon name="replay" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
          )}

          {stateConfig.primaryAction && (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: stateConfig.primaryColor },
                (uploadState === 'uploading' || uploadState === 'processing') && styles.buttonDisabled,
              ]}
              onPress={() => {
                switch (uploadState) {
                  case 'idle':
                    handleStartRecording();
                    break;
                  case 'recording':
                    handleStopRecording();
                    break;
                  case 'recorded':
                    handleUploadVideo();
                    break;
                  case 'error':
                    setUploadState('idle');
                    break;
                  case 'completed':
                    onCancel?.();
                    break;
                }
              }}
              disabled={uploadState === 'uploading' || uploadState === 'processing'}
            >
              {uploadState === 'uploading' || uploadState === 'processing' ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {stateConfig.primaryAction}
                  </Text>
                  {uploadState === 'idle' && (
                    <Icon name="videocam" size={20} color="#FFF" />
                  )}
                  {uploadState === 'recording' && (
                    <Icon name="stop" size={20} color="#FFF" />
                  )}
                  {uploadState === 'recorded' && (
                    <Icon name="cloud-upload" size={20} color="#FFF" />
                  )}
                  {uploadState === 'completed' && (
                    <Icon name="check" size={20} color="#FFF" />
                  )}
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        {uploadState === 'idle' && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Recording Tips</Text>
            <Text style={styles.tipsText}>
              • Keep it under 60 seconds{'\n'}
              • Speak clearly and share your genuine experience{'\n'}
              • Show the product/service if relevant{'\n'}
              • Your review helps build trust in the community
            </Text>
          </View>
        )}

        {/* FOMO Element */}
        {uploadState === 'idle' && (
          <View style={styles.fomoContainer}>
            <Icon name="trending-up" size={16} color="#FFF" />
            <Text style={styles.fomoText}>
              Most video reviews earn 500+ coins!
            </Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  closeButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  recordingIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 16,
    zIndex: 10,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginRight: spacing.xs,
    ...Platform.select({
      ios: {},
      android: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
    }),
  },
  recordingText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cameraPreview: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  cameraPlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.button,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  videoPreview: {
    alignItems: 'center',
  },
  previewText: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: spacing.md,
  },
  durationText: {
    ...typography.button,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  timerContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  timerText: {
    ...typography.h2,
    color: '#FFF',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerProgress: {
    width: screenWidth * 0.6,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: colors.error,
    borderRadius: 2,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressText: {
    ...typography.button,
    color: '#FFF',
    marginBottom: spacing.sm,
  },
  progressBar: {
    width: screenWidth * 0.7,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  progressPercent: {
    ...typography.caption,
    color: '#FFF',
    marginTop: spacing.sm,
    fontWeight: 'bold',
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustText: {
    ...typography.caption,
    color: '#FFF',
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    minWidth: 140,
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.button,
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  tipsTitle: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  tipsText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  fomoContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.sm,
  },
  fomoText: {
    ...typography.caption,
    color: '#000',
    fontWeight: 'bold',
  },
});