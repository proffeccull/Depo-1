import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';

interface ProgressiveImageProps {
  source: { uri: string } | number;
  style?: ViewStyle | ImageStyle;
  placeholderStyle?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  blurRadius?: number;
  showLoadingIndicator?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  style,
  placeholderStyle,
  containerStyle,
  resizeMode = 'cover',
  blurRadius = 10,
  showLoadingIndicator = true,
  onLoadStart,
  onLoadEnd,
  onError,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset state when source changes
    setLoading(true);
    setError(false);
    setImageLoaded(false);
  }, [source]);

  const handleLoadStart = () => {
    setLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setImageLoaded(true);
    onLoadEnd?.();
  };

  const handleError = (err: any) => {
    setLoading(false);
    setError(true);
    onError?.(err);
  };

  const renderPlaceholder = () => {
    if (!showLoadingIndicator) return null;

    return (
      <View style={[styles.placeholder, placeholderStyle]}>
        <ActivityIndicator
          size="small"
          color="#2E8B57"
          accessibilityLabel="Loading image"
        />
      </View>
    );
  };

  const renderErrorState = () => (
    <View style={[styles.errorContainer, placeholderStyle]}>
      <View style={styles.errorIcon}>
        <Image
          source={require('../../assets/images/image-error.png')}
          style={styles.errorImage}
          accessibilityLabel="Image failed to load"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Main Image */}
      <Image
        source={source}
        style={[
          styles.image,
          style,
          loading && !imageLoaded && { opacity: 0 }
        ]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />

      {/* Low Quality Placeholder/Loading State */}
      {loading && !imageLoaded && !error && renderPlaceholder()}

      {/* Error State */}
      {error && renderErrorState()}

      {/* Blur overlay for smooth transition */}
      {loading && !imageLoaded && !error && (
        <View style={[styles.blurOverlay, style]}>
          <Image
            source={source}
            style={[styles.blurImage, style]}
            resizeMode={resizeMode}
            blurRadius={blurRadius}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    zIndex: 1,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  blurImage: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    zIndex: 3,
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorImage: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default ProgressiveImage;