import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchMessages, sendMessage } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const MessagingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const { recipientId, recipientName } = route.params as { recipientId: string; recipientName: string };

  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user?.id && recipientId) {
      dispatch(fetchMessages({ userId: user.id, recipientId }));
    }
  }, [dispatch, user?.id, recipientId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(sendMessage({
        senderId: user.id,
        recipientId,
        content: newMessage.trim(),
      })).unwrap();

      setNewMessage('');
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      showToast(error.message || 'Failed to send message', 'error');
    }
  };

  const renderMessage = ({ item: message }: { item: any }) => {
    const isOwnMessage = message.senderId === user?.id;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}>
            {message.content}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
        ]}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.recipientInfo}
          onPress={() => navigation.navigate('UserProfile' as never, { userId: recipientId })}
        >
          <View style={styles.recipientAvatar}>
            <Text style={styles.recipientInitial}>
              {recipientName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.recipientStatus}>🟢 Online</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="chat" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyMessage}>
                  Start a conversation with {recipientName}!
                </Text>
              </View>
            }
          />
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Icon
                name="send"
                size={20}
                color={newMessage.trim() ? colors.white : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: spacing.sm,
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  recipientInitial: {
    ...typography.bodyBold,
    color: colors.white,
  },
  recipientName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  recipientStatus: {
    ...typography.caption,
    color: colors.success,
  },
  moreButton: {
    padding: spacing.xs,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: screenWidth * 0.8,
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: screenWidth * 0.75,
  },
  ownMessageBubble: {
    backgroundColor: colors.primary,
  },
  otherMessageBubble: {
    backgroundColor: colors.white,
    ...shadows.small,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  ownMessageTime: {
    color: colors.text.secondary,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: colors.text.secondary,
    textAlign: 'left',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  messageInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    maxHeight: 100,
    minHeight: 36,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
});

export default MessagingScreen;