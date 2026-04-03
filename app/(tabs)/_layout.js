import React from 'react';
import { StyleSheet, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Octicons, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, getTheme } from '../../constants/GlobalStyles';

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
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          borderTopWidth: 0.5,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: (insets.bottom > 0 ? insets.bottom : 10) + 56,
          zIndex: 10,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'หน้าแรก',
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home-fill" size={(size || 22) - 3}  color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          tabBarLabel: 'งานวิ่ง',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="heart-pulse" size={(size || 22) - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          tabBarLabel: '',
          tabBarStyle: { display: 'none' },
          tabBarButton: (props) => (
            <View style={styles.centerButtonWrapper}>
              <TouchableOpacity
                style={[styles.submitContainer, { backgroundColor: theme.background }]}
                onPress={props.onPress}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={50} color={COLORS.PRIMARY_YELLOW} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rank"
        options={{
          tabBarLabel: 'รอรับของ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" size={(size || 22) + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="user-large" size={(size || 22) -4} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
