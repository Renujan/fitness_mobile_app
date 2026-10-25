import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Palette } from '@/constants/Colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'neutral' | 'success' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: Palette.secondaryGlow, borderColor: Palette.secondary };
      case 'danger':
        return { backgroundColor: Palette.dangerGlow, borderColor: Palette.danger };
      case 'neutral':
        return { backgroundColor: Palette.cardBorder, borderColor: Palette.border };
      case 'primary':
      default:
        return { backgroundColor: Palette.primaryGlow, borderColor: Palette.primary };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return Palette.secondary;
      case 'danger':
        return Palette.danger;
      case 'neutral':
        return Palette.textSecondary;
      case 'primary':
      default:
        return Palette.primary;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
