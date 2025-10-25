import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

// Types for different motif styles
export type MotifType = 'kente' | 'adinkra' | 'yoruba' | 'geometric' | 'organic';

interface AfricanMotifsProps {
  type: MotifType;
  size?: number;
  color?: string;
  opacity?: number;
  style?: any;
}

const AfricanMotifs: React.FC<AfricanMotifsProps> = ({
  type,
  size = 100,
  color = '#2E8B57',
  opacity = 1,
  style,
}) => {
  const renderMotif = () => {
    switch (type) {
      case 'kente':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
            <G opacity={opacity}>
              {/* Kente pattern - alternating colored strips */}
              <Rect x="0" y="0" width="100" height="16.67" fill={color} />
              <Rect x="0" y="16.67" width="100" height="16.67" fill="#1E1E1E" />
              <Rect x="0" y="33.33" width="100" height="16.67" fill={color} />
              <Rect x="0" y="50" width="100" height="16.67" fill="#8E8E93" />
              <Rect x="0" y="66.67" width="100" height="16.67" fill={color} />
              <Rect x="0" y="83.33" width="100" height="16.67" fill="#1E1E1E" />
            </G>
          </Svg>
        );

      case 'adinkra':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
            <G opacity={opacity}>
              {/* Adinkra symbol - Gye Nyame (Except God) */}
              <Circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="3" />
              <Path
                d="M30 30 L70 30 L70 45 L50 65 L30 45 Z"
                fill={color}
                stroke={color}
                strokeWidth="2"
              />
              <Circle cx="50" cy="40" r="8" fill="#FFFFFF" />
              <Path d="M45 35 L55 35 M50 30 L50 50" stroke={color} strokeWidth="2" />
            </G>
          </Svg>
        );

      case 'yoruba':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
            <G opacity={opacity}>
              {/* Yoruba inspired geometric pattern */}
              <Circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="2" />
              <Circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="2" />
              <Circle cx="50" cy="50" r="15" fill="none" stroke={color} strokeWidth="2" />

              {/* Cross pattern */}
              <Path d="M20 50 L80 50 M50 20 L50 80" stroke={color} strokeWidth="3" />

              {/* Corner decorations */}
              <Circle cx="20" cy="20" r="5" fill={color} />
              <Circle cx="80" cy="20" r="5" fill={color} />
              <Circle cx="20" cy="80" r="5" fill={color} />
              <Circle cx="80" cy="80" r="5" fill={color} />
            </G>
          </Svg>
        );

      case 'geometric':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
            <G opacity={opacity}>
              {/* Modern geometric African-inspired pattern */}
              <Path
                d="M50 10 L90 50 L50 90 L10 50 Z"
                fill="none"
                stroke={color}
                strokeWidth="3"
              />
              <Path
                d="M50 25 L75 50 L50 75 L25 50 Z"
                fill={color}
                opacity="0.3"
              />
              <Circle cx="50" cy="50" r="8" fill={color} />
              <Circle cx="50" cy="50" r="3" fill="#FFFFFF" />
            </G>
          </Svg>
        );

      case 'organic':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
            <G opacity={opacity}>
              {/* Organic, flowing pattern inspired by African art */}
              <Path
                d="M20 50 Q35 20 50 50 T80 50 Q65 80 50 50 T20 50"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <Path
                d="M25 35 Q40 25 50 35 T75 35"
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.7"
              />
              <Path
                d="M25 65 Q40 75 50 65 T75 65"
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.7"
              />

              {/* Decorative dots */}
              <Circle cx="20" cy="50" r="3" fill={color} />
              <Circle cx="50" cy="50" r="3" fill={color} />
              <Circle cx="80" cy="50" r="3" fill={color} />
            </G>
          </Svg>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {renderMotif()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AfricanMotifs;