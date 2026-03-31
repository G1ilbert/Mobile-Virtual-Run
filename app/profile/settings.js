import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';

export default function SettingsScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <TopNavigationBack title="Settings" onBack={() => router.back()} isDark={isDark} />

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/profile/edit')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
              <Ionicons name="person-outline" size={22} color={COLORS.PRIMARY_YELLOW} />
            </View>
            <Text style={[styles.menuText, { color: theme.text }]}>Personal Information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert(
              "Logout",
              "Are you sure you want to log out?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: () => router.back(), style: 'destructive' }
              ]
            )
          }
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.ERROR} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    ...Layout.rowBetween,
    padding: 15,
    ...Components.card,
    borderWidth: 1
  },
  menuLeft: {
    ...Layout.rowCenter
  },
  iconBox: {
    ...Components.iconContainerLarge,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  menuText: {
    ...Typography.bodyLarge
  },
  logoutBtn: {
    ...Layout.rowCenter,
    marginTop: 30,
    padding: 15
  },
  logoutText: {
    color: COLORS.ERROR,
    fontWeight: 'bold',
    marginLeft: 10,
    ...Typography.bodyLarge
  }
});
