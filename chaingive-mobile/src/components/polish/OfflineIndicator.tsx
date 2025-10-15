import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface OfflineIndicatorProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
  style?: ViewStyle;
  compact?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onRetry,
  showRetryButton = true,
  style,
  compact = false,
  autoHide = false,
  autoHideDelay = 5000,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isRetrying, setIsRetrying] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = isConnected;
      const connected = state.isConnected ?? false;
      const type = state.type ?? 'unknown';

      setIsConnected(connected);
      setConnectionType(type);

      if (!connected && wasConnected) {
        // Just went offline
        setShowIndicator(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (connected && !wasConnected) {
        // Just came back online
        setShowIndicator(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (autoHide) {
          setTimeout(() => {
            setShowIndicator(false);
          }, autoHideDelay);
        }
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type ?? 'unknown');
    });

    return unsubscribe;
  }, [isConnected, autoHide, autoHideDelay]);

  const handleRetry = async () => {
    setIsRetrying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const state = await NetInfo.fetch();
      const connected = state.isConnected ?? false;

      if (connected) {
        setIsConnected(true);
        setConnectionType(state.type ?? 'unknown');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onRetry?.();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error checking network:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsRetrying(false);
  };

  const getConnectionIcon = () => {
    if (!isConnected) return 'wifi-off';

    switch (connectionType) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'signal-cellular-alt';
      case 'bluetooth':
        return 'bluetooth';
      case 'ethernet':
        return 'settings-ethernet';
      default:
        return 'wifi';
    }
  };

  const getConnectionText = () => {
    if (!isConnected) return 'No internet connection';

    switch (connectionType) {
      case 'wifi':
        return 'Connected to Wi-Fi';
      case 'cellular':
        return 'Connected to mobile data';
      case 'bluetooth':
        return 'Connected via Bluetooth';
      case 'ethernet':
        return 'Connected via Ethernet';
      default:
        return 'Connected';
    }
  };

  if (isConnected && !showIndicator) {
    return null;
  }

  if (compact) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={[
          {
            position: 'absolute',
            top: 50,
            left: 20,
            right: 20,
            backgroundColor: isConnected ? colors.success : colors.warning,
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 1000,
          },
          style,
        ]}
      >
        <Icon
          name={getConnectionIcon()}
          size={20}
          color="white"
        />
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 8,
            flex: 1,
          }}
        >
          {getConnectionText()}
        </Text>

        {!isConnected && showRetryButton && (
          <TouchableOpacity
            onPress={handleRetry}
            disabled={isRetrying}
            style={{
              marginLeft: 8,
              padding: 4,
            }}
          >
            <Icon
              name={isRetrying ? 'refresh' : 'refresh'}
              size={16}
              color="white"
            />
          </TouchableOpacity>
        )}
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      style={[
        {
          backgroundColor: isConnected ? colors.success : colors.warning,
          padding: 16,
          borderRadius: 12,
          margin: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MotiView
          animate={{
            scale: isConnected ? [1, 1.2, 1] : 1,
          }}
          transition={{
            type: 'timing',
            duration: isConnected ? 1000 : 0,
          }}
        >
          <Icon
            name={getConnectionIcon()}
            size={24}
            color="white"
          />
        </MotiView>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 2,
            }}
          >
            {isConnected ? 'Back Online' : 'You\'re Offline'}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 14,
            }}
          >
            {getConnectionText()}
          </Text>
        </View>

        {!isConnected && showRetryButton && (
          <TouchableOpacity
            onPress={handleRetry}
            disabled={isRetrying}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon
              name={isRetrying ? 'refresh' : 'refresh'}
              size={16}
              color="white"
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              {isRetrying ? 'Checking...' : 'Retry'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!isConnected && (
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 12,
            marginTop: 8,
            lineHeight: 16,
          }}
        >
          Some features may not work properly without an internet connection. Please check your network settings and try again.
        </Text>
      )}
    </MotiView>
  );
};

export default OfflineIndicator;