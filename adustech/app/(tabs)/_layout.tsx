import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#42A5F5' : '#1976D2',
        tabBarInactiveTintColor: isDark ? '#546E7A' : '#90A4AE',
        tabBarStyle: {
          backgroundColor: isDark ? '#0A1929' : '#FFFFFF',
          borderTopColor: isDark ? '#1E3A5F' : '#E0E0E0',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: isDark ? '#0A1929' : '#E6F4FE',
        },
        headerTintColor: isDark ? '#FFFFFF' : '#0A1929',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🔍</span>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🔔</span>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>👤</span>,
        }}
      />
    </Tabs>
  );
}
