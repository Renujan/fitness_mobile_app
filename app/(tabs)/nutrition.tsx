import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Modal, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { NutritionRepo, DailyMacroSummary } from '@/src/db/repositories/nutritionRepo';
import { UserRepo } from '@/src/db/repositories/userRepo';
import { UserProfile, MealType, FoodItem } from '@/src/types/database';
import { Utensils, Plus, Apple, Trash2, Search } from 'lucide-react-native';

export default function NutritionScreen() {
  const { isReady } = useDatabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<DailyMacroSummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    logs: [],
  });
  const [loading, setLoading] = useState(true);

  // Food Logger Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [mode, setMode] = useState<'search' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodForm, setFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingCount: '1',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const loadNutrition = async () => {
    try {
      setLoading(true);
      const [u, s] = await Promise.all([
        UserRepo.getProfile(),
        NutritionRepo.getDailyLogs(todayStr),
      ]);
      setProfile(u);
      setSummary(s);
    } catch (e) {
      console.error('Error loading nutrition:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadNutrition();
    }
  }, [isReady]);

  const openFoodModal = async (mealType: MealType = 'breakfast') => {
    setSelectedMealType(mealType);
    setSearchQuery('');
    setFoodForm({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      servingCount: '1',
    });
    setMode('search');
    try {
      const items = await NutritionRepo.getFoodItems();
      setFoodItems(items);
    } catch (e) {
      console.error('Error loading foods:', e);
    }
    setIsLogModalOpen(true);
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    try {
      const items = await NutritionRepo.getFoodItems(text);
      setFoodItems(items);
    } catch (e) {
      console.error('Error searching foods:', e);
    }
  };

  const handleSelectFood = (item: FoodItem) => {
    setFoodForm({
      name: item.name,
      calories: String(item.calories),
      protein: String(item.protein),
      carbs: String(item.carbs),
      fat: String(item.fat),
      servingCount: '1',
    });
    setMode('custom');
  };

  const handleSaveFoodLog = async () => {
    if (!foodForm.name.trim()) {
      Alert.alert('Required', 'Please enter a food name');
      return;
    }
    try {
      const servings = parseFloat(foodForm.servingCount) || 1;
      await NutritionRepo.logFood({
        date: todayStr,
        meal_type: selectedMealType,
        food_name: foodForm.name.trim(),
        serving_count: servings,
        calories: parseFloat(foodForm.calories) || 0,
        protein: parseFloat(foodForm.protein) || 0,
        carbs: parseFloat(foodForm.carbs) || 0,
        fat: parseFloat(foodForm.fat) || 0,
      });
      await loadNutrition();
      setIsLogModalOpen(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not log food');
    }
  };

  const handleDeleteFood = (logId: number, foodName: string) => {
    Alert.alert(
      'Delete Entry',
      `Remove ${foodName} from your log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NutritionRepo.deleteLog(logId);
              await loadNutrition();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete entry');
            }
          },
        },
      ]
    );
  };

  const meals: { type: MealType; title: string }[] = [
    { type: 'breakfast', title: 'Breakfast' },
    { type: 'lunch', title: 'Lunch' },
    { type: 'dinner', title: 'Dinner' },
    { type: 'snack', title: 'Snacks' },
  ];

  return (
    <ScreenContainer scrollable>
      <Header
        subtitle="DAILY FUEL"
        title="Nutrition Tracker"
        rightAction={
          <Button
            title="+ Log Food"
            size="small"
            icon={<Plus size={16} color="#0B0F14" />}
            onPress={() => openFoodModal('breakfast')}
          />
        }
      />

      {/* Macro Overview Card */}
      <Card elevated accent="secondary" style={styles.macroCard}>
        <Text style={styles.macroHeading}>Daily Progress</Text>
        <ProgressBar
          label="Calories"
          current={summary.calories}
          target={profile?.calorie_target || 2400}
          unit="kcal"
          color={Palette.secondary}
        />
        <View style={{ height: 10 }} />
        <ProgressBar
          label="Protein"
          current={summary.protein}
          target={profile?.protein_target || 150}
          unit="g"
          color={Palette.primary}
        />
        <View style={{ height: 10 }} />
        <ProgressBar
          label="Carbohydrates"
          current={summary.carbs}
          target={profile?.carb_target || 260}
          unit="g"
          color="#FFB84C"
        />
        <View style={{ height: 10 }} />
        <ProgressBar
          label="Fats"
          current={summary.fat}
          target={profile?.fat_target || 65}
          unit="g"
          color="#FF758F"
        />
      </Card>

      {/* Meals Grouping */}
      {meals.map((meal) => {
        const mealLogs = summary.logs.filter((l) => l.meal_type === meal.type);
        const mealCals = Math.round(mealLogs.reduce((acc, l) => acc + l.calories, 0));
        const mealProt = Math.round(mealLogs.reduce((acc, l) => acc + l.protein, 0));

        return (
          <Card key={meal.type} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealTitle}>{meal.title}</Text>
                <Text style={styles.mealTotals}>
                  {mealCals} kcal • {mealProt}g protein
                </Text>
              </View>
              <Button
                title="+ Add"
                size="small"
                variant="ghost"
                textStyle={{ color: Palette.primary }}
                onPress={() => openFoodModal(meal.type)}
              />
            </View>

            {mealLogs.length === 0 ? (
              <Text style={styles.emptyMealText}>No food logged for {meal.title.toLowerCase()}</Text>
            ) : (
              mealLogs.map((log) => (
                <View key={log.id} style={styles.foodRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{log.food_name}</Text>
                    <Text style={styles.foodSub}>
                      {log.serving_count} serving • {Math.round(log.protein)}g P • {Math.round(log.carbs)}g C • {Math.round(log.fat)}g F
                    </Text>
                  </View>
                  <View style={styles.foodRowRight}>
                    <Text style={styles.foodCalories}>{Math.round(log.calories)} kcal</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteFood(log.id, log.food_name)}
                      style={styles.deleteFoodBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color={Palette.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </Card>
        );
      })}

      {/* Quick Food Logger Modal */}
      <Modal
        visible={isLogModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsLogModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Log Food • {selectedMealType.toUpperCase()}
            </Text>

            {/* Mode switch */}
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'search' && styles.activeModeTab]}
                onPress={() => setMode('search')}
              >
                <Text style={[styles.modeTabText, mode === 'search' && styles.activeModeTabText]}>
                  Search Library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'custom' && styles.activeModeTab]}
                onPress={() => setMode('custom')}
              >
                <Text style={[styles.modeTabText, mode === 'custom' && styles.activeModeTabText]}>
                  Custom Entry
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'search' ? (
              <View>
                <View style={styles.searchBox}>
                  <Search size={18} color={Palette.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search chicken, oats, eggs..."
                    placeholderTextColor={Palette.textMuted}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                </View>

                <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                  {foodItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.foodSearchItem}
                      onPress={() => handleSelectFood(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodItemName}>{item.name}</Text>
                        <Text style={styles.foodItemMacros}>
                          {item.serving_size}{item.serving_unit} • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                        </Text>
                      </View>
                      <Text style={styles.foodItemCals}>{item.calories} kcal</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Food Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={foodForm.name}
                  onChangeText={(t) => setFoodForm({ ...foodForm, name: t })}
                  placeholder="e.g. Greek Yogurt Bowl"
                  placeholderTextColor={Palette.textMuted}
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Servings</Text>
                    <TextInput
                      style={styles.textInput}
                      value={foodForm.servingCount}
                      onChangeText={(t) => setFoodForm({ ...foodForm, servingCount: t })}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor={Palette.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.inputLabel}>Calories (kcal)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={foodForm.calories}
                      onChangeText={(t) => setFoodForm({ ...foodForm, calories: t })}
                      keyboardType="numeric"
                      placeholder="250"
                      placeholderTextColor={Palette.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Protein (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={foodForm.protein}
                      onChangeText={(t) => setFoodForm({ ...foodForm, protein: t })}
                      keyboardType="numeric"
                      placeholder="20"
                      placeholderTextColor={Palette.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={foodForm.carbs}
                      onChangeText={(t) => setFoodForm({ ...foodForm, carbs: t })}
                      keyboardType="numeric"
                      placeholder="30"
                      placeholderTextColor={Palette.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>Fat (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={foodForm.fat}
                      onChangeText={(t) => setFoodForm({ ...foodForm, fat: t })}
                      keyboardType="numeric"
                      placeholder="5"
                      placeholderTextColor={Palette.textMuted}
                    />
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsLogModalOpen(false)}
                style={{ flex: 1 }}
              />
              {mode === 'custom' && (
                <Button
                  title="Add to Log"
                  variant="primary"
                  onPress={handleSaveFoodLog}
                  style={{ flex: 1, marginLeft: 10 }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  macroCard: {
    padding: 18,
    marginBottom: 16,
  },
  macroHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 12,
  },
  mealCard: {
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  mealTotals: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  emptyMealText: {
    fontSize: 13,
    color: Palette.textMuted,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopColor: Palette.border,
    borderTopWidth: 1,
    marginTop: 6,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  foodSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.secondary,
  },
  foodRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteFoodBtn: {
    padding: 4,
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
    marginBottom: 14,
    textAlign: 'center',
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: Palette.cardElevated,
    borderRadius: 8,
    padding: 4,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeModeTab: {
    backgroundColor: Palette.primary,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  activeModeTabText: {
    color: '#0B0F14',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardElevated,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    color: Palette.text,
    fontSize: 14,
  },
  foodSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
  },
  foodItemMacros: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  foodItemCals: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.primary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
    marginTop: 8,
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
