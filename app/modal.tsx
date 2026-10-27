import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { Palette } from '@/constants/Colors';
import { Dumbbell, ShieldCheck, Database, Zap } from 'lucide-react-native';

export default function ModalScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Dumbbell size={28} color={Palette.primary} />
        </View>
        <Text style={styles.title}>FitTrack Mobile</Text>
        <Badge label="v1.0.0 • Offline Ready" variant="primary" style={styles.badge} />
      </View>

      <Card elevated style={styles.card}>
        <View style={styles.infoRow}>
          <ShieldCheck size={20} color={Palette.secondary} />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoTitle}>100% Offline & Private</Text>
            <Text style={styles.infoSub}>
              All workout sessions, nutrition logs, and progress metrics are stored strictly in local SQLite.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Database size={20} color={Palette.primary} />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoTitle}>Full JSON Backups</Text>
            <Text style={styles.infoSub}>
              Export or import your complete training history at any time from your Profile settings.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Zap size={20} color="#FFB84C" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoTitle}>Ultra-Fast Performance</Text>
            <Text style={styles.infoSub}>
              Built with Expo Router and reactive SQLite queries for instant, zero-latency tracking.
            </Text>
          </View>
        </View>
      </Card>

      <Button
        title="Close"
        variant="outline"
        onPress={() => router.back()}
        style={styles.closeButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
  },
  badge: {
    marginTop: 8,
  },
  card: {
    padding: 18,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  infoSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 14,
  },
  closeButton: {
    width: '100%',
  },
});
