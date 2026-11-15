
import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    getHealthRecordById,
    updateHealthRecord,
} from '../database/healthDatabase';

import type { NewHealthRecord } from '../models/HealthRecord';

function formatDatabaseDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function EditRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      const recordId = Number(id);

      if (!Number.isInteger(recordId) || recordId <= 0) {
        Alert.alert('Error', 'Invalid health record.');
        router.back();
        return;
      }

      try {
        const record = await getHealthRecordById(recordId);

        if (!record) {
          Alert.alert('Not Found', 'Health record could not be found.');
          router.back();
          return;
        }

        const [year, month, day] = record.date.split('-').map(Number);

        setSelectedDate(new Date(year, month - 1, day));
        setSteps(String(record.steps));
        setCalories(String(record.calories));
        setWater(String(record.water));
      } catch (error) {
        console.error('Load record error:', error);
        Alert.alert('Error', 'Unable to load this health record.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    void loadRecord();
  }, [id]);

  const formattedDate = selectedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleUpdate = async () => {
    if (
      !/^\d+$/.test(steps.trim()) ||
      !/^\d+$/.test(calories.trim()) ||
      !/^\d+$/.test(water.trim())
    ) {
      Alert.alert(
        'Invalid Information',
        'Please enter valid non-negative whole numbers in all three fields.'
      );
      return;
    }

    const record: NewHealthRecord = {
      date: formatDatabaseDate(selectedDate),
      steps: Number(steps),
      calories: Number(calories),
      water: Number(water),
    };

    setSaving(true);

    try {
      const updated = await updateHealthRecord(Number(id), record);

      if (updated) {
        Alert.alert(
          'Success',
          'Health record updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Not Found', 'The record could not be updated.');
      }
    } catch (error) {
      console.error('Update record error:', error);
      Alert.alert('Error', 'Unable to update this health record.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading health record...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Edit Health Record</Text>

        <Text style={styles.subtitle}>
          Update your daily health activities.
        </Text>

        <Text style={styles.label}>Select Date</Text>

        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.icon}>📅</Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, chosenDate) => {
              setShowDatePicker(false);

              if (event.type === 'set' && chosenDate) {
                setSelectedDate(chosenDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>Steps Walked</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>👟</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of steps"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={steps}
            onChangeText={setSteps}
          />
        </View>

        <Text style={styles.label}>Calories Burned</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🔥</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter calories burned"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={calories}
            onChangeText={setCalories}
          />
          <Text style={styles.unit}>kcal</Text>
        </View>

        <Text style={styles.label}>Water Intake</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>💧</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter water intake"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={water}
            onChangeText={setWater}
          />
          <Text style={styles.unit}>ml</Text>
        </View>

        <Pressable
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Updating...' : 'Update Health Record'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#172554',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginTop: 20,
    marginBottom: 10,
  },

  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateText: {
    fontSize: 15,
    color: '#172554',
    fontWeight: '500',
  },

  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 58,
  },

  icon: {
    fontSize: 21,
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#172554',
    height: '100%',
  },

  unit: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  saveButton: {
    backgroundColor: '#2563EB',
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },

  cancelButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },

  loadingText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 12,
  },
});
