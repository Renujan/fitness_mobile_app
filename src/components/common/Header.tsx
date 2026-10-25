import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Palette } from '@/constants/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.textContainer}>
        {subtitle && <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightAction && <View style={styles.actionContainer}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.text,
    letterSpacing: -0.5,
  },
  actionContainer: {
    marginLeft: 12,
  },
});
