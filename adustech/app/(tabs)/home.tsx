import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { profileAPI, UserProfile } from '../../services/profileApi';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await profileAPI.getProfile();
    if (result.success && result.data.user) {
      setProfile(result.data.user);
    }
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: isDark ? '#0A1929' : '#E6F4FE' }]}>
        <ActivityIndicator size="large" color={isDark ? '#42A5F5' : '#1976D2'} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0A1929' : '#E6F4FE' }]}>
      <View style={styles.content}>
        {/* Welcome Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
          <Text style={[styles.greeting, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
            {profile?.name || 'User'}! 👋
          </Text>
          {profile?.bio && (
            <Text style={[styles.bio, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
            <Text style={styles.statIcon}>🎓</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Level</Text>
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              {profile?.level || 'N/A'}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Department</Text>
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              {profile?.department || 'N/A'}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
            <Text style={styles.statIcon}>🏛️</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Faculty</Text>
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              {profile?.faculty || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
          Quick Actions
        </Text>
        
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
          <Text style={styles.actionIcon}>📝</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              Assignments
            </Text>
            <Text style={[styles.actionSubtitle, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
              View and submit your assignments
            </Text>
          </View>
          <Text style={[styles.actionArrow, { color: isDark ? '#42A5F5' : '#1976D2' }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
          <Text style={styles.actionIcon}>📅</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              Schedule
            </Text>
            <Text style={[styles.actionSubtitle, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
              Check your class timetable
            </Text>
          </View>
          <Text style={[styles.actionArrow, { color: isDark ? '#42A5F5' : '#1976D2' }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              Results
            </Text>
            <Text style={[styles.actionSubtitle, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
              View your academic results
            </Text>
          </View>
          <Text style={[styles.actionArrow, { color: isDark ? '#42A5F5' : '#1976D2' }]}>›</Text>
        </TouchableOpacity>

        {/* Announcements */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
          Recent Announcements
        </Text>
        
        <View style={[styles.announcementCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
          <Text style={[styles.announcementTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
            📢 Welcome to your Home
          </Text>
          <Text style={[styles.announcementText, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
            Complete your profile to get personalized recommendations and updates.
          </Text>
          <Text style={[styles.announcementDate, { color: isDark ? '#546E7A' : '#90A4AE' }]}>
            Today
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  actionArrow: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  announcementCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  announcementText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
  },
});
