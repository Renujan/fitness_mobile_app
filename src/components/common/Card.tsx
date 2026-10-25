import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { Palette } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accent?: 'none' | 'primary' | 'secondary' | 'danger';
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  accent = 'none',
  elevated = false,
}) => {
  const accentBorder =
    accent === 'primary'
      ? { borderColor: Palette.primary, borderWidth: 1 }
      : accent === 'secondary'
      ? { borderColor: Palette.secondary, borderWidth: 1 }
      : accent === 'danger'
      ? { borderColor: Palette.danger, borderWidth: 1 }
      : null;

  const content = (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        accentBorder,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 16,
    marginBottom: 12,
  },
  elevated: {
    backgroundColor: Palette.cardElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
