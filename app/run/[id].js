import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getRegistrationById } from '../../utils/services/registrationService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/400x220/333/666?text=Event';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

function getProofImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/running-proofs/${path}`;
}

function getPaymentBadge(status) {
  const map = {
    pending: { label: 'Awaiting Payment', bg: '#f2cc0f', color: '#212121' },
    pending_verification: { label: 'Verifying...', bg: '#0288d1', color: '#fff' },
    confirmed: { label: 'Confirmed', bg: '#2e7d32', color: '#fff' },
    rejected: { label: 'Rejected', bg: '#d32f2f', color: '#fff' },
  };
  return map[status] || { label: status, bg: '#757575', color: '#fff' };
}

function getResultBadge(status) {
  const map = {
    pending: { label: 'Under Review', bg: '#f2cc0f', color: '#212121' },
    approved: { label: 'Approved', bg: '#2e7d32', color: '#fff' },
    rejected: { label: 'Rejected', bg: '#d32f2f', color: '#fff' },
    suspicious: { label: 'Flagged', bg: '#ff6f00', color: '#fff' },
  };
  return map[status] || null;
}

export default function RunDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isReady } = useAuthGuard();

  const [reg, setReg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRegistrationById(id);
        setReg(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (!isReady || loading) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} />
      </View>
    );
  }

  if (!reg) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <TopNavigationBack title="Run Details" onBack={() => router.back()} isDark={isDark} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.GRAY_400 }}>Registration not found</Text>
        </View>
      </View>
    );
  }

  const event = reg.packages?.events;
  const pkg = reg.packages;
  const results = reg.runningResults || [];
  const approvedResults = results.filter(r => r.status === 'approved');
  const currentKm = approvedResults.reduce((sum, r) => sum + Number(r.runningProofs?.distance || 0), 0);
  const targetKm = Number(reg.targetDistanceSnapshot || pkg?.targetDistance || 0);
  const progress = targetKm > 0 ? Math.min(100, (currentKm / targetKm) * 100) : 0;
  const remainingKm = Math.max(0, targetKm - currentKm);
  const payBadge = getPaymentBadge(reg.paymentStatus);
  const latestResult = results.length > 0 ? results[results.length - 1] : null;

  // Days left calculation
  const endDate = event?.submitEndDate || event?.endDate;
  const daysLeft = endDate ? Math.max(0, Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const avgPerDay = daysLeft > 0 ? (remainingKm / daysLeft).toFixed(2) : 0;

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Run Details" onBack={() => router.back()} isDark={isDark} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: getImageUrl(event?.coverImage) }} style={styles.banner} />

        <View style={styles.content}>
          {/* Title + badge */}
          <View style={Layout.rowBetween}>
            <Text style={[styles.title, { color: theme.text, flex: 1 }]}>{event?.title || 'Event'}</Text>
            <View style={[styles.badge, { backgroundColor: payBadge.bg }]}>
              <Text style={{ color: payBadge.color, fontSize: 10, fontWeight: '800' }}>{payBadge.label}</Text>
            </View>
          </View>

          {/* Package + price */}
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.GRAY_400, fontSize: 11, textTransform: 'uppercase' }}>Package</Text>
              <Text style={[{ color: theme.text, fontWeight: '700', marginTop: 2 }]}>{pkg?.name || '-'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: COLORS.GRAY_400, fontSize: 11, textTransform: 'uppercase' }}>Price</Text>
              <Text style={{ color: COLORS.PRIMARY_YELLOW, fontWeight: '900', marginTop: 2 }}>
                ฿{Number(reg.priceSnapshot || pkg?.price || 0).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Goal + achieved */}
          {reg.paymentStatus === 'confirmed' && targetKm > 0 && (
            <>
              <View style={Layout.rowBetween}>
                <View>
                  <Text style={styles.label}>Goal</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{targetKm} KM</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.label, { color: COLORS.PRIMARY_YELLOW }]}>Achieved</Text>
                  <Text style={[styles.statValue, { color: COLORS.PRIMARY_YELLOW }]}>{currentKm.toFixed(1)} KM</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressSection}>
                <View style={Layout.rowBetween}>
                  <Text style={styles.label}>Progress</Text>
                  <Text style={[styles.percent, { color: COLORS.PRIMARY_YELLOW }]}>{Math.round(progress)}%</Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: theme.border }]}>
                  <View style={[styles.barFill, { width: `${progress}%` }]} />
                </View>
              </View>

              {/* Daily target */}
              {daysLeft > 0 && remainingKm > 0 && (
                <View style={[styles.highlightCard, { borderColor: COLORS.PRIMARY_YELLOW }]}>
                  <Text style={styles.label}>Daily Target Required</Text>
                  <Text style={styles.avgValue}>{avgPerDay} <Text style={styles.unit}>KM/Day</Text></Text>
                  <Text style={styles.subText}>{remainingKm.toFixed(1)} KM left • {daysLeft} days remaining</Text>
                </View>
              )}
            </>
          )}

          {/* Running result status */}
          {latestResult && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Latest Submission</Text>
              <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {latestResult.runningProofs?.imageUrl && (
                  <Image
                    source={{ uri: getProofImageUrl(latestResult.runningProofs.imageUrl) }}
                    style={styles.proofThumb}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: theme.text, fontWeight: '600' }]}>
                    {Number(latestResult.runningProofs?.distance || 0).toFixed(1)} km
                  </Text>
                  {(() => {
                    const rb = getResultBadge(latestResult.status);
                    return rb ? (
                      <View style={[styles.resultBadge, { backgroundColor: rb.bg }]}>
                        <Text style={{ color: rb.color, fontSize: 10, fontWeight: '700' }}>{rb.label}</Text>
                      </View>
                    ) : null;
                  })()}
                </View>
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={{ marginTop: 20 }}>
            {reg.paymentStatus === 'pending' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push({ pathname: '/event/payment', params: { registrationId: reg.id } })}
              >
                <Text style={styles.actionBtnText}>PAY NOW</Text>
              </TouchableOpacity>
            )}
            {reg.paymentStatus === 'rejected' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push({ pathname: '/event/payment', params: { registrationId: reg.id } })}
              >
                <Text style={styles.actionBtnText}>RE-UPLOAD SLIP</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 200 },
  content: { padding: 20 },
  title: { ...Typography.h3, fontWeight: 'bold', marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  label: { ...Typography.caption, color: COLORS.GRAY_400, textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: '900' },
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 14, marginBottom: 20 },
  highlightCard: { padding: 20, borderRadius: 15, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', marginTop: 16 },
  avgValue: { fontSize: 28, fontWeight: '900', color: COLORS.PRIMARY_YELLOW, marginVertical: 5 },
  unit: { fontSize: 16 },
  subText: { ...Typography.captionSmall, color: COLORS.GRAY_400 },
  progressSection: { marginTop: 20 },
  percent: { fontWeight: 'bold' },
  barBg: { width: '100%', height: 10, borderRadius: 5, marginTop: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.PRIMARY_YELLOW },
  sectionTitle: { ...Typography.bodyLarge, fontWeight: '700', marginBottom: 10 },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
  proofThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4, alignSelf: 'flex-start' },
  actionBtn: { backgroundColor: COLORS.PRIMARY_YELLOW, ...Components.buttonLarge },
  actionBtnText: { ...Typography.buttonLarge, color: COLORS.DARK_BG, fontWeight: 'bold' },
});
