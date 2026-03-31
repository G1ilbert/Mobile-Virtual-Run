import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigation from '../../components/TopNavigation';
import { calcProgress } from '../../utils/helpers';

const LOCAL_MOCK_RUNS = [
  { id: 'r1', title: 'Mountain Trail 50K', status: 'Ongoing', currentKm: 25.0, targetKm: 50, daysLeft: 3, image: 'https://images.unsplash.com/photo-1551632432-c735e8a0cd52?q=80&w=500', finishersCount: 152, totalSlots: 1200 },
  { id: 'r2', title: 'Jan 30KM Challenge', status: 'Ongoing', currentKm: 28.5, targetKm: 30, daysLeft: 1, image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=500', finishersCount: 840, totalSlots: 2000 },
  { id: 'r3', title: 'Songkran Splash Run', status: 'Upcoming', currentKm: 0, targetKm: 10, daysUntilStart: 2, image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=500', finishersCount: 0, totalSlots: 1500 },
];

export default function RunScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const renderMyRunItem = ({ item }) => {
    const isUpcoming = item.status === 'Upcoming';
    const progress = calcProgress(item.currentKm, item.targetKm);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: `/run/${item.id}`, params: { title: item.title, status: item.status, currentKm: item.currentKm, targetKm: item.targetKm, daysLeft: item.daysLeft, image: item.image, finishersCount: item.finishersCount, totalSlots: item.totalSlots, daysUntilStart: item.daysUntilStart || 0 } })}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        <View style={styles.detailsContainer}>
          <View style={styles.topRow}>
            <View style={[styles.statusBadge, { backgroundColor: isUpcoming ? theme.border : COLORS.PRIMARY_YELLOW }]}>
              <Text style={[styles.statusLabel, { color: isUpcoming ? theme.text : COLORS.DARK_BG }]}>{isUpcoming ? 'UPCOMING' : 'ONGOING'}</Text>
            </View>
            {!isUpcoming && <Text style={styles.daysLeftText}>{item.daysLeft}d left</Text>}
          </View>
          <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
          {!isUpcoming ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.kmText}>{item.currentKm} <Text style={styles.totalKm}>/ {item.targetKm} KM</Text></Text>
                <Text style={[styles.percentText, { color: COLORS.PRIMARY_YELLOW }]}>{Math.round(progress)}%</Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: theme.border }]}><View style={[styles.barFill, { width: `${progress}%` }]} /></View>
            </View>
          ) : (
            <View style={styles.upcomingInfo}>
              <Ionicons name="calendar-outline" size={14} color={theme.textTertiary} />
              <Text style={styles.upcomingDate}>Starts in {item.daysUntilStart} days</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigation activeTab="Run" isDark={isDark} />
      <FlatList
        data={LOCAL_MOCK_RUNS}
        renderItem={renderMyRunItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...Layout.row, width: '100%', height: 125, marginBottom: 12, ...Components.cardMedium, borderWidth: 1, elevation: 2, overflow: 'hidden' },
  eventImage: { width: 110, height: '100%', resizeMode: 'cover' },
  detailsContainer: { flex: 1, padding: 12, justifyContent: 'center' },
  topRow: { ...Layout.rowBetween, marginBottom: 6 },
  statusBadge: { ...Components.badgeSmall },
  statusLabel: { fontSize: 9, fontWeight: '900' },
  daysLeftText: { ...Typography.captionSmall, color: COLORS.GRAY_400 },
  eventTitle: { ...Typography.bodyLarge, fontWeight: 'bold', marginBottom: 8 },
  progressContainer: { width: '100%' },
  progressHeader: { ...Layout.rowBetween, alignItems: 'flex-end', marginBottom: 5 },
  kmText: { ...Typography.bodyMedium, fontWeight: '800', color: COLORS.PRIMARY_YELLOW },
  totalKm: { ...Typography.captionSmall, color: COLORS.GRAY_400 },
  percentText: { ...Typography.caption, fontWeight: 'bold' },
  barBg: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.PRIMARY_YELLOW },
  upcomingInfo: { ...Layout.rowCenter, marginTop: 4 },
  upcomingDate: { ...Typography.caption, color: COLORS.GRAY_400, marginLeft: 5 }
});
