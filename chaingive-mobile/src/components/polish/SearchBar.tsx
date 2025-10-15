import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  showVoiceButton?: boolean;
  onVoicePress?: () => void;
  variant?: 'filled' | 'outlined' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  leftIcon?: string;
  rightIcon?: string;
  animated?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Search...',
  debounceMs = 300,
  showClearButton = true,
  showVoiceButton = false,
  onVoicePress,
  variant = 'filled',
  size = 'medium',
  style,
  inputStyle,
  leftIcon = 'search',
  rightIcon,
  animated = true,
  value,
  onChangeText,
  ...props
}) => {
  const [query, setQuery] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch?.(query);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs, onSearch]);

  const handleFocus = () => {
    setIsFocused(true);
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 300,
          friction: 3,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 3,
        }),
        Animated.timing(opacityAnim, {
          toValue: query.length > 0 ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleVoicePress = () => {
    onVoicePress?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 36,
          paddingHorizontal: 12,
          borderRadius: 18,
          fontSize: 14,
        };
      case 'medium':
        return {
          height: 44,
          paddingHorizontal: 16,
          borderRadius: 22,
          fontSize: 16,
        };
      case 'large':
        return {
          height: 52,
          paddingHorizontal: 20,
          borderRadius: 26,
          fontSize: 18,
        };
      default:
        return {
          height: 44,
          paddingHorizontal: 16,
          borderRadius: 22,
          fontSize: 16,
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      ...getSizeStyles(),
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: isFocused ? colors.gray[100] : colors.gray[50],
          borderWidth: 1,
          borderColor: isFocused ? colors.primary : 'transparent',
        };
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isFocused ? colors.primary : colors.gray[300],
        };
      case 'underlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: isFocused ? colors.primary : colors.gray[300],
          borderRadius: 0,
          paddingHorizontal: 0,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: colors.gray[50],
          borderWidth: 1,
          borderColor: isFocused ? colors.primary : 'transparent',
        };
    }
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <View style={{ marginRight: 8 }}>
        <Icon
          name={leftIcon}
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
          color={isFocused ? colors.primary : colors.gray[500]}
        />
      </View>
    );
  };

  const renderRightContent = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Voice Button */}
        {showVoiceButton && (
          <TouchableOpacity
            onPress={handleVoicePress}
            style={{
              padding: 4,
              marginRight: query.length > 0 ? 4 : 0,
            }}
          >
            <Icon
              name="mic"
              size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
              color={colors.gray[500]}
            />
          </TouchableOpacity>
        )}

        {/* Clear Button */}
        {showClearButton && query.length > 0 && (
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
          >
            <TouchableOpacity
              onPress={handleClear}
              style={{
                padding: 4,
                borderRadius: 12,
                backgroundColor: colors.gray[200],
              }}
            >
              <Icon
                name="close"
                size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
                color={colors.gray[600]}
              />
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Custom Right Icon */}
        {rightIcon && (
          <View style={{ marginLeft: 8 }}>
            <Icon
              name={rightIcon}
              size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
              color={colors.gray[500]}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <View style={getVariantStyles()}>
        {renderLeftIcon()}

        <TextInput
          {...props}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            onChangeText?.(text);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            {
              flex: 1,
              color: colors.text.primary,
              fontSize: getSizeStyles().fontSize,
            },
            inputStyle,
          ]}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {renderRightContent()}
      </View>
    </Animated.View>
  );
};

export default SearchBar;