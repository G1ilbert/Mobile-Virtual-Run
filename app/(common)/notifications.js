import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles, getTheme, Typography, Layout, Components, COLORS } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getMyNotifications, markAsRead, markAllAsRead } from '../../utils/services/notificationService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

function getNotificationIcon(type, message) {
  const msgLower = (message || '').toLowerCase();

  switch (type) {
    case 'payment':
      if (msgLower.includes('สำเร็จ') || msgLower.includes('confirmed') || msgLower.includes('คืนเงินสำเร็จ'))
        return { name: 'checkmark-circle', color: COLORS.SUCCESS };
      if (msgLower.includes('ไม่ผ่าน') || msgLower.includes('ปฏิเสธ') || msgLower.includes('rejected'))
        return { name: 'close-circle', color: COLORS.ERROR };
      return { name: 'card-outline', color: '#0288d1' };

    case 'running_result':
      if (msgLower.includes('ผ่าน') || msgLower.includes('approved') || msgLower.includes('✅'))
        return { name: 'trophy', color: COLORS.PRIMARY_YELLOW };
      if (msgLower.includes('ไม่ผ่าน') || msgLower.includes('rejected'))
        return { name: 'warning', color: COLORS.ERROR };
      return { name: 'fitness', color: COLORS.PRIMARY_YELLOW };

    case 'shipment':
      if (msgLower.includes('จัดส่ง') || msgLower.includes('tracking'))
        return { name: 'airplane', color: '#0288d1' };
      return { name: 'cube', color: '#0288d1' };

    case 'registration':
      if (msgLower.includes('ยกเลิก') || msgLower.includes('cancel'))
        return { name: 'close-circle-outline', color: COLORS.GRAY_400 };
      return { name: 'person-add', color: COLORS.SUCCESS };

    case 'event':
      return { name: 'calendar', color: COLORS.PRIMARY_YELLOW };

    case 'payout':
      return { name: 'wallet', color: COLORS.SUCCESS };

    default:
      return { name: 'notifications', color: COLORS.GRAY_400 };
  }
}

export default function NotificationScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getMyNotifications();
      const list = Array.isArray(data) ? data : data?.data || [];
      setNotifications(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handlePress = async (item) => {
    if (!item.isRead) {
      try { await markAsRead(item.id); } catch {}
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderItem = ({ item }) => {
    const icon = getNotificationIcon(item.type, item.message);
    const timeStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={[
          styles.notiItem,
          { borderBottomColor: theme.border },
          !item.isRead && { backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7' }
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.notiContent}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.notiMessage, { color: theme.text, fontWeight: item.isRead ? '400' : '700' }]}
              numberOfLines={2}
            >
              {item.message || item.title || 'Notification'}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notiTime}>{timeStr}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Notifications" onBack={() => router.back()} isDark={isDark} />

      {/* Mark all read button */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Ionicons name="checkmark-done" size={16} color={COLORS.PRIMARY_YELLOW} />
          <Text style={styles.markAllText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}

      {(!isReady || loading) ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={notifications}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={COLORS.PRIMARY_YELLOW} />}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
              <Ionicons name="notifications-off-outline" size={50} color={theme.border} />
              <Text style={{ color: COLORS.GRAY_400, marginTop: 12, fontSize: 15 }}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  markAllText: {
    color: COLORS.PRIMARY_YELLOW,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  notiItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notiContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notiMessage: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY_YELLOW,
    marginTop: 4,
  },
  notiTime: {
    color: COLORS.GRAY_500,
    fontSize: 12,
  },
});
