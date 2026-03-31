import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_RANKINGS, MOCK_EVENTS } from '../../constants/MockData';
import TopNavigation from '../../components/TopNavigation';
import { getCurrentUser, getCompletedEvents } from '../../utils/helpers';

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const user = getCurrentUser();
  const finishedEvents = getCompletedEvents();

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Image source={{ uri: item.image }} style={styles.historyImage} />
      <Text style={[styles.historyTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.historyDate}>Finished</Text>
    </View>
  );

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigation activeTab="Profile" isDark={isDark} />
      <ScrollView style={[globalStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image source={{ uri: user.avatar }} style={[styles.profilePic, { borderColor: COLORS.PRIMARY_YELLOW, borderWidth: 2 }]} />
          <View style={styles.headerInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
            <Text style={styles.userHandle}>@gold_stride • Runner</Text>
          </View>
        </View>

        {/* Stats Dashboard */}
        <View style={[styles.dashboardContainer, { backgroundColor: theme.card }]}>
          <StatBox label="Events" value={user.events.toString()} />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <StatBox label="Longest Run" value="21.5" />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <StatBox label="Total Run" value="48" />
        </View>

        {/* Section: Event History */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Event History</Text>
          <TouchableOpacity
            style={[styles.viewAllBtn, { borderColor: theme.border }]}
            onPress={() => router.push('/profile/completed')}
          >
            <Text style={[styles.viewAllText, { color: theme.text }]}>View all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={finishedEvents}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={<Text style={{color: theme.textTertiary, marginLeft: 20}}>No finished events yet</Text>}
        />

        {/* Section: Menu Options */}
        <View style={styles.menuWrapper}>
          <MenuOption
            theme={theme}
            icon="stats-chart-outline"
            label="Run History (Submissions)"
            badge="24 Logs"
            isLast
            onPress={() => router.push('/profile/history')}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// Helper Components
const StatBox = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuOption = ({ icon, label, theme, badge, isLast, onPress }) => (
  <TouchableOpacity
    style={[styles.menuRow, { borderBottomColor: isLast ? 'transparent' : theme.border }]}
    onPress={onPress}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.iconContainer, { backgroundColor: theme.border }]}>
        <Ionicons name={icon} size={20} color={COLORS.PRIMARY_YELLOW} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <View style={styles.menuRight}>
      {badge && <Text style={styles.badgeText}>{badge}</Text>}
      <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerSection: { ...Layout.rowCenter, padding: 25 },
  profilePic: { width: 85, height: 85, borderRadius: 45, marginRight: 20 },
  userName: { ...Typography.h2, fontWeight: 'bold' },
  userHandle: { color: COLORS.GRAY_400, ...Typography.bodyMedium, marginTop: 4 },
  dashboardContainer: { ...Layout.row, marginHorizontal: 20, ...Components.cardLarge, paddingVertical: 20, marginBottom: 35 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { color: COLORS.PRIMARY_YELLOW, ...Typography.statMedium },
  statLabel: { color: COLORS.GRAY_400, ...Typography.captionSmall, marginTop: 4 },
  statDivider: { width: 1, height: '40%', alignSelf: 'center' },
  sectionHeader: { ...Layout.rowBetween, ...Layout.paddingHorizontal, marginBottom: 15 },
  sectionTitle: { ...Typography.sectionTitle },
  viewAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  viewAllText: { ...Typography.caption, fontWeight: 'bold' },
  historyList: { paddingLeft: 20, paddingBottom: 10 },
  historyCard: { width: 160, marginRight: 15 },
  historyImage: { width: 160, height: 100, borderRadius: 15, backgroundColor: COLORS.GRAY_600 },
  historyTitle: { ...Typography.bodyMedium, fontWeight: 'bold', marginTop: 10 },
  historyDate: { color: COLORS.GRAY_400, ...Typography.captionSmall, marginTop: 2 },
  menuWrapper: { ...Layout.paddingHorizontal, marginTop: 20 },
  menuRow: { ...Layout.rowBetween, paddingVertical: 18, borderBottomWidth: 0.5 },
  menuLeft: { ...Layout.rowCenter },
  menuRight: { ...Layout.rowCenter },
  iconContainer: { ...Components.iconContainer, marginRight: 15 },
  menuLabel: { ...Typography.bodyLarge },
  badgeText: { color: COLORS.PRIMARY_YELLOW, ...Typography.caption, fontWeight: 'bold', marginRight: 8 }
});
