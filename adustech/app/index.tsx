import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is logged in, redirect to dashboard
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0A1929' : '#E6F4FE' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A1929' : '#E6F4FE' }]}>
      {/* Logo */}
      <View style={[styles.logoCircle, isDark ? styles.logoDark : styles.logoLight]}>
        <Text style={styles.logoText}>AT</Text>
      </View>

      {/* Brand Name */}
      <Text style={[styles.brandName, { color: isDark ? '#FFFFFF' : '#0A1929' }]}>
        ADUSTECH
      </Text>
      <Text style={[styles.tagline, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
        Innovation Simplified
      </Text>

      {/* Welcome Message */}
      <Text style={[styles.welcomeText, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
        Welcome! Get started by creating an account or logging in.
      </Text>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isDark ? '#42A5F5' : '#1976D2' }]}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonOutline, { borderColor: isDark ? '#42A5F5' : '#1976D2' }]}
        onPress={() => router.push('/register')}
      >
        <Text style={[styles.buttonOutlineText, { color: isDark ? '#42A5F5' : '#1976D2' }]}>
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 18,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonOutline: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonOutlineText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

