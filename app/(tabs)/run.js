import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigation from '../../components/TopNavigation';
import { getMyRegistrations, cancelRegistration } from '../../utils/services/registrationService';
import { useAuthCheck } from '../../hooks/useAuthGuard';
import LoginPrompt from '../../components/LoginPrompt';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/120x120/333/666?text=Run';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

function calcProgress(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
}

function getPaymentBadge(status) {
  const map = {
    pending: { label: 'Awaiting Payment', bg: '#f2cc0f', color: '#212121', icon: 'time-outline' },
    pending_verification: { label: 'Verifying...', bg: '#0288d1', color: '#fff', icon: 'hourglass-outline' },
    confirmed: { label: 'Confirmed', bg: '#2e7d32', color: '#fff', icon: 'checkmark-circle-outline' },
    rejected: { label: 'Rejected', bg: '#d32f2f', color: '#fff', icon: 'close-circle-outline' },
    cancelled: { label: 'Cancelled', bg: '#757575', color: '#fff', icon: 'ban-outline' },
  };
  return map[status] || { label: status, bg: '#757575', color: '#fff', icon: 'help-outline' };
}

function getResultBadge(status) {
  const map = {
    pending: { label: 'Under Review', bg: '#f2cc0f', color: '#212121' },
    approved: { label: 'Approved', bg: '#2e7d32', color: '#fff' },
    rejected: { label: 'Result Rejected', bg: '#d32f2f', color: '#fff' },
    suspicious: { label: 'Flagged', bg: '#ff6f00', color: '#fff' },
  };
  return map[status] || null;
}

export default function RunScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthCheck();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await getMyRegistrations();
      const regs = Array.isArray(data) ? data : data?.data || [];
      setRegistrations(regs.filter(r => r.status !== 'cancelled' && !r.deletedAt && !r.cancelledAt));
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchData(); }, [fetchData, isAuthenticated]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleCancel = (regId) => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure? This cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
            try {
              await cancelRegistration(regId, 'User cancelled from app');
              fetchData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Cannot cancel');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item: reg }) => {
    const event = reg.packages?.events;
    const pkg = reg.packages;
    const badge = getPaymentBadge(reg.paymentStatus);

    // Compute distance from running results
    const results = reg.runningResults || [];
    const approvedResults = results.filter(r => r.status === 'approved');
    const latestResult = results.length > 0 ? results[results.length - 1] : null;
    const currentKm = approvedResults.reduce((sum, r) => sum + Number(r.runningProofs?.distance || 0), 0);
    const targetKm = Number(reg.targetDistanceSnapshot || pkg?.targetDistance || 0);
    const progress = calcProgress(currentKm, targetKm);

    const imgUrl = getImageUrl(event?.coverImage);

    // Check if within submit window
    const now = new Date();
    const submitStart = event?.submitStartDate ? new Date(event.submitStartDate) : null;
    const submitEnd = event?.submitEndDate ? new Date(event.submitEndDate) : null;
    const canSubmit = reg.paymentStatus === 'confirmed' && submitStart && submitEnd && now >= submitStart && now <= submitEnd;

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.cardTop} activeOpacity={0.7} onPress={() => router.push(`/run/${reg.id}`)}>
          <Image source={{ uri: imgUrl }} style={styles.eventImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
          <View style={styles.detailsContainer}>
            <View style={styles.topRow}>
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Ionicons name={badge.icon} size={10} color={badge.color} style={{ marginRight: 3 }} />
                <Text style={[styles.statusLabel, { color: badge.color }]}>{badge.label}</Text>
              </View>
            </View>
            <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
              {event?.title || 'งานวิ่ง'}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
              {pkg?.name || ''} — {targetKm}K
            </Text>
            <Text style={{ color: COLORS.GRAY_500, fontSize: 11, marginTop: 2 }}>
              {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('th-TH') : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Progress bar for confirmed registrations */}
        {reg.paymentStatus === 'confirmed' && targetKm > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.kmText, { color: theme.text }]}>{currentKm.toFixed(1)} <Text style={styles.totalKm}>/ {targetKm} KM</Text></Text>
              <Text style={[styles.percentText, { color: COLORS.PRIMARY_YELLOW }]}>{Math.round(progress)}%</Text>
            </View>
            <View style={[styles.barBg, { backgroundColor: theme.border }]}>
              <View style={[styles.barFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>
        )}

        {/* Running result status */}
        {latestResult && reg.paymentStatus === 'confirmed' && (
          <View style={styles.resultRow}>
            {(() => {
              const rb = getResultBadge(latestResult.status);
              if (!rb) return null;
              return (
                <View style={[styles.resultBadge, { backgroundColor: rb.bg }]}>
                  <Text style={[styles.resultLabel, { color: rb.color }]}>Result: {rb.label}</Text>
                </View>
              );
            })()}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {reg.paymentStatus === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.PRIMARY_YELLOW }]}
                onPress={() => router.push({ pathname: '/event/payment', params: { registrationId: reg.id } })}
              >
                <Ionicons name="card-outline" size={14} color={COLORS.DARK_BG} />
                <Text style={[styles.actionText, { color: COLORS.DARK_BG }]}>Pay Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.ERROR }]}
                onPress={() => handleCancel(reg.id)}
              >
                <Text style={[styles.actionText, { color: COLORS.ERROR }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          {reg.paymentStatus === 'rejected' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.PRIMARY_YELLOW }]}
              onPress={() => router.push({ pathname: '/event/payment', params: { registrationId: reg.id } })}
            >
              <Ionicons name="refresh-outline" size={14} color={COLORS.DARK_BG} />
              <Text style={[styles.actionText, { color: COLORS.DARK_BG }]}>Re-upload Slip</Text>
            </TouchableOpacity>
          )}
          {canSubmit && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.PRIMARY_YELLOW }]}
              onPress={() => router.push('/(tabs)/submit')}
            >
              <Ionicons name="camera-outline" size={14} color={COLORS.DARK_BG} />
              <Text style={[styles.actionText, { color: COLORS.DARK_BG }]}>Submit Proof</Text>
            </TouchableOpacity>
          )}
          {reg.paymentStatus === 'pending_verification' && (
            <View style={[styles.actionBtn, { backgroundColor: theme.border }]}>
              <Ionicons name="hourglass-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.actionText, { color: theme.textSecondary }]}>Waiting for verification</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <TopNavigation activeTab="Run" isDark={isDark} />
        <LoginPrompt message="Log in to see your registrations and run progress" />
      </View>
    );
  }

  if (loading || authLoading) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <TopNavigation activeTab="Run" isDark={isDark} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigation activeTab="Run" isDark={isDark} />
      <FlatList
        data={registrations}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[Layout.padding, { paddingTop: 15, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY_YELLOW} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="fitness-outline" size={60} color={theme.border} />
            <Text style={{ color: theme.textSecondary, fontSize: 16, marginTop: 12 }}>No registrations yet</Text>
            <Text style={{ color: COLORS.GRAY_400, fontSize: 13, marginTop: 4 }}>Browse events to get started!</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)')} style={{ marginTop: 16, backgroundColor: COLORS.PRIMARY_YELLOW, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
              <Text style={{ color: '#212121', fontWeight: '700' }}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, borderRadius: 18, borderWidth: 1, overflow: 'hidden', padding: 14 },
  cardTop: { flexDirection: 'row' },
  eventImage: { width: 90, height: 90, borderRadius: 12 },
  detailsContainer: { flex: 1, paddingLeft: 14, justifyContent: 'center' },
  topRow: { marginBottom: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  statusLabel: { fontSize: 10, fontWeight: '800' },
  eventTitle: { ...Typography.body, fontWeight: '700' },
  progressSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(150,150,150,0.2)' },
  progressHeader: { ...Layout.rowBetween, marginBottom: 4 },
  kmText: { fontSize: 13, fontWeight: '700' },
  totalKm: { color: COLORS.GRAY_400, fontSize: 12, fontWeight: '400' },
  percentText: { fontSize: 12, fontWeight: '800' },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.PRIMARY_YELLOW, borderRadius: 3 },
  resultRow: { marginTop: 8 },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  resultLabel: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 4 },
  actionText: { fontSize: 12, fontWeight: '700' },
});
