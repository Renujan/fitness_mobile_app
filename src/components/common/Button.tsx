import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Palette } from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.base];

    if (size === 'small') list.push(styles.sizeSmall);
    else if (size === 'large') list.push(styles.sizeLarge);
    else list.push(styles.sizeMedium);

    if (variant === 'primary') list.push(styles.primary);
    else if (variant === 'secondary') list.push(styles.secondary);
    else if (variant === 'outline') list.push(styles.outline);
    else if (variant === 'danger') list.push(styles.danger);
    else if (variant === 'ghost') list.push(styles.ghost);

    if (disabled) list.push(styles.disabled);

    return list;
  };

  const getTextColor = (): string => {
    if (variant === 'primary') return '#0B0F14';
    if (variant === 'secondary') return '#0B0F14';
    if (variant === 'danger') return '#FFFFFF';
    if (variant === 'outline') return Palette.primary;
    return Palette.text;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        ...getButtonStyles(),
        { opacity: pressed && !disabled ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sizeMedium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sizeLarge: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  primary: {
    backgroundColor: Palette.primary,
  },
  secondary: {
    backgroundColor: Palette.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Palette.primary,
  },
  danger: {
    backgroundColor: Palette.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
