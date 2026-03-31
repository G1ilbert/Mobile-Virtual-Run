import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, getTheme, Layout } from '../../constants/GlobalStyles';
import { MOCK_EVENTS } from '../../constants/MockData';
import TopNavigationBack from '../../components/TopNavigationBack';

export default function SearchOverlay() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return MOCK_EVENTS.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 7);
  }, [searchQuery]);

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>{item.date}</Text>
          <View style={styles.dot} />
          <Text style={styles.detailText}>Virtual Run</Text>
        </View>
        <Text style={[styles.priceText, { color: COLORS.PRIMARY_YELLOW }]}>฿{item.price || '450'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#666" />
    </TouchableOpacity>
  );

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
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <View style={styles.emptyView}>
                <Ionicons name="search-outline" size={60} color={theme.border} />
                <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
              </View>
            ) : (
              <View style={styles.recentSection}>
                <Text style={[styles.recentTitle, { color: theme.text }]}>Popular Tags</Text>
                <View style={styles.tagWrapper}>
                  {['Marathon', 'Midnight', 'Virtual', 'Phuket'].map((tag) => (
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
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  eventImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 15,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#888',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#888',
    marginHorizontal: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  emptyView: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 15,
    color: '#888',
    fontSize: 14,
  },
  recentSection: {
    marginTop: 10,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tagWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  }
});
