import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { Palette } from '@/constants/Colors';

interface ProgressBarProps {
  current: number;
  target: number;
  unit?: string;
  label?: string;
  color?: string;
  height?: number;
  showLabels?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  unit = '',
  label,
  color = Palette.primary,
  height = 8,
  showLabels = true,
  style,
}) => {
  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min(Math.round((current / safeTarget) * 100), 100);

  return (
    <View style={[styles.container, style]}>
      {showLabels && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={styles.valueText}>
            <Text style={{ color, fontWeight: '700' }}>
              {Math.round(current)}
            </Text>{' '}
            / {target} {unit}
          </Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  valueText: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  track: {
    width: '100%',
    backgroundColor: Palette.cardBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 8,
  },
});
