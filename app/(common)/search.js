import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, getTheme, Layout } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getPublicEvents } from '../../utils/services/eventService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/80x80/333/666?text=E';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

const RECENT_KEY = 'recent_searches';
const MAX_RECENT = 8;

export default function SearchOverlay() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const timerRef = useRef(null);

  // Load recent searches
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then(val => {
      if (val) setRecentSearches(JSON.parse(val));
    }).catch(() => {});
  }, []);

  const saveRecentSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const clearRecent = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_KEY).catch(() => {});
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredEvents([]); setPage(1); setHasMore(false); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      setPage(1);
      try {
        const result = await getPublicEvents(1, 10, searchQuery.trim());
        setFilteredEvents(result.data || []);
        setHasMore(result.meta?.hasMore || false);
        saveRecentSearch(searchQuery.trim());
      } catch { setFilteredEvents([]); }
      finally { setSearching(false); }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [searchQuery]);

  // Load more
  const handleLoadMore = async () => {
    if (!hasMore || loadingMore || searching) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getPublicEvents(nextPage, 10, searchQuery.trim());
      setFilteredEvents(prev => [...prev, ...(result.data || [])]);
      setPage(nextPage);
      setHasMore(result.meta?.hasMore || false);
    } catch {} finally { setLoadingMore(false); }
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <Image source={{ uri: getImageUrl(item.coverImage) }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>{item.startDate ? new Date(item.startDate).toLocaleDateString('th-TH') : 'TBA'}</Text>
          <View style={styles.dot} />
          <Text style={styles.detailText}>Virtual Run</Text>
        </View>
        <Text style={[styles.priceText, { color: COLORS.PRIMARY_YELLOW }]}>
          {item.packages?.length > 0 ? '฿' + Math.min(...item.packages.map(p => Number(p.price))).toLocaleString() : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#666" />
    </TouchableOpacity>
  );

  const EmptyComponent = () => {
    if (searching) {
      return <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 60 }} />;
    }
    if (searchQuery.length > 0) {
      return (
        <View style={styles.emptyView}>
          <Ionicons name="search-outline" size={60} color={theme.border} />
          <Text style={styles.emptyText}>No events found for "{searchQuery}"</Text>
        </View>
      );
    }
    return (
      <View style={styles.recentSection}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <>
            <View style={Layout.rowBetween}>
              <Text style={[styles.recentTitle, { color: theme.text }]}>Recent Searches</Text>
              <TouchableOpacity onPress={clearRecent}>
                <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagWrapper}>
              {recentSearches.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSearchQuery(q)}
                  style={[styles.tag, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <Ionicons name="time-outline" size={12} color={COLORS.GRAY_400} style={{ marginRight: 4 }} />
                  <Text style={{ color: theme.text, fontSize: 13 }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 20 }} />
          </>
        )}

        {/* Suggestions */}
        <Text style={[styles.recentTitle, { color: theme.text }]}>Popular Tags</Text>
        <View style={styles.tagWrapper}>
          {['Marathon', 'Midnight', 'Virtual', '10K', '5K', 'Night Run'].map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => setSearchQuery(tag)}
              style={[styles.tag, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Text style={{ color: theme.text, fontSize: 13 }}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopNavigationBack title="Search Events" onBack={() => router.back()} isDark={isDark} />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
        <View style={styles.searchBarWrapper}>
          <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <FontAwesome5 name="search" size={16} color="#888" style={{ marginRight: 12 }} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Search by event name..."
              placeholderTextColor="#888"
              autoFocus={true}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredEvents}
          renderItem={renderSearchItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<EmptyComponent />}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.PRIMARY_YELLOW} style={{ paddingVertical: 16 }} /> : null}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarWrapper: { paddingHorizontal: 20, paddingVertical: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 52, borderRadius: 16, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  eventImage: { width: 65, height: 65, borderRadius: 12 },
  eventInfo: { flex: 1, marginLeft: 15 },
  eventTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 12, color: '#888' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#888', marginHorizontal: 6 },
  priceText: { fontSize: 14, fontWeight: '900', marginTop: 4 },
  emptyView: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 15, color: '#888', fontSize: 14 },
  recentSection: { marginTop: 10 },
  recentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  tagWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});
