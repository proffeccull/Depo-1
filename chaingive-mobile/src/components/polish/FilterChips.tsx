import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface FilterChip {
  key: string;
  label: string;
  icon?: string;
  count?: number;
  color?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedChips?: string[];
  onChipPress?: (chipKey: string) => void;
  onChipRemove?: (chipKey: string) => void;
  multiSelect?: boolean;
  variant?: 'filled' | 'outlined' | 'elevated';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showClearAll?: boolean;
  onClearAll?: () => void;
  maxChipsPerRow?: number;
  animated?: boolean;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  selectedChips = [],
  onChipPress,
  onChipRemove,
  multiSelect = true,
  variant = 'filled',
  size = 'medium',
  style,
  showClearAll = false,
  onClearAll,
  maxChipsPerRow,
  animated = true,
}) => {
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedChips);

  const handleChipPress = (chipKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (multiSelect) {
      const newSelected = internalSelected.includes(chipKey)
        ? internalSelected.filter(key => key !== chipKey)
        : [...internalSelected, chipKey];

      setInternalSelected(newSelected);
      onChipPress?.(chipKey);
    } else {
      setInternalSelected([chipKey]);
      onChipPress?.(chipKey);
    }
  };

  const handleChipRemove = (chipKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = internalSelected.filter(key => key !== chipKey);
    setInternalSelected(newSelected);
    onChipRemove?.(chipKey);
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInternalSelected([]);
    onClearAll?.();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 12,
          iconSize: 14,
        };
      case 'medium':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          fontSize: 14,
          iconSize: 16,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          fontSize: 16,
          iconSize: 18,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          fontSize: 14,
          iconSize: 16,
        };
    }
  };

  const getVariantStyles = (isSelected: boolean) => {
    const sizeStyles = getSizeStyles();

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: isSelected ? colors.primary : colors.gray[100],
          borderWidth: 0,
          textColor: isSelected ? 'white' : colors.text.primary,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isSelected ? colors.primary : colors.gray[300],
          textColor: isSelected ? colors.primary : colors.text.primary,
        };
      case 'elevated':
        return {
          backgroundColor: isSelected ? colors.primary : 'white',
          borderWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isSelected ? 0.3 : 0.1,
          shadowRadius: 2,
          elevation: isSelected ? 4 : 2,
          textColor: isSelected ? 'white' : colors.text.primary,
        };
      default:
        return {
          backgroundColor: isSelected ? colors.primary : colors.gray[100],
          borderWidth: 0,
          textColor: isSelected ? 'white' : colors.text.primary,
        };
    }
  };

  const renderChip = (chip: FilterChip) => {
    const isSelected = internalSelected.includes(chip.key);
    const sizeStyles = getSizeStyles();
    const variantStyles = getVariantStyles(isSelected);

    const ChipContent = () => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: sizeStyles.borderRadius,
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          shadowColor: variantStyles.shadowColor,
          shadowOffset: variantStyles.shadowOffset,
          shadowOpacity: variantStyles.shadowOpacity,
          shadowRadius: variantStyles.shadowRadius,
          elevation: variantStyles.elevation,
        }}
      >
        {/* Icon */}
        {chip.icon && (
          <Icon
            name={chip.icon}
            size={sizeStyles.iconSize}
            color={variantStyles.textColor}
            style={{ marginRight: 6 }}
          />
        )}

        {/* Label */}
        <Text
          style={{
            fontSize: sizeStyles.fontSize,
            color: variantStyles.textColor,
            fontWeight: isSelected ? '600' : '400',
          }}
        >
          {chip.label}
        </Text>

        {/* Count Badge */}
        {chip.count !== undefined && chip.count > 0 && (
          <View
            style={{
              marginLeft: 6,
              paddingHorizontal: 4,
              paddingVertical: 1,
              borderRadius: 8,
              backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: sizeStyles.fontSize - 2,
                color: isSelected ? 'white' : 'white',
                fontWeight: '600',
              }}
            >
              {chip.count}
            </Text>
          </View>
        )}

        {/* Remove Button */}
        {isSelected && onChipRemove && (
          <TouchableOpacity
            onPress={() => handleChipRemove(chip.key)}
            style={{
              marginLeft: 6,
              padding: 2,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          >
            <Icon
              name="close"
              size={sizeStyles.iconSize - 2}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>
    );

    if (animated) {
      return (
        <MotiView
          key={chip.key}
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
          style={{ margin: 4 }}
        >
          <TouchableOpacity
            onPress={() => handleChipPress(chip.key)}
            activeOpacity={0.7}
          >
            <ChipContent />
          </TouchableOpacity>
        </MotiView>
      );
    }

    return (
      <TouchableOpacity
        key={chip.key}
        onPress={() => handleChipPress(chip.key)}
        activeOpacity={0.7}
        style={{ margin: 4 }}
      >
        <ChipContent />
      </TouchableOpacity>
    );
  };

  return (
    <View style={style}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 4,
          paddingVertical: 8,
        }}
      >
        <View style={{
          flexDirection: 'row',
          flexWrap: maxChipsPerRow ? 'wrap' : 'nowrap',
          maxWidth: maxChipsPerRow ? maxChipsPerRow * 120 : undefined,
        }}>
          {chips.map(renderChip)}
        </View>

        {/* Clear All Button */}
        {showClearAll && internalSelected.length > 0 && (
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
            style={{ margin: 4 }}
          >
            <TouchableOpacity
              onPress={handleClearAll}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: colors.error,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon
                name="clear-all"
                size={16}
                color="white"
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                Clear All
              </Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
};

export default FilterChips;