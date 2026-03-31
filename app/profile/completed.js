import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getCompletedEvents } from '../../utils/helpers';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;

export default function FinishedEventsScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const finishedEvents = getCompletedEvents();

  const renderItem = ({ item }) => (
    <View style={[styles.gridCard, { backgroundColor: theme.card }]}>
      <View>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-done-circle" size={20} color={COLORS.PRIMARY_YELLOW} />
        </View>
      </View>

      <View style={styles.cardDetail}>
        <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={Layout.row}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.GRAY_400} />
          <Text style={styles.eventDate}>{item.endDate}</Text>
        </View>
        <Text style={styles.distanceText}>{item.distance}</Text>
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Completed Events" onBack={() => router.back()} isDark={isDark} />

      <FlatList
        data={finishedEvents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
