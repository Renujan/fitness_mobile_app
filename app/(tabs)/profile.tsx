import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, Share } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { UserRepo } from '@/src/db/repositories/userRepo';
import { BackupRepo } from '@/src/db/repositories/backupRepo';
import { resetDatabase } from '@/src/db/database';
import { UserProfile } from '@/src/types/database';
import { User, Settings, ShieldCheck, Download, Upload, RotateCcw, Award } from 'lucide-react-native';

export default function ProfileScreen() {
  const { isReady } = useDatabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadProfile = async () => {
    try {
      const u = await UserRepo.getProfile();
      setProfile(u);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadProfile();
    }
  }, [isReady]);

  const handleExportBackup = async () => {
    try {
      setExporting(true);
      const backup = await BackupRepo.exportBackupData();
      const jsonStr = JSON.stringify(backup, null, 2);

      await Share.share({
        message: jsonStr,
        title: 'FitTrack_Backup.json',
      });
    } catch (e: any) {
      Alert.alert('Export Error', e?.message || 'Could not export backup');
    } finally {
      setExporting(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All FitTrack Data',
      'Are you sure you want to delete all workouts, foods, and records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Database',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              await loadProfile();
              Alert.alert('Success', 'Application data has been reset to defaults.');
            } catch (err: any) {
              Alert.alert('Reset Failed', err?.message || 'Could not reset');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scrollable>
      <Header subtitle="SETTINGS & ACCOUNT" title="Profile" />

      {/* Profile Overview Card */}
      <Card elevated accent="primary" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <User size={32} color={Palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{profile?.name || 'Athlete'}</Text>
            <Text style={styles.userSub}>
              {profile?.height_cm} cm • {profile?.current_weight_kg} kg
            </Text>
          </View>
          <Badge label="OFFLINE" variant="primary" />
        </View>

        <View style={styles.macroTargetsGrid}>
          <View style={styles.macroTargetItem}>
            <Text style={styles.targetLabel}>Calories</Text>
            <Text style={styles.targetVal}>{profile?.calorie_target || 2400}</Text>
          </View>
          <View style={styles.macroTargetItem}>
            <Text style={styles.targetLabel}>Protein</Text>
            <Text style={styles.targetVal}>{profile?.protein_target || 150}g</Text>
          </View>
          <View style={styles.macroTargetItem}>
            <Text style={styles.targetLabel}>Carbs</Text>
            <Text style={styles.targetVal}>{profile?.carb_target || 260}g</Text>
          </View>
          <View style={styles.macroTargetItem}>
            <Text style={styles.targetLabel}>Fat</Text>
            <Text style={styles.targetVal}>{profile?.fat_target || 65}g</Text>
          </View>
        </View>
      </Card>

      {/* Backup & Data Management */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Data & Offline Backups</Text>
      </View>

      <Card style={styles.actionCard}>
        <View style={styles.rowItem}>
          <Download size={20} color={Palette.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.actionTitle}>Export Backup (JSON)</Text>
            <Text style={styles.actionSub}>Save all workouts, nutrition and photos offline</Text>
          </View>
          <Button
            title="Export"
            size="small"
            variant="outline"
            loading={exporting}
            onPress={handleExportBackup}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.rowItem}>
          <RotateCcw size={20} color={Palette.danger} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.actionTitle, { color: Palette.danger }]}>Reset Application Data</Text>
            <Text style={styles.actionSub}>Erase all custom records and reset to starter library</Text>
          </View>
          <Button
            title="Reset"
            size="small"
            variant="danger"
            onPress={handleResetData}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: 18,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.text,
  },
  userSub: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  macroTargetsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  macroTargetItem: {
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 11,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  targetVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.text,
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  actionCard: {
    padding: 16,
    marginBottom: 20,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  actionSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 14,
  },
});
