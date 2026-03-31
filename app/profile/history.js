import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';

const MOCK_RUNS = [
  { id: '1', date: '2026-01-15 07:30', distance: 10.5, duration: '01:05:00', pace: '6:11', timestamp: 1736926200000 },
  { id: '2', date: '2026-01-12 18:15', distance: 5.2, duration: '00:30:15', pace: '5:49', timestamp: 1736684100000 },
  { id: '3', date: '2026-01-10 06:00', distance: 21.1, duration: '02:15:30', pace: '6:25', timestamp: 1736463600000 },
  { id: '4', date: '2026-01-08 17:45', distance: 3.0, duration: '00:15:20', pace: '5:06', timestamp: 1736289900000 },
  { id: '5', date: '2026-01-05 08:00', distance: 12.0, duration: '01:10:00', pace: '5:50', timestamp: 1736035200000 },
];

export default function RunHistoryScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const [sortBy, setSortBy] = useState('Date');
  const [order, setOrder] = useState('desc');

  const handleSort = (value) => {
    if (sortBy === value) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(value);
      setOrder('desc');
    }
  };

  const sortedRuns = useMemo(() => {
    let result = [...MOCK_RUNS];
    const isAsc = order === 'asc';

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'Distance':
          comparison = b.distance - a.distance;
          break;
        case 'Duration':
          comparison = b.duration.localeCompare(a.duration);
          break;
        case 'Pace':
          comparison = b.pace.localeCompare(a.pace);
          break;
        default:
          comparison = b.timestamp - a.timestamp;
      }
      return isAsc ? comparison * -1 : comparison;
    });
    return result;
  }, [sortBy, order]);

  const SortButton = ({ label, value }) => {
    const isActive = sortBy === value;
    return (
      <TouchableOpacity
        style={[
          styles.sortBtn,
          {
            backgroundColor: isActive ? COLORS.PRIMARY_YELLOW : theme.card,
            borderColor: isActive ? COLORS.PRIMARY_YELLOW : theme.border
          }
        ]}
        onPress={() => handleSort(value)}
      >
        <View style={styles.sortBtnContent}>
          <Text style={[styles.sortBtnText, { color: isActive ? COLORS.DARK_BG : theme.text }]}>
            {label}
          </Text>
          {isActive && (
            <Ionicons
              name={order === 'desc' ? "arrow-down" : "arrow-up"}
              size={14}
              color={COLORS.DARK_BG}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.runCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.dateGroup}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.PRIMARY_YELLOW} />
          <Text style={[styles.dateText, { color: theme.text }]}>{item.date}</Text>
        </View>
        <View style={[styles.paceBadge, { backgroundColor: theme.border }]}>
          <Text style={[styles.paceText, { color: theme.text }]}>{item.pace} /km</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.statDetail}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{item.distance} <Text style={styles.unit}>km</Text></Text>
        </View>
        <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statDetail}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{item.duration}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <TopNavigationBack title="Run History" onBack={() => router.back()} isDark={isDark} />

      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          <SortButton label="Recent" value="Date" />
          <SortButton label="Distance" value="Distance" />
          <SortButton label="Time" value="Duration" />
          <SortButton label="Pace" value="Pace" />
        </ScrollView>
      </View>

      <FlatList
        data={sortedRuns}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No run history found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sortContainer: { paddingVertical: 15 },
  sortScroll: { ...Layout.paddingHorizontal, gap: 10 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  sortBtnContent: { ...Layout.rowCenter },
  sortBtnText: { ...Typography.bodySmall, fontWeight: 'bold' },

  listPadding: { ...Layout.paddingHorizontal, paddingBottom: 40 },
  runCard: { ...Components.card, borderWidth: 1, padding: 16, marginBottom: 15 },
  cardHeader: { ...Layout.rowBetween, marginBottom: 15 },
  dateGroup: { ...Layout.rowCenter, gap: 6 },
  dateText: { ...Typography.bodySmall, opacity: 0.8 },
  paceBadge: { ...Components.badgeTiny, paddingVertical: 2, paddingHorizontal: 8 },
  paceText: { ...Typography.caption, fontWeight: 'bold' },

  cardBody: { ...Layout.rowAround },
  statDetail: { alignItems: 'center' },
  statLabel: { ...Typography.captionSmall, color: COLORS.GRAY_400, marginBottom: 4, textTransform: 'uppercase' },
  statValue: { ...Typography.h4 },
  unit: { ...Typography.caption, fontWeight: 'normal' },
  verticalDivider: { ...Components.dividerVertical, height: 30, width: 1 },

  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.GRAY_400, ...Typography.bodyMedium }
});
