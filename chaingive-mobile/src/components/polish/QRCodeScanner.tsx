import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { Camera, CameraView } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QRCodeScannerProps {
  onScan?: (data: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
  showOverlay?: boolean;
  overlayColor?: string;
  cornerRadius?: number;
  scanAreaSize?: number;
  flashMode?: 'off' | 'on' | 'auto';
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onError,
  enabled = true,
  showOverlay = true,
  overlayColor = 'rgba(0, 0, 0, 0.7)',
  cornerRadius = 16,
  scanAreaSize = 250,
  flashMode = 'off',
  style,
  title = 'Scan QR Code',
  subtitle = 'Position the QR code within the frame',
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!enabled || scanned) return;

    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Vibrate for success
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    onScan?.(data);

    // Reset scanned state after a delay
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  const toggleFlash = () => {
    setFlash(!flash);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission',
        'Camera access is required to scan QR codes. Please enable camera permissions in your device settings.',
        [{ text: 'OK' }]
      );
      onError?.('Camera permission denied');
    }
  };

  if (hasPermission === null) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.gray[900],
          },
          style,
        ]}
      >
        <MotiView
          from={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
          }}
        >
          <Icon name="camera" size={48} color={colors.primary} />
        </MotiView>
        <Text style={{ marginTop: 16, color: 'white', fontSize: 16 }}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.gray[900],
            padding: 20,
          },
          style,
        ]}
      >
        <Icon name="camera-off" size={64} color={colors.error} />
        <Text
          style={{
            marginTop: 16,
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Camera Access Required
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: colors.gray[300],
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          To scan QR codes, please enable camera permissions in your device settings.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{
            marginTop: 24,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: colors.primary,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scanAreaX = (SCREEN_WIDTH - scanAreaSize) / 2;
  const scanAreaY = (SCREEN_HEIGHT - scanAreaSize) / 2;

  return (
    <View style={[{ flex: 1 }, style]}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        enableTorch={flash}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay */}
        {showOverlay && (
          <View style={{ flex: 1, backgroundColor: overlayColor }}>
            {/* Top overlay */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: scanAreaY,
                backgroundColor: overlayColor,
              }}
            />

            {/* Bottom overlay */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: scanAreaY,
                backgroundColor: overlayColor,
              }}
            />

            {/* Left overlay */}
            <View
              style={{
                position: 'absolute',
                top: scanAreaY,
                left: 0,
                width: scanAreaX,
                height: scanAreaSize,
                backgroundColor: overlayColor,
              }}
            />

            {/* Right overlay */}
            <View
              style={{
                position: 'absolute',
                top: scanAreaY,
                right: 0,
                width: scanAreaX,
                height: scanAreaSize,
                backgroundColor: overlayColor,
              }}
            />

            {/* Scan area border */}
            <View
              style={{
                position: 'absolute',
                top: scanAreaY,
                left: scanAreaX,
                width: scanAreaSize,
                height: scanAreaSize,
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: cornerRadius,
                backgroundColor: 'transparent',
              }}
            >
              {/* Corner markers */}
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  width: 20,
                  height: 20,
                  borderTopWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: colors.primary,
                  borderTopLeftRadius: cornerRadius,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 20,
                  height: 20,
                  borderTopWidth: 4,
                  borderRightWidth: 4,
                  borderColor: colors.primary,
                  borderTopRightRadius: cornerRadius,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: -2,
                  width: 20,
                  height: 20,
                  borderBottomWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: colors.primary,
                  borderBottomLeftRadius: cornerRadius,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 20,
                  height: 20,
                  borderBottomWidth: 4,
                  borderRightWidth: 4,
                  borderColor: colors.primary,
                  borderBottomRightRadius: cornerRadius,
                }}
              />
            </View>
          </View>
        )}

        {/* Header */}
        <View
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.gray[300],
              textAlign: 'center',
            }}
          >
            {subtitle}
          </Text>
        </View>

        {/* Controls */}
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Flash toggle */}
          <TouchableOpacity
            onPress={toggleFlash}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 20,
            }}
          >
            <Icon
              name={flash ? 'flash-on' : 'flash-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          {/* Scan indicator */}
          <MotiView
            animate={{
              scale: scanned ? 1.2 : 1,
              opacity: scanned ? 0.8 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: scanned ? colors.success : colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name={scanned ? 'check-circle' : 'qr-code-scanner'}
              size={30}
              color="white"
            />
          </MotiView>
        </View>

        {/* Success message */}
        {scanned && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              bottom: 200,
              left: 20,
              right: 20,
              backgroundColor: colors.success,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Icon name="check-circle" size={24} color="white" />
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                marginTop: 8,
              }}
            >
              QR Code Scanned Successfully!
            </Text>
          </MotiView>
        )}
      </CameraView>
    </View>
  );
};

export default QRCodeScanner;