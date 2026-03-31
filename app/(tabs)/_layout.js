import React from 'react';
import { StyleSheet, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Octicons, FontAwesome5, MaterialIcons, FontAwesome6, FontAwesome } from '@expo/vector-icons';
import { COLORS, getTheme, Layout } from '../../constants/GlobalStyles';

export default function TabLayout() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.PRIMARY_YELLOW,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          borderTopWidth: 0.5,
          paddingTop: 4,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: (insets.bottom > 0 ? insets.bottom : 10) + 48,
          zIndex: 10,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <Octicons name="home-fill" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <FontAwesome5 name="running" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          tabBarButton: (props) => (
            <View style={styles.centerButtonWrapper}>
              <TouchableOpacity
                style={[styles.submitContainer, { backgroundColor: theme.background }]}
                onPress={props.onPress}
                activeOpacity={0.8}
              >
                <FontAwesome name="plus-circle" size={48} color={COLORS.PRIMARY_YELLOW} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rank"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <MaterialIcons name="leaderboard" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <FontAwesome6 name="user-large" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
