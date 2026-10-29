import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Button } from './Button';
import { formatTimer } from '@/src/utils/date';
import { Timer, X, Play, Pause, RotateCcw, Plus } from 'lucide-react-native';

interface RestTimerProps {
  visible: boolean;
  initialSeconds?: number;
  onClose: () => void;
  onComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  visible,
  initialSeconds = 90,
  onClose,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      setTotalSeconds(initialSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [visible, initialSeconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, onComplete]);

  const handleAddSeconds = (secs: number) => {
    setSecondsLeft((prev) => prev + secs);
    setTotalSeconds((prev) => prev + secs);
  };

  const handleSetPreset = (secs: number) => {
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setIsRunning(true);
  };

  if (!visible) return null;

  const progressPct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Timer size={20} color={Palette.primary} />
              <Text style={styles.headerTitle}>Rest Timer</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Timer Display */}
          <View style={styles.timerDisplay}>
            <Text
              style={[
                styles.timerText,
                secondsLeft === 0 && { color: Palette.primary },
              ]}
            >
              {formatTimer(secondsLeft)}
            </Text>
            <Text style={styles.timerSub}>
              {secondsLeft === 0 ? 'REST COMPLETE! READY FOR NEXT SET' : 'RECOVERY IN PROGRESS'}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>

          {/* Presets */}
          <View style={styles.presetsRow}>
            {[30, 60, 90, 120, 180].map((secs) => (
              <TouchableOpacity
                key={secs}
                onPress={() => handleSetPreset(secs)}
                style={[
                  styles.presetPill,
                  totalSeconds === secs && styles.presetPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    totalSeconds === secs && styles.presetTextActive,
                  ]}
                >
                  {secs < 60 ? `${secs}s` : `${secs / 60}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Add Buttons */}
          <View style={styles.quickAddRow}>
            <TouchableOpacity
              onPress={() => handleAddSeconds(15)}
              style={styles.quickAddBtn}
            >
              <Plus size={14} color={Palette.text} />
              <Text style={styles.quickAddText}>15s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAddSeconds(30)}
              style={styles.quickAddBtn}
            >
              <Plus size={14} color={Palette.text} />
              <Text style={styles.quickAddText}>30s</Text>
            </TouchableOpacity>
          </View>

          {/* Action Controls */}
          <View style={styles.controlsRow}>
            <Button
              title="Reset"
              variant="outline"
              icon={<RotateCcw size={16} color={Palette.text} />}
              onPress={() => {
                setSecondsLeft(totalSeconds);
                setIsRunning(false);
              }}
              style={styles.controlBtn}
            />
            <Button
              title={isRunning ? 'Pause' : 'Resume'}
              variant={isRunning ? 'secondary' : 'primary'}
              icon={
                isRunning ? (
                  <Pause size={16} color="#0B0F14" />
                ) : (
                  <Play size={16} color="#0B0F14" />
                )
              }
              onPress={() => setIsRunning(!isRunning)}
              style={styles.controlBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Palette.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Palette.cardElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  closeBtn: {
    padding: 4,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 54,
    fontWeight: '800',
    color: Palette.text,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: Palette.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Palette.primary,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  presetPillActive: {
    backgroundColor: Palette.primaryGlow,
    borderColor: Palette.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  presetTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.inputBg,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.inputBorder,
  },
  quickAddText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.text,
  },
  controlsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  controlBtn: {
    flex: 1,
  },
});
