import { getAllHealthRecords } from '@/database/healthDatabase';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MetricCardProps {
  title: string;
  value: string;
  detail: string;
  progress: number;
  icon: string;
  color: string;
  wide?: boolean;
}

function MetricCard({
  title,
  value,
  detail,
  progress,
  icon,
  color,
  wide = false,
}: MetricCardProps) {
  return (
    <View style={[styles.metricCard, wide && styles.wideCard]}>
      <View style={styles.cardHeading}>
        <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
          <Text style={styles.metricIcon}>{icon}</Text>
        </View>

        {wide && <Text style={styles.wideTitle}>{title}</Text>}
      </View>

      {!wide && <Text style={styles.metricTitle}>{title}</Text>}

      <Text style={styles.metricValue}>{value}</Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayWater, setTodayWater] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadTodayRecords = async () => {
        try {
          const allRecords = await getAllHealthRecords();

          const now = new Date();
          const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
          ].join('-');

          const todaysRecords = allRecords.filter(
            (record) => record.date === today
          );

          const totals = todaysRecords.reduce(
            (sum, record) => ({
              steps: sum.steps + record.steps,
              calories: sum.calories + record.calories,
              water: sum.water + record.water,
            }),
            { steps: 0, calories: 0, water: 0 }
          );

          if (isActive) {
            setTodaySteps(totals.steps);
            setTodayCalories(totals.calories);
            setTodayWater(totals.water);
          }
        } catch (error) {
          console.error('Dashboard data loading error:', error);
        }
      };

      void loadTodayRecords();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const date = new Date();

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hour = date.getHours();

  const greeting =
    hour < 12
      ? 'Good morning!'
      : hour < 17
        ? 'Good afternoon!'
        : 'Good evening!';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"/>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>♥</Text>
            </View>

            <View>
              <Text style={styles.appName}>HealthMate</Text>
              <Text style={styles.tagline}>YOUR DAILY WELLNESS</Text>
            </View>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>A</Text>
          </View>
        </View>

        {}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{greeting}</Text>

          <Text style={styles.subtitle}>
            Take a look at your daily health progress.
          </Text>

          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <Text style={styles.sectionSubtitle}>
            Your daily health overview
          </Text>
        </View>

        {}
        <View style={styles.cardRow}>
          <View style={styles.cardColumn}>
            <MetricCard
              title="Steps"
              value={todaySteps.toLocaleString()}
              detail="of 8,000 steps"
              progress={Math.min(todaySteps / 8000, 1)}
              icon="👟"
              color="#2563EB"
            />
          </View>

          <View style={styles.cardColumn}>
            <MetricCard
              title="Water Intake"
              value={todayWater.toLocaleString()}
              detail="of 2,000 ml"
              progress={Math.min(todayWater / 2000, 1)}
              icon="💧"
              color="#0891B2"
            />
          </View>
        </View>

        {}
        <MetricCard
          title="Calories Burned"
          value={`${todayCalories.toLocaleString()} kcal`}
          detail="of 500 kcal daily goal"
          progress={Math.min(todayCalories / 500, 1)}
          icon="🔥"
          color="#EA580C"
          wide
        />

        {}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationIcon}>💡</Text>

          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>
              Daily Motivation
            </Text>

            <Text style={styles.motivationText}>
              Small healthy habits lead to big changes. Keep moving!
            </Text>
          </View>
        </View>
        <Link href="/add-record" asChild>
          <Pressable style={styles.addRecordButton}>
            <Text style={styles.addRecordButtonText}>
              + Add Health Record
            </Text>
          </Pressable>
        </Link>
        <Link href="/records" asChild>
          <Pressable style={styles.viewRecordsButton}>
            <Text style={styles.viewRecordsButtonText}>
              View Health Records
            </Text>
          </Pressable>
        </Link>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 25,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
  },

  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#172554',
  },

  tagline: {
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 1.2,
    marginTop: 3,
  },

  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: 'bold',
  },

  welcomeSection: {
    marginBottom: 28,
  },

  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#172554',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },

  date: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 9,
  },

  sectionHeading: {
    marginBottom: 17,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#172554',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },

  cardRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  cardColumn: {
    flex: 1,
  },

  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    marginBottom: 14,
  },

  wideCard: {
    flex: 0,
    width: '100%',
  },

  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  metricIcon: {
    fontSize: 20,
  },

  wideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 12,
  },

  metricTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 14,
  },

  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#172554',
    marginTop: 9,
    marginBottom: 14,
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#F0F2F6',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  metricDetail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 9,
  },

  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EEFF',
    borderRadius: 20,
    padding: 19,
    marginTop: 9,
    marginBottom: 15,
  },

  motivationIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  motivationContent: {
    flex: 1,
  },

  motivationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#172554',
    marginBottom: 5,
  },

  motivationText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },

  addRecordButton: {
  backgroundColor: '#2563EB',
  padding: 17,
  borderRadius: 15,
  alignItems: 'center',
  marginTop: 15,
  marginBottom: 20,
  },

  addRecordButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},

  viewRecordsButton: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#2563EB',
  padding: 17,
  borderRadius: 15,
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 20,
},

viewRecordsButtonText: {
  color: '#2563EB',
  fontSize: 16,
  fontWeight: 'bold',
},
});
