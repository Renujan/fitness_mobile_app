import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, Share, Modal, TextInput, ScrollView } from 'react-native';
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

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    height_cm: '',
    target_weight_kg: '',
    calorie_target: '',
    protein_target: '',
    carb_target: '',
    fat_target: '',
  });

  const openEditModal = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        height_cm: String(profile.height_cm),
        target_weight_kg: String(profile.target_weight_kg),
        calorie_target: String(profile.calorie_target),
        protein_target: String(profile.protein_target),
        carb_target: String(profile.carb_target),
        fat_target: String(profile.fat_target),
      });
      setIsEditModalVisible(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await UserRepo.updateProfile({
        name: editForm.name.trim() || 'Athlete',
        height_cm: parseFloat(editForm.height_cm) || 175,
        target_weight_kg: parseFloat(editForm.target_weight_kg) || 75,
        calorie_target: parseInt(editForm.calorie_target, 10) || 2400,
        protein_target: parseInt(editForm.protein_target, 10) || 150,
        carb_target: parseInt(editForm.carb_target, 10) || 260,
        fat_target: parseInt(editForm.fat_target, 10) || 65,
      });
      await loadProfile();
      setIsEditModalVisible(false);
      Alert.alert('Updated', 'Profile and nutrition targets successfully updated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update profile');
    }
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

        <Button
          title="Edit Profile & Targets"
          size="small"
          variant="outline"
          onPress={openEditModal}
          style={{ marginTop: 14 }}
        />
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

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile & Targets</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Athlete Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Your Name"
                placeholderTextColor={Palette.textMuted}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.height_cm}
                    onChangeText={(text) => setEditForm({ ...editForm, height_cm: text })}
                    keyboardType="numeric"
                    placeholder="175"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.inputLabel}>Goal Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.target_weight_kg}
                    onChangeText={(text) => setEditForm({ ...editForm, target_weight_kg: text })}
                    keyboardType="numeric"
                    placeholder="75"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Daily Calories (kcal)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.calorie_target}
                    onChangeText={(text) => setEditForm({ ...editForm, calorie_target: text })}
                    keyboardType="numeric"
                    placeholder="2400"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.protein_target}
                    onChangeText={(text) => setEditForm({ ...editForm, protein_target: text })}
                    keyboardType="numeric"
                    placeholder="150"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.carb_target}
                    onChangeText={(text) => setEditForm({ ...editForm, carb_target: text })}
                    keyboardType="numeric"
                    placeholder="260"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.inputLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.fat_target}
                    onChangeText={(text) => setEditForm({ ...editForm, fat_target: text })}
                    keyboardType="numeric"
                    placeholder="65"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsEditModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveProfile}
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: Palette.cardElevated,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Palette.text,
    fontSize: 15,
  },
  formRow: {
    flexDirection: 'row',
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 10,
  },
});
