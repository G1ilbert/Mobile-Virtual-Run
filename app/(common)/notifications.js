import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles, getTheme, Typography, Layout, Components, COLORS } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';
import { MOCK_NOTIFICATIONS } from '../../constants/MockData';

export default function NotificationScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notiItem,
        { borderBottomColor: theme.border },
        !item.read && { backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7' }
      ]}
    >
      <View style={styles.notiContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.notiTitle, { color: theme.text }]}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notiDesc} numberOfLines={2}>{item.desc}</Text>
        <Text style={styles.notiTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Notifications" onBack={() => router.back()} isDark={isDark} />

      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
            <Text style={{ color: COLORS.GRAY_400 }}>No notifications yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notiItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5
  },
  notiContent: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  notiTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ERROR
  },
  notiDesc: {
    color: COLORS.GRAY_400,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8
  },
  notiTime: {
    color: COLORS.GRAY_500,
    fontSize: 12
  }
});
