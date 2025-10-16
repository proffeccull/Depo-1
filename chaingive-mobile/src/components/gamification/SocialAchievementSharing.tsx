import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  rewardCoins: number;
}

interface LeaderboardEntry {
  id: string;
  userName: string;
  avatar?: string;
  score: number;
  rank: number;
  achievementCount: number;
}

interface SocialAchievementSharingProps {
  achievement: Achievement;
  currentUserRank?: number;
  leaderboard?: LeaderboardEntry[];
  onShare?: (platform: string, message: string, isPublic: boolean) => void;
}

const SHARE_PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: 'chat', color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: 'photo-camera', color: '#E4405F' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'message', color: '#25D366' },
  { id: 'copy', name: 'Copy Link', icon: 'content-copy', color: colors.primary },
];

const ACHIEVEMENT_TEMPLATES = [
  {
    id: 'celebration',
    title: '🎉 Achievement Unlocked!',
    message: 'I just unlocked "{achievement}" on ChainGive! 🌟 Join me in making a difference. #ChainGive #GivingBack',
  },
  {
    id: 'milestone',
    title: '🏆 Milestone Reached!',
    message: 'Hit a major milestone with "{achievement}"! Every donation counts. Let\'s keep the momentum going! 💪 #Impact #ChainGive',
  },
  {
    id: 'community',
    title: '🤝 Community Hero',
    message: 'Proud to be part of the ChainGive community! Unlocked "{achievement}" and loving the journey. Who\'s with me? 🙌 #Community #ChainGive',
  },
  {
    id: 'custom',
    title: '✨ My Achievement Story',
    message: 'Just unlocked "{achievement}" on ChainGive! This achievement means so much to me because... [Share your story]',
  },
];

export const SocialAchievementSharing: React.FC<SocialAchievementSharingProps> = ({
  achievement,
  currentUserRank,
  leaderboard = [],
  onShare,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(ACHIEVEMENT_TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '⭐';
      case 'epic': return '💎';
      case 'rare': return '🔥';
      default: return '🏅';
    }
  };

  const generateShareMessage = () => {
    let message = selectedTemplate.message.replace('{achievement}', achievement.name);

    if (selectedTemplate.id === 'custom' && customMessage.trim()) {
      message = customMessage;
    }

    if (taggedFriends.length > 0) {
      message += `\n\nTagging: ${taggedFriends.join(', ')}`;
    }

    return message;
  };

  const handleShare = async (platform: string) => {
    const message = generateShareMessage();

    try {
      if (platform === 'copy') {
        // Copy to clipboard logic would go here
        Alert.alert('Success', 'Achievement link copied to clipboard!');
      } else {
        await Share.share({
          message: message,
        });
      }

      onShare?.(platform, message, isPublic);
      setShowShareModal(false);

      // Show success animation or feedback
      Alert.alert('Shared!', `Your achievement has been shared on ${platform === 'copy' ? 'clipboard' : platform}!`);
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share achievement');
      }
    }
  };

  const handleTagFriend = (friendId: string) => {
    if (taggedFriends.includes(friendId)) {
      setTaggedFriends(taggedFriends.filter(id => id !== friendId));
    } else {
      setTaggedFriends([...taggedFriends, friendId]);
    }
  };

  const renderLeaderboardEntry = ({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.leaderboardEntry}>
      <Text style={styles.rank}>#{item.rank}</Text>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.userStats}>
            {item.achievementCount} achievements • {item.score} pts
          </Text>
        </View>
      </View>
      {item.rank === currentUserRank && (
        <View style={styles.currentUserBadge}>
          <Text style={styles.currentUserText}>You</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Achievement Card */}
      <View style={styles.achievementCard}>
        <LinearGradient
          colors={[getRarityColor(achievement.rarity), getRarityColor(achievement.rarity) + '80']}
          style={styles.achievementGradient}
        >
          <View style={styles.achievementHeader}>
            <View style={styles.achievementIcon}>
              <Text style={styles.rarityEmoji}>{getRarityIcon(achievement.rarity)}</Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementRarity}>{achievement.rarity.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.achievementDescription}>{achievement.description}</Text>

          <View style={styles.achievementStats}>
            <View style={styles.stat}>
              <Icon name="schedule" size={16} color="#FFF" />
              <Text style={styles.statText}>
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.stat}>
              <Icon name="monetization-on" size={16} color="#FFF" />
              <Text style={styles.statText}>+{achievement.rewardCoins} coins</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setShowShareModal(true)}
          >
            <Icon name="share" size={20} color="#FFF" />
            <Text style={styles.shareButtonText}>Share Achievement</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Leaderboard Preview */}
      {leaderboard.length > 0 && (
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
          <FlatList
            data={leaderboard.slice(0, 5)}
            renderItem={renderLeaderboardEntry}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.leaderboardList}
          />
        </View>
      )}

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Achievement</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Template Selection */}
              <View style={styles.templateSection}>
                <Text style={styles.sectionLabel}>Choose a template:</Text>
                {ACHIEVEMENT_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateOption,
                      selectedTemplate.id === template.id && styles.templateOptionSelected,
                    ]}
                    onPress={() => setSelectedTemplate(template)}
                  >
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <Text style={styles.templatePreview} numberOfLines={2}>
                      {template.message.replace('{achievement}', achievement.name)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Message */}
              {selectedTemplate.id === 'custom' && (
                <View style={styles.customMessageSection}>
                  <Text style={styles.sectionLabel}>Write your message:</Text>
                  <TextInput
                    style={styles.customMessageInput}
                    placeholder="Share your achievement story..."
                    value={customMessage}
                    onChangeText={setCustomMessage}
                    multiline
                    maxLength={280}
                  />
                  <Text style={styles.characterCount}>
                    {customMessage.length}/280
                  </Text>
                </View>
              )}

              {/* Privacy Toggle */}
              <View style={styles.privacySection}>
                <Text style={styles.sectionLabel}>Privacy:</Text>
                <View style={styles.privacyOptions}>
                  <TouchableOpacity
                    style={[styles.privacyOption, isPublic && styles.privacyOptionSelected]}
                    onPress={() => setIsPublic(true)}
                  >
                    <Icon name="public" size={16} color={isPublic ? colors.white : colors.primary} />
                    <Text style={[styles.privacyText, isPublic && styles.privacyTextSelected]}>
                      Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.privacyOption, !isPublic && styles.privacyOptionSelected]}
                    onPress={() => setIsPublic(false)}
                  >
                    <Icon name="lock" size={16} color={!isPublic ? colors.white : colors.primary} />
                    <Text style={[styles.privacyText, !isPublic && styles.privacyTextSelected]}>
                      Friends Only
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tag Friends */}
              <View style={styles.tagSection}>
                <Text style={styles.sectionLabel}>Tag friends (optional):</Text>
                <View style={styles.friendTags}>
                  {['Alice', 'Bob', 'Carol', 'David'].map((friend) => (
                    <TouchableOpacity
                      key={friend}
                      style={[
                        styles.friendTag,
                        taggedFriends.includes(friend) && styles.friendTagSelected,
                      ]}
                      onPress={() => handleTagFriend(friend)}
                    >
                      <Text style={[
                        styles.friendTagText,
                        taggedFriends.includes(friend) && styles.friendTagTextSelected,
                      ]}>
                        @{friend}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Share Preview */}
              <View style={styles.previewSection}>
                <Text style={styles.sectionLabel}>Preview:</Text>
                <View style={styles.previewCard}>
                  <Text style={styles.previewText}>{generateShareMessage()}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Share Platforms */}
            <View style={styles.sharePlatforms}>
              {SHARE_PLATFORMS.map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  style={[styles.platformButton, { borderColor: platform.color }]}
                  onPress={() => handleShare(platform.id)}
                >
                  <Icon name={platform.icon as any} size={20} color={platform.color} />
                  <Text style={[styles.platformText, { color: platform.color }]}>
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  achievementCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementGradient: {
    padding: spacing.lg,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rarityEmoji: {
    fontSize: 30,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  achievementRarity: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: 'bold',
  },
  achievementDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  achievementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: '#FFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  shareButtonText: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  leaderboardSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  leaderboardList: {
    gap: spacing.sm,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  rank: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
    width: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  userStats: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  currentUserBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  currentUserText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: spacing.lg,
  },
  templateSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  templateOption: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  templateTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  templatePreview: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  customMessageSection: {
    marginBottom: spacing.lg,
  },
  customMessageInput: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  characterCount: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  privacySection: {
    marginBottom: spacing.lg,
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  privacyOptionSelected: {
    backgroundColor: colors.primary,
  },
  privacyText: {
    ...typography.button,
    color: colors.primary,
  },
  privacyTextSelected: {
    color: colors.white,
  },
  tagSection: {
    marginBottom: spacing.lg,
  },
  friendTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  friendTag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  friendTagSelected: {
    backgroundColor: colors.primary,
  },
  friendTagText: {
    ...typography.caption,
    color: colors.primary,
  },
  friendTagTextSelected: {
    color: colors.white,
  },
  previewSection: {
    marginBottom: spacing.lg,
  },
  previewCard: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 12,
  },
  previewText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 20,
  },
  sharePlatforms: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  platformButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
  },
  platformText: {
    ...typography.button,
    fontWeight: 'bold',
  },
});

export default SocialAchievementSharing;