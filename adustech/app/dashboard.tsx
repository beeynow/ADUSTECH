import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A1929' : '#E6F4FE' }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={[styles.logoCircle, isDark ? styles.logoDark : styles.logoLight]}>
          <Text style={styles.logoText}>AT</Text>
        </View>

        {/* Welcome Message */}
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
          Welcome to Dashboard
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.email, { color: isDark ? '#42A5F5' : '#1976D2' }]}>
          {user?.email}
        </Text>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
            🎉 You&apos;re logged in!
          </Text>
          <Text style={[styles.cardText, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
            Your account has been successfully authenticated and verified.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={[styles.featureCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              Analytics
            </Text>
            <Text style={[styles.featureText, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
              View your stats
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF' }]}>
            <Text style={styles.featureIcon}>⚙️</Text>
            <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
              Settings
            </Text>
            <Text style={[styles.featureText, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
              Manage account
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: isDark ? '#DC2626' : '#EF4444' }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoLight: {
    backgroundColor: '#1976D2',
  },
  logoDark: {
    backgroundColor: '#42A5F5',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
