import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getMyRegistrations } from '../../utils/services/registrationService';
import { getMyRunningResults } from '../../utils/services/runningProofService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/200x120/333/666?text=Event';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

export default function FinishedEventsScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isReady } = useAuthGuard();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [regs, results] = await Promise.all([
          getMyRegistrations().catch(() => []),
          getMyRunningResults().catch(() => []),
        ]);
        const regList = Array.isArray(regs) ? regs : regs?.data || [];
        const resultList = Array.isArray(results) ? results : results?.data || [];

        const confirmed = regList.filter(r => r.paymentStatus === 'confirmed' && r.status === 'active');
        const completed = confirmed.filter(r => {
          const ev = r.packages?.events;
          const hasApproved = resultList.some(res => res.registrationId === r.id && res.status === 'approved');
          return hasApproved || ev?.status === 'closed';
        }).map(r => {
          const ev = r.packages?.events;
          return {
            id: ev?.id,
            title: ev?.title || 'Event',
            coverImage: ev?.coverImage,
            distance: `${Number(r.targetDistanceSnapshot || 0)}K`,
            endDate: ev?.endDate ? new Date(ev.endDate).toLocaleDateString('th-TH') : '',
          };
        }).filter((v, i, a) => v.id && a.findIndex(t => t.id === v.id) === i);

        setEvents(completed);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.gridCard, { backgroundColor: theme.card }]} onPress={() => router.push(`/event/${item.id}`)}>
      <View>
        <Image source={{ uri: getImageUrl(item.coverImage) }} style={styles.cardImage} />
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-done-circle" size={20} color={COLORS.PRIMARY_YELLOW} />
        </View>
      </View>
      <View style={styles.cardDetail}>
        <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={Layout.row}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.GRAY_400} />
          <Text style={styles.eventDate}>{item.endDate}</Text>
        </View>
        <Text style={styles.distanceText}>{item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!isReady || loading) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <TopNavigationBack title="Completed Events" onBack={() => router.back()} isDark={isDark} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Completed Events" onBack={() => router.back()} isDark={isDark} />
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="ribbon-outline" size={60} color={theme.border} />
            <Text style={{ color: COLORS.GRAY_400, marginTop: 10 }}>No achievements yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { padding: 15 },
  gridCard: {
    width: COLUMN_WIDTH,
    marginBottom: 15,
    marginHorizontal: 7.5,
    borderRadius: 15,
    overflow: 'hidden',
    ...Components.cardSmall,
  },
  cardImage: { width: '100%', height: 110, backgroundColor: COLORS.GRAY_600 },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  cardDetail: { padding: 10 },
  eventTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  eventDate: { fontSize: 11, color: COLORS.GRAY_400, marginLeft: 4 },
  distanceText: { fontSize: 12, color: COLORS.PRIMARY_YELLOW, fontWeight: 'bold', marginTop: 6 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }
});
