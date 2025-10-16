import React, { useState } from 'react';
import { Image, View, ActivityIndicator, ImageStyle, ImageSourcePropType } from 'react-native';

interface LazyImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
  placeholder?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  source, 
  style, 
  placeholder 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        {placeholder || <ActivityIndicator />}
      </View>
    );
  }

  return (
    <View style={style}>
      {loading && (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator />
        </View>
      )}
      <Image
        source={source}
        style={style}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        resizeMode="cover"
      />
    </View>
  );
};