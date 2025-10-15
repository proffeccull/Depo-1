import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';

interface NetworkStatusProps {
  style?: ViewStyle;
  showDetails?: boolean;
  compact?: boolean;
}

interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
  details: any;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  style,
  showDetails = false,
  compact = false,
}) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: null,
    details: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        type: state.type ?? 'unknown',
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });
    });

    // Initial fetch
    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        type: state.type ?? 'unknown',
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });
    });

    return unsubscribe;
  }, []);

  const getConnectionIcon = () => {
    if (!networkState.isConnected) return 'wifi-off';

    switch (networkState.type) {
      case 'wifi':
        return networkState.isInternetReachable ? 'wifi' : 'wifi-off';
      case 'cellular':
        return networkState.isInternetReachable ? 'signal-cellular-alt' : 'signal-cellular-connected-no-internet-4-bar';
      case 'bluetooth':
        return 'bluetooth';
      case 'ethernet':
        return 'settings-ethernet';
      case 'wimax':
        return 'wifi';
      default:
        return 'wifi-find';
    }
  };

  const getConnectionColor = () => {
    if (!networkState.isConnected) return colors.error;
    if (networkState.isInternetReachable === false) return colors.warning;
    return colors.success;
  };

  const getConnectionText = () => {
    if (!networkState.isConnected) return 'Disconnected';

    switch (networkState.type) {
      case 'wifi':
        return networkState.isInternetReachable ? 'Wi-Fi Connected' : 'Wi-Fi (No Internet)';
      case 'cellular':
        return networkState.isInternetReachable ? 'Mobile Data' : 'Mobile Data (No Internet)';
      case 'bluetooth':
        return 'Bluetooth';
      case 'ethernet':
        return 'Ethernet';
      case 'wimax':
        return 'WiMAX';
      default:
        return 'Unknown';
    }
  };

  const getSignalStrength = () => {
    if (networkState.type !== 'cellular' || !networkState.details) return null;

    const strength = networkState.details.strength;
    if (strength >= 75) return 'Excellent';
    if (strength >= 50) return 'Good';
    if (strength >= 25) return 'Fair';
    return 'Poor';
  };

  if (compact) {
    return (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: colors.gray[100],
            borderRadius: 12,
          },
          style,
        ]}
      >
        <Icon
          name={getConnectionIcon()}
          size={16}
          color={getConnectionColor()}
        />
        <Text
          style={{
            marginLeft: 4,
            fontSize: 12,
            color: colors.text.secondary,
            fontWeight: '500',
          }}
        >
          {getConnectionText()}
        </Text>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={[
        {
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <MotiView
          animate={{
            scale: networkState.isConnected && networkState.isInternetReachable ? [1, 1.1, 1] : 1,
          }}
          transition={{
            type: 'timing',
            duration: networkState.isConnected && networkState.isInternetReachable ? 2000 : 0,
            loop: networkState.isConnected && networkState.isInternetReachable,
          }}
        >
          <Icon
            name={getConnectionIcon()}
            size={24}
            color={getConnectionColor()}
          />
        </MotiView>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.text.primary,
            }}
          >
            Network Status
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text.secondary,
              marginTop: 2,
            }}
          >
            {getConnectionText()}
          </Text>
        </View>

        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: getConnectionColor(),
          }}
        />
      </View>

      {showDetails && (
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              Connection Type:
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '500' }}>
              {networkState.type.charAt(0).toUpperCase() + networkState.type.slice(1)}
            </Text>
          </View>

          {networkState.details && (
            <>
              {networkState.details.ssid && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                    Network Name:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '500' }}>
                    {networkState.details.ssid}
                  </Text>
                </View>
              )}

              {networkState.details.frequency && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                    Frequency:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '500' }}>
                    {networkState.details.frequency} MHz
                  </Text>
                </View>
              )}

              {getSignalStrength() && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                    Signal Strength:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '500' }}>
                    {getSignalStrength()}
                  </Text>
                </View>
              )}

              {networkState.details.ipAddress && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                    IP Address:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '500' }}>
                    {networkState.details.ipAddress}
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              Internet Reachable:
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: networkState.isInternetReachable ? colors.success : colors.error,
                fontWeight: '500',
              }}
            >
              {networkState.isInternetReachable === null ? 'Checking...' : networkState.isInternetReachable ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      )}
    </MotiView>
  );
};

export default NetworkStatus;