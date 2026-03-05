import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { globalStyles, getTheme } from './GlobalStyles';
import TopNavigationBack from './TopNavigationBack';
import { MOCK_NOTIFICATIONS } from './MockData';

const NotificationScreen = ({ isDark, onBack }) => {
  const theme = getTheme(isDark);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notiItem, { borderBottomColor: theme.border }, !item.read && { backgroundColor: isDark ? '#1A1A1A' : '#F9F9F9' }]}>
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
      <TopNavigationBack title="Notifications" onBack={onBack} isDark={isDark} />
      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  notiItem: { padding: 20, borderBottomWidth: 0.5 },
  notiContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  notiTitle: { fontSize: 16, fontWeight: 'bold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },
  notiDesc: { color: '#888', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  notiTime: { color: '#BBB', fontSize: 12 }
});

export default NotificationScreen;