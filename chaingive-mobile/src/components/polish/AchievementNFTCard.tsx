import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface AchievementNFTCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  totalProgress?: number;
  claimed?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const AchievementNFTCard: React.FC<AchievementNFTCardProps> = ({
  id,
  title,
  description,
  image,
  rarity,
  unlocked,
  progress = 0,
  totalProgress = 100,
  claimed = false,
  onPress,
  style,
}) => {
  const getRarityColor = () => {
    switch (rarity) {
      case 'common':
        return colors.gray[400];
      case 'rare':
        return colors.primary;
      case 'epic':
        return colors.secondary;
      case 'legendary':
        return colors.gold;
      default:
        return colors.gray[400];
    }
  };

  const getRarityGradient = () => {
    switch (rarity) {
      case 'common':
        return [colors.gray[300], colors.gray[500]];
      case 'rare':
        return [colors.primary, colors.secondary];
      case 'epic':
        return [colors.secondary, colors.primary];
      case 'legendary':
        return [colors.gold, colors.secondary];
      default:
        return [colors.gray[300], colors.gray[500]];
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <MotiView
      from={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={style}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={!unlocked || claimed}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: getRarityColor(),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={getRarityGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 16,
            opacity: unlocked ? 1 : 0.6,
          }}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 10,
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}>
                {rarity}
              </Text>
            </View>

            {claimed && (
              <View style={{
                backgroundColor: colors.success,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}>
                  CLAIMED
                </Text>
              </View>
            )}
          </View>

          {/* Image/Icon */}
          <View style={{
            alignItems: 'center',
            marginBottom: 12,
          }}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 3,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            ) : (
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}>
                <Icon
                  name="emoji-events"
                  size={40}
                  color="white"
                />
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
          }}>
            {title}
          </Text>

          {/* Description */}
          <Text style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 12,
            lineHeight: 16,
          }}>
            {description}
          </Text>

          {/* Progress Bar */}
          {!unlocked && progress !== undefined && totalProgress !== undefined && (
            <View style={{ marginBottom: 12 }}>
              <View style={{
                height: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${(progress / totalProgress) * 100}%`,
                  backgroundColor: 'white',
                  borderRadius: 2,
                }} />
              </View>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 10,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {progress}/{totalProgress}
              </Text>
            </View>
          )}

          {/* Action Button */}
          {unlocked && !claimed && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              alignItems: 'center',
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
              }}>
                CLAIM REWARD
              </Text>
            </View>
          )}

          {!unlocked && (
            <View style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              alignItems: 'center',
            }}>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 12,
                fontWeight: 'bold',
              }}>
                LOCKED
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );
};

export default AchievementNFTCard;