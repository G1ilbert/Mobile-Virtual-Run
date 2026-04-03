import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, useColorScheme, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigation from '../../components/TopNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { getMyRegistrations } from '../../utils/services/registrationService';
import { getMyRunningProofs, getMyRunningResults } from '../../utils/services/runningProofService';
import LoginPrompt from '../../components/LoginPrompt';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/80x80/333/666?text=E';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { userData, loading: authLoading, isAuthenticated, refreshUserData } = useAuth();

  const [stats, setStats] = useState({ events: 0, totalKm: 0, approvedResults: 0, proofCount: 0 });
  const [completedEvents, setCompletedEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [regs, proofs, results] = await Promise.all([
        getMyRegistrations().catch(() => []),
        getMyRunningProofs().catch(() => []),
        getMyRunningResults().catch(() => []),
      ]);
      const regList = Array.isArray(regs) ? regs : regs?.data || [];
      const proofList = Array.isArray(proofs) ? proofs : proofs?.data || [];
      const resultList = Array.isArray(results) ? results : results?.data || [];

      const confirmed = regList.filter(r => r.paymentStatus === 'confirmed' && r.status === 'active');
      const approvedResults = resultList.filter(r => r.status === 'approved');
      const totalKm = proofList.reduce((sum, p) => sum + Number(p.distance || 0), 0);

      setStats({
        events: confirmed.length,
        totalKm: Math.round(totalKm * 10) / 10,
        approvedResults: approvedResults.length,
        proofCount: proofList.length,
      });

      // Completed events: confirmed regs where event is closed OR has approved result
      const completed = confirmed.filter(r => {
        const ev = r.packages?.events;
        const hasApproved = resultList.some(res => res.registrationId === r.id && res.status === 'approved');
        return hasApproved || ev?.status === 'closed';
      }).map(r => ({
        id: r.packages?.events?.id,
        title: r.packages?.events?.title,
        coverImage: r.packages?.events?.coverImage,
        distance: Number(r.targetDistanceSnapshot || 0),
      })).filter((v, i, a) => v.id && a.findIndex(t => t.id === v.id) === i);

      setCompletedEvents(completed);
    } catch (err) { console.error(err); }
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) loadData(); }, [loadData, isAuthenticated]);

  // Refresh user data when returning from edit screen
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) refreshUserData();
    }, [isAuthenticated])
  );

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <TopNavigation activeTab="Profile" isDark={isDark} />
        <LoginPrompt message="Log in to view your profile and stats" />
      </View>
    );
  }

  const displayName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username || 'Runner' : 'Runner';
  const avatarUrl = `https://i.pravatar.cc/150?u=${userData?.id || 0}`;

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyCard} onPress={() => router.push(`/event/${item.id}`)}>
      <Image source={{ uri: getImageUrl(item.coverImage) }} style={styles.historyImage} />
      <Text style={[styles.historyTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.historyDate}>{item.distance}K</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigation activeTab="Profile" isDark={isDark} />
      <ScrollView
        style={[globalStyles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY_YELLOW} />}
      >

        {/* Header */}
        <View style={styles.headerSection}>
          <Image source={{ uri: avatarUrl }} style={[styles.profilePic, { borderColor: COLORS.PRIMARY_YELLOW, borderWidth: 2 }]} />
          <View style={styles.headerInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{displayName}</Text>
            <Text style={styles.userHandle}>@{userData?.username || 'runner'}</Text>
          </View>
        </View>

        {/* Stats Dashboard */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card, flex: 2 }]}>
            <Text style={styles.statCardNumber}>{stats.totalKm}</Text>
            <Text style={styles.statCardLabel}>Total KM</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, flex: 1 }]}>
            <Text style={styles.statCardNumber}>{stats.events}</Text>
            <Text style={styles.statCardLabel}>Events</Text>
          </View>
        </View>

        {/* Event History */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Completed Events</Text>
          {completedEvents.length > 0 && (
            <TouchableOpacity
              style={[styles.viewAllBtn, { borderColor: theme.border }]}
              onPress={() => router.push('/profile/completed')}
            >
              <Text style={[styles.viewAllText, { color: theme.text }]}>View all</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={completedEvents}
          renderItem={renderHistoryItem}
          keyExtractor={item => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={<Text style={{ color: theme.textTertiary, marginLeft: 20 }}>No finished events yet</Text>}
        />

        {/* Menu Options */}
        <View style={styles.menuWrapper}>
          <MenuOption
            theme={theme}
            icon="stats-chart-outline"
            label="Run History"
            badge={`${stats.proofCount} Logs`}
            onPress={() => router.push('/profile/history')}
          />
          <MenuOption
            theme={theme}
            icon="settings-outline"
            label="Settings"
            onPress={() => router.push('/profile/settings')}
            isLast
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

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
  headerInfo: { flex: 1 },
  userName: { ...Typography.h2, fontWeight: 'bold' },
  userHandle: { color: COLORS.GRAY_400, ...Typography.bodyMedium, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 30 },
  statCard: { borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center' },
  statCardNumber: { color: COLORS.PRIMARY_YELLOW, fontSize: 32, fontWeight: '900' },
  statCardLabel: { color: COLORS.GRAY_400, fontSize: 13, marginTop: 4 },
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
