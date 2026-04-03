import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import TopNavigation from '../../components/TopNavigation';
import { getPublicEvents } from '../../utils/services/eventService';
import { EventCardSkeleton } from '../../components/Skeleton';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';

function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/400x200/333/666?text=Event';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

function getStatusConfig(event) {
  const now = new Date();
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;

  if (event.status !== 'approved') {
    return { bg: COLORS.GRAY_400, text: 'CLOSED', subText: '', daysLeft: 0 };
  }
  if (start && now < start) {
    const days = Math.ceil((start - now) / 86400000);
    return { bg: '#60a5fa', text: 'COMING SOON', subText: 'STARTS IN', daysLeft: days };
  }
  if (end && now <= end) {
    const days = Math.ceil((end - now) / 86400000);
    return { bg: COLORS.PRIMARY_YELLOW, text: 'REGISTER NOW', subText: 'ENDS IN', daysLeft: days };
  }
  if (event.submitDate && now <= new Date(event.submitDate)) {
    const days = Math.ceil((new Date(event.submitDate) - now) / 86400000);
    return { bg: '#fb923c', text: 'SUBMIT OPEN', subText: 'SUBMIT BY', daysLeft: days };
  }
  return { bg: COLORS.GRAY_400, text: 'FINISHED', subText: '', daysLeft: 0 };
}

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = useCallback(async (pageNum = 1, reset = false) => {
    try {
      const result = await getPublicEvents(pageNum, 10);
      const newEvents = result.data || [];
      if (reset) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }
      setHasMore(result.meta?.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(1, true); }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents(1, true);
  };

  const onEndReached = () => {
    if (!loading && hasMore) {
      fetchEvents(page + 1, false);
    }
  };

  const renderEventItem = ({ item }) => {
    const config = getStatusConfig(item);
    const showDays = config.daysLeft > 0;
    const imgUrl = getImageUrl(item.coverImage);
    const lowestPrice = item.packages?.length > 0
      ? Math.min(...item.packages.map(p => Number(p.price)))
      : null;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/event/${item.id}`)}
      >
        <View style={styles.cardImage}>
          <Image source={{ uri: imgUrl }} style={styles.cardBgImage} contentFit="cover" transition={300} cachePolicy="memory-disk" />
          <View style={styles.overlay}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                <Text style={styles.statusText}>{config.text}</Text>
              </View>
              {showDays && (
                <View style={styles.daysBadge}>
                  <Text style={styles.daysSubText}>{config.subText}</Text>
                  <Text style={styles.daysText}>{config.daysLeft} Days</Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {lowestPrice !== null && (
                  <Text style={{ color: COLORS.PRIMARY_YELLOW, fontSize: 13, fontWeight: '700' }}>
                    ฿{lowestPrice.toLocaleString()}
                  </Text>
                )}
                {item._count?.registrations > 0 && (
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                    {item._count.registrations} คนสมัคร
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && events.length === 0) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <TopNavigation activeTab="Home" isDark={isDark} />
        <ScrollView contentContainerStyle={[Layout.padding, { paddingTop: 15 }]} showsVerticalScrollIndicator={false}>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigation activeTab="Home" isDark={isDark} />
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[Layout.padding, { paddingTop: 15, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY_YELLOW} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={hasMore ? <ActivityIndicator color={COLORS.PRIMARY_YELLOW} style={{ padding: 20 }} /> : null}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 16 }}>ไม่พบงานวิ่ง</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', height: 180, marginBottom: 20, ...Components.card, elevation: 4, shadowOpacity: 0.2 },
  cardImage: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  cardBgImage: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 18, justifyContent: 'space-between' },
  cardHeader: { ...Layout.rowBetween, alignItems: 'flex-start' },
  statusBadge: { ...Components.badge },
  statusText: { color: COLORS.DARK_BG, ...Typography.badge },
  daysBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  daysSubText: { color: COLORS.GRAY_200, fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 1 },
  daysText: { color: COLORS.PRIMARY_YELLOW, ...Typography.caption, fontWeight: '900' },
  eventTitle: { color: COLORS.TEXT_DARK, ...Typography.h3, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 10 },
});
