import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  ViewStyle,
  Text,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarouselImage {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  onPress?: () => void;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  width?: number;
  height?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  onImagePress?: (image: CarouselImage, index: number) => void;
  onIndexChange?: (index: number) => void;
  style?: ViewStyle;
  imageStyle?: ViewStyle;
  indicatorStyle?: ViewStyle;
  arrowStyle?: ViewStyle;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  width = SCREEN_WIDTH,
  height = 200,
  showIndicators = true,
  showArrows = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  loop = true,
  onImagePress,
  onIndexChange,
  style,
  imageStyle,
  indicatorStyle,
  arrowStyle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout>();

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);

    if (roundIndex !== currentIndex) {
      setCurrentIndex(roundIndex);
      onIndexChange?.(roundIndex);
    }
  };

  const goToSlide = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let targetIndex = index;
    if (loop) {
      if (index < 0) targetIndex = images.length - 1;
      if (index >= images.length) targetIndex = 0;
    } else {
      targetIndex = Math.max(0, Math.min(index, images.length - 1));
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

  const handleImagePress = (image: CarouselImage, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onImagePress?.(image, index);
    image.onPress?.();
  };

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay && images.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [autoPlay, autoPlayInterval, images.length]);

  const renderImage = (image: CarouselImage, index: number) => (
    <TouchableOpacity
      key={image.id}
      onPress={() => handleImagePress(image, index)}
      activeOpacity={0.9}
      style={{
        width,
        height,
        position: 'relative',
      }}
    >
      <Image
        source={{ uri: image.uri }}
        style={[
          {
            width,
            height,
            resizeMode: 'cover',
          },
          imageStyle,
        ]}
      />

      {/* Overlay content */}
      {(image.title || image.description) && (
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
          {image.title && (
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 4,
              }}
            >
              {image.title}
            </Text>
          )}
          {image.description && (
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 20,
              }}
            >
              {image.description}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderIndicators = () => {
    if (!showIndicators || images.length <= 1) return null;

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
        {images.map((_, index) => (
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
    if (!showArrows || images.length <= 1) return null;

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
          {images.map((image, index) => renderImage(image, index))}
        </ScrollView>

        {renderArrows()}
      </View>

      {renderIndicators()}
    </View>
  );
};

export default ImageCarousel;