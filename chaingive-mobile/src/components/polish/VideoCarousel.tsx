import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
  Text,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Video } from 'expo-av';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarouselVideo {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  onPress?: () => void;
}

interface VideoCarouselProps {
  videos: CarouselVideo[];
  width?: number;
  height?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  onVideoPress?: (video: CarouselVideo, index: number) => void;
  onIndexChange?: (index: number) => void;
  style?: ViewStyle;
  videoStyle?: ViewStyle;
  indicatorStyle?: ViewStyle;
  arrowStyle?: ViewStyle;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({
  videos,
  width = SCREEN_WIDTH,
  height = 200,
  showIndicators = true,
  showArrows = false,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = true,
  onVideoPress,
  onIndexChange,
  style,
  videoStyle,
  indicatorStyle,
  arrowStyle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRefs = useRef<{ [key: string]: any }>({});
  const autoPlayTimer = useRef<NodeJS.Timeout>();

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);

    if (roundIndex !== currentIndex) {
      // Pause previous video
      if (playingVideo) {
        const prevVideo = videos.find(v => v.id === playingVideo);
        if (prevVideo && videoRefs.current[playingVideo]) {
          videoRefs.current[playingVideo].pauseAsync();
        }
      }

      setCurrentIndex(roundIndex);
      setPlayingVideo(null);
      onIndexChange?.(roundIndex);
    }
  };

  const goToSlide = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let targetIndex = index;
    if (loop) {
      if (index < 0) targetIndex = videos.length - 1;
      if (index >= videos.length) targetIndex = 0;
    } else {
      targetIndex = Math.max(0, Math.min(index, videos.length - 1));
    }

    scrollViewRef.current?.scrollTo({
      x: targetIndex * width,
      animated: true,
    });
    setCurrentIndex(targetIndex);
    onIndexChange?.(targetIndex);
  };

  const goToNext = () => {
    goToSlide(currentIndex + 1);
  };

  const goToPrev = () => {
    goToSlide(currentIndex - 1);
  };

  const handleVideoPress = (video: CarouselVideo, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (playingVideo === video.id) {
      // Pause current video
      if (videoRefs.current[video.id]) {
        videoRefs.current[video.id].pauseAsync();
      }
      setPlayingVideo(null);
    } else {
      // Pause any playing video
      if (playingVideo && videoRefs.current[playingVideo]) {
        videoRefs.current[playingVideo].pauseAsync();
      }

      // Play new video
      if (videoRefs.current[video.id]) {
        videoRefs.current[video.id].playAsync();
      }
      setPlayingVideo(video.id);
    }

    onVideoPress?.(video, index);
    video.onPress?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay && videos.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [autoPlay, autoPlayInterval, videos.length]);

  const renderVideo = (video: CarouselVideo, index: number) => {
    const isPlaying = playingVideo === video.id;

    return (
      <TouchableOpacity
        key={video.id}
        onPress={() => handleVideoPress(video, index)}
        activeOpacity={0.9}
        style={{
          width,
          height,
          position: 'relative',
        }}
      >
        <Video
          ref={(ref) => {
            if (ref) videoRefs.current[video.id] = ref;
          }}
          source={{ uri: video.uri }}
          style={[
            {
              width,
              height,
            },
            videoStyle,
          ]}
          resizeMode="cover"
          shouldPlay={false}
          isLooping={false}
          useNativeControls={false}
          posterSource={video.thumbnail ? { uri: video.thumbnail } : undefined}
          posterStyle={{ resizeMode: 'cover' }}
        />

        {/* Play/Pause Overlay */}
        <MotiView
          animate={{
            opacity: isPlaying ? 0 : 0.8,
            scale: isPlaying ? 0.8 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -30 }, { translateY: -30 }],
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={30}
            color="white"
          />
        </MotiView>

        {/* Duration Badge */}
        {video.duration && (
          <View
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: 'white',
                fontWeight: '500',
              }}
            >
              {formatDuration(video.duration)}
            </Text>
          </View>
        )}

        {/* Content Overlay */}
        {(video.title || video.description) && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: 16,
            }}
          >
            {video.title && (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 4,
                }}
              >
                {video.title}
              </Text>
            )}
            {video.description && (
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 20,
                }}
              >
                {video.description}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderIndicators = () => {
    if (!showIndicators || videos.length <= 1) return null;

    return (
      <View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 16,
          },
          indicatorStyle,
        ]}
      >
        {videos.map((_, index) => (
          <MotiView
            key={index}
            animate={{
              scale: currentIndex === index ? 1.2 : 1,
              opacity: currentIndex === index ? 1 : 0.5,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
          >
            <TouchableOpacity
              onPress={() => goToSlide(index)}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === index ? colors.primary : colors.gray[400],
                marginHorizontal: 4,
              }}
            />
          </MotiView>
        ))}
      </View>
    );
  };

  const renderArrows = () => {
    if (!showArrows || videos.length <= 1) return null;

    return (
      <>
        {/* Left Arrow */}
        <TouchableOpacity
          onPress={goToPrev}
          style={[
            {
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: [{ translateY: -20 }],
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            },
            arrowStyle,
          ]}
        >
          <Icon name="chevron-left" size={24} color="white" />
        </TouchableOpacity>

        {/* Right Arrow */}
        <TouchableOpacity
          onPress={goToNext}
          style={[
            {
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: [{ translateY: -20 }],
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            },
            arrowStyle,
          ]}
        >
          <Icon name="chevron-right" size={24} color="white" />
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={[{ width }, style]}>
      <View style={{ position: 'relative' }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width, height }}
        >
          {videos.map((video, index) => renderVideo(video, index))}
        </ScrollView>

        {renderArrows()}
      </View>

      {renderIndicators()}
    </View>
  );
};

export default VideoCarousel;