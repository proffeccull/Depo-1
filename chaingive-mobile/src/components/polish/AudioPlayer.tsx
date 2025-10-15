import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Slider,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  uri: string;
  duration?: number;
  artwork?: string;
}

interface AudioPlayerProps {
  track?: AudioTrack;
  playlist?: AudioTrack[];
  autoPlay?: boolean;
  showPlaylist?: boolean;
  showProgress?: boolean;
  showControls?: boolean;
  loop?: boolean;
  onTrackChange?: (track: AudioTrack) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  style?: ViewStyle;
  compact?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  playlist = [],
  autoPlay = false,
  showPlaylist = false,
  showProgress = true,
  showControls = true,
  loop = false,
  onTrackChange,
  onPlaybackStateChange,
  style,
  compact = false,
}) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(track || playlist[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isSeeking, setIsSeeking] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (track) {
      setCurrentTrack(track);
      loadTrack(track);
    }
  }, [track]);

  useEffect(() => {
    if (autoPlay && currentTrack) {
      playTrack();
    }
  }, [currentTrack, autoPlay]);

  const loadTrack = async (track: AudioTrack) => {
    try {
      setIsLoading(true);

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setDuration(track.duration || 0);
      setPosition(0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish && !loop) {
        // Auto-play next track
        const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex < playlist.length - 1) {
          const nextTrack = playlist[currentIndex + 1];
          setCurrentTrack(nextTrack);
          onTrackChange?.(nextTrack);
        } else {
          setIsPlaying(false);
        }
      }

      onPlaybackStateChange?.(status.isPlaying);
    }
  };

  const playTrack = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const pauseTrack = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  };

  const stopTrack = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        setPosition(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  };

  const seekTo = async (value: number) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error seeking audio:', error);
      }
    }
  };

  const setVolumeLevel = async (value: number) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(value);
        setVolume(value);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  };

  const skipToNext = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < playlist.length - 1) {
      const nextTrack = playlist[currentIndex + 1];
      setCurrentTrack(nextTrack);
      onTrackChange?.(nextTrack);
    }
  };

  const skipToPrevious = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      const prevTrack = playlist[currentIndex - 1];
      setCurrentTrack(prevTrack);
      onTrackChange?.(prevTrack);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekComplete = (value: number) => {
    setIsSeeking(false);
    seekTo(value);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (positionTimer.current) {
        clearInterval(positionTimer.current);
      }
    };
  }, []);

  if (!currentTrack) {
    return (
      <View style={[{ padding: 20, alignItems: 'center' }, style]}>
        <Icon name="music-off" size={48} color={colors.gray[400]} />
        <Text style={{ marginTop: 8, color: colors.text.secondary }}>
          No track selected
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', padding: 8 }, style]}>
        <TouchableOpacity onPress={togglePlayback} style={{ marginRight: 12 }}>
          <Icon
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
            {currentTrack.title}
          </Text>
          {currentTrack.artist && (
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>
              {currentTrack.artist}
            </Text>
          )}
        </View>

        <Text style={{ fontSize: 12, color: colors.text.secondary }}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={[
        {
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {/* Track Info */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {currentTrack.artwork && (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 8,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: 8,
              }}
            />
            {/* Placeholder for artwork */}
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="music-note" size={48} color="white" />
            </View>
          </View>
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          {currentTrack.title}
        </Text>

        {currentTrack.artist && (
          <Text
            style={{
              fontSize: 14,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            {currentTrack.artist}
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      {showProgress && (
        <View style={{ marginBottom: 20 }}>
          <Slider
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onValueChange={setPosition}
            onSlidingStart={handleSeekStart}
            onSlidingComplete={handleSeekComplete}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.gray[300]}
            thumbStyle={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>
              {formatTime(position)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>
      )}

      {/* Controls */}
      {showControls && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={skipToPrevious}
            style={{
              padding: 12,
              borderRadius: 24,
              backgroundColor: colors.gray[100],
              marginRight: 16,
            }}
          >
            <Icon name="skip-previous" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayback}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Icon
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={skipToNext}
            style={{
              padding: 12,
              borderRadius: 24,
              backgroundColor: colors.gray[100],
              marginLeft: 16,
            }}
          >
            <Icon name="skip-next" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Volume Control */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <Icon name="volume-down" size={20} color={colors.text.secondary} />
        <Slider
          style={{ flex: 1, marginHorizontal: 12 }}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolumeLevel}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.gray[300]}
          thumbStyle={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.primary,
          }}
        />
        <Icon name="volume-up" size={20} color={colors.text.secondary} />
      </View>
    </MotiView>
  );
};

export default AudioPlayer;