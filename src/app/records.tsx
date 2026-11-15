
import { useCallback, useState } from 'react';

import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    deleteHealthRecord,
    getAllHealthRecords,
    searchHealthRecordsByDate,
} from '../database/healthDatabase';

import type { HealthRecord } from '../models/HealthRecord';

export default function RecordsScreen() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [searchDate, setSearchDate] = useState('');
  const [loading, setLoading] = useState(false);

    const loadRecords = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAllHealthRecords();
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert('Error', 'Unable to load health records.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      void loadRecords();
    }, [loadRecords])
  );

  // Search records by date
  const handleSearch = async () => {
    const date = searchDate.trim();

    if (!date) {
      await loadRecords();
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert(
        'Invalid Date',
        'Please enter the date in YYYY-MM-DD format.'
      );
      return;
    }

    setLoading(true);

    try {
      const results = await searchHealthRecordsByDate(date);
      setRecords(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Unable to search records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const deleted = await deleteHealthRecord(id);

      if (deleted) {
        Alert.alert('Success', 'Health record deleted successfully.');
      } else {
        Alert.alert('Notice', 'The record could not be found.');
      }

      await loadRecords();
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Unable to delete this record.');
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      'Delete Health Record',
      'Are you sure you want to delete this record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void handleDelete(id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRecords}
          />
        }
        contentContainerStyle={styles.content}
      >
        
        <Text style={styles.title}>Health Records</Text>

        <Text style={styles.subtitle}>
          View and manage your daily health activities.
        </Text>

 
        <Text style={styles.sectionTitle}>Search by Date</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={searchDate}
            onChangeText={setSearchDate}
            keyboardType="numbers-and-punctuation"
          />

          <Pressable
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.clearButton}
          onPress={() => {
            setSearchDate('');
            void loadRecords();
          }}
        >
          <Text style={styles.clearButtonText}>
            Clear Search
          </Text>
        </Pressable>

   
        <View style={styles.recordsHeading}>
          <Text style={styles.sectionTitle}>
            Your Health History
          </Text>

          <Text style={styles.recordCount}>
            {records.length} records
          </Text>
        </View>


        {loading && records.length === 0 && (
          <Text style={styles.message}>
            Loading health records...
          </Text>
        )}

        {!loading && records.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>

            <Text style={styles.emptyTitle}>
              No Records Found
            </Text>

            <Text style={styles.emptyText}>
              Your saved health records will appear here.
            </Text>
          </View>
        )}

        {records.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View>
                <Text style={styles.recordLabel}>
                  HEALTH RECORD
                </Text>

                <Text style={styles.recordDate}>
                  {record.date}
                </Text>
              </View>

              <Text style={styles.recordId}>
                #{record.id}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricIcon}>👟</Text>
                <Text style={styles.metricValue}>
                  {record.steps.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Steps</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricIcon}>🔥</Text>
                <Text style={styles.metricValue}>
                  {record.calories.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Calories</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricIcon}>💧</Text>
                <Text style={styles.metricValue}>
                  {record.water.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Water (ml)</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
            <Pressable
                style={styles.editButton}
                onPress={() =>
                router.push({
                    pathname: '/edit-record',
                    params: { id: String(record.id) },
                })
                }
            >
                <Text style={styles.editButtonText}>
                Edit Record
                </Text>
            </Pressable>

            <Pressable
                style={styles.deleteButton}
                onPress={() => confirmDelete(record.id)}
            >
                <Text style={styles.deleteButtonText}>
                Delete Record
                </Text>
            </Pressable>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#172554',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172554',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    color: '#172554',
    fontSize: 14,
  },

  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 17,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  clearButton: {
    alignSelf: 'flex-end',
    paddingVertical: 12,
  },

  clearButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },

  recordsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 16,
  },

  recordCount: {
    fontSize: 12,
    color: '#64748B',
  },

  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },

  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recordLabel: {
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 1,
    fontWeight: '600',
  },

  recordDate: {
    fontSize: 17,
    color: '#172554',
    fontWeight: 'bold',
    marginTop: 5,
  },

  recordId: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EDF5',
    marginVertical: 16,
  },

  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  metricBox: {
    flex: 1,
    alignItems: 'center',
  },

  metricIcon: {
    fontSize: 23,
    marginBottom: 8,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172554',
  },

  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  deleteButton: {
    backgroundColor: '#FFF1F2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '600',
  },

  actionRow: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 17,
},

editButton: {
  flex: 1,
  backgroundColor: '#EFF6FF',
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
},

editButtonText: {
  color: '#2563EB',
  fontSize: 13,
  fontWeight: '600',
},

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172554',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  message: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 25,
  },
});

