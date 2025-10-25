import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
  style?: any;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  earned,
  rarity,
  progress,
  maxProgress,
  style,
}) => {
  const getRarityColor = () => {
    switch (rarity) {
      case 'common':
        return '#8E8E93';
      case 'rare':
        return '#007AFF';
      case 'epic':
        return '#FF9500';
      case 'legendary':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getRarityIcon = () => {
    switch (rarity) {
      case 'common':
        return 'star-outline';
      case 'rare':
        return 'star';
      case 'epic':
        return 'star-half';
      case 'legendary':
        return 'trophy';
      default:
        return 'star-outline';
    }
  };

  const progressPercentage = progress && maxProgress
    ? (progress / maxProgress) * 100
    : earned ? 100 : 0;

  return (
    <View style={[styles.container, { borderColor: getRarityColor() }, style]}>
      {/* Badge Icon */}
      <View style={[styles.iconContainer, { backgroundColor: earned ? getRarityColor() : '#1E1E1E' }]}>
        <Ionicons
          name={earned ? icon as any : 'lock-closed' as any}
          size={24}
          color={earned ? '#FFFFFF' : '#8E8E93'}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: earned ? '#FFFFFF' : '#8E8E93' }]}>
            {title}
          </Text>
          <View style={styles.rarityIndicator}>
            <Ionicons
              name={getRarityIcon() as any}
              size={14}
              color={getRarityColor()}
            />
            <Text style={[styles.rarityText, { color: getRarityColor() }]}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: earned ? '#FFFFFF' : '#8E8E93' }]}>
          {description}
        </Text>

        {/* Progress Bar */}
        {!earned && progress !== undefined && maxProgress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: getRarityColor()
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress} / {maxProgress}
            </Text>
          </View>
        )}

        {/* Earned Indicator */}
        {earned && (
          <View style={styles.earnedIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#2E8B57" />
            <Text style={styles.earnedText}>Earned!</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  rarityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2D2D2E',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  earnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  earnedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
  },
});

export default AchievementBadge;