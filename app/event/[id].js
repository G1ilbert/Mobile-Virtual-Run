import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getEventById, getEventPackages } from '../../utils/services/eventService';
import { getMyRegistrations } from '../../utils/services/registrationService';
import { useAuth } from '../../contexts/AuthContext';
import { EventDetailSkeleton } from '../../components/Skeleton';

const { width } = Dimensions.get('window');
const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';

function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/400x200/333/666?text=Event';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

export default function EventDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRegistration, setMyRegistration] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [ev, pkgs] = await Promise.all([
          getEventById(id),
          getEventPackages(id),
        ]);
        setEvent(ev);
        setPackages(pkgs || ev?.packages || []);
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Check user's registration for this event
  const checkMyRegistration = useCallback(async () => {
    if (!isAuthenticated) { setMyRegistration(null); return; }
    try {
      const data = await getMyRegistrations();
      const regs = Array.isArray(data) ? data : data?.data || [];
      const reg = regs.find(r =>
        r.packages?.eventId === Number(id) &&
        r.status !== 'cancelled' &&
        !r.cancelledAt &&
        !r.deletedAt
      );
      setMyRegistration(reg || null);
    } catch {
      setMyRegistration(null);
    }
  }, [id, isAuthenticated]);

  useEffect(() => { checkMyRegistration(); }, [checkMyRegistration]);

  // Re-check when returning from payment/register
  useFocusEffect(useCallback(() => { if (isAuthenticated) checkMyRegistration(); }, [isAuthenticated]));

  if (loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
        <TopNavigationBack title="Event Details" onBack={() => router.back()} isDark={isDark} />
        <EventDetailSkeleton />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <TopNavigationBack title="Event Details" onBack={() => router.back()} isDark={isDark} />
        <Text style={{ color: theme.textSecondary }}>ไม่พบงานวิ่งนี้</Text>
      </View>
    );
  }

  const now = new Date();
  const regEnd = event.endDate ? new Date(event.endDate) : null;
  const regStart = event.startDate ? new Date(event.startDate) : null;
  const canRegister = event.status === 'approved' && (!regStart || now >= regStart) && (!regEnd || now <= regEnd);
  const isExpired = regEnd && now > regEnd;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={18} color={COLORS.PRIMARY_YELLOW} />
      </View>
      <View>
        <Text style={[Typography.captionSmall, { color: COLORS.GRAY_400 }]}>{label}</Text>
        <Text style={[Typography.bodySmall, { color: theme.text, fontWeight: 'bold' }]}>{value}</Text>
      </View>
    </View>
  );

  // Smart bottom button
  const renderBottomButton = () => {
    if (myRegistration) {
      const ps = myRegistration.paymentStatus;
      if (ps === 'pending') {
        return (
          <TouchableOpacity
            style={[styles.bottomBtn, { backgroundColor: '#FF9800' }]}
            onPress={() => router.push({ pathname: '/event/payment', params: { registrationId: myRegistration.id } })}
          >
            <Ionicons name="card" size={20} color={COLORS.DARK_BG} />
            <Text style={styles.bottomBtnText}>ไปชำระเงิน</Text>
          </TouchableOpacity>
        );
      }
      if (ps === 'pending_verification') {
        return (
          <View style={[styles.bottomBtn, { backgroundColor: theme.border }]}>
            <Ionicons name="hourglass" size={20} color={theme.textSecondary} />
            <Text style={[styles.bottomBtnText, { color: theme.textSecondary }]}>รอยืนยันการชำระเงิน</Text>
          </View>
        );
      }
      if (ps === 'confirmed') {
        return (
          <View style={[styles.bottomBtn, { backgroundColor: '#2e7d32' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={[styles.bottomBtnText, { color: '#FFF' }]}>สมัครแล้ว</Text>
          </View>
        );
      }
      if (ps === 'rejected') {
        return (
          <TouchableOpacity
            style={[styles.bottomBtn, { backgroundColor: '#FF9800' }]}
            onPress={() => router.push({ pathname: '/event/payment', params: { registrationId: myRegistration.id } })}
          >
            <Ionicons name="refresh" size={20} color={COLORS.DARK_BG} />
            <Text style={styles.bottomBtnText}>อัปโหลดสลิปใหม่</Text>
          </TouchableOpacity>
        );
      }
    }

    if (isExpired) {
      return (
        <View style={[styles.bottomBtn, { backgroundColor: theme.border }]}>
          <Ionicons name="lock-closed" size={20} color={COLORS.GRAY_500} />
          <Text style={[styles.bottomBtnText, { color: COLORS.GRAY_500 }]}>หมดเขตรับสมัคร</Text>
        </View>
      );
    }

    if (canRegister) {
      return (
        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: COLORS.PRIMARY_YELLOW }]}
          onPress={() => {
            if (!isAuthenticated) {
              router.push({ pathname: '/login', params: { redirect: `/event/select-package?eventId=${event.id}` } });
            } else {
              router.push({ pathname: '/event/select-package', params: { eventId: event.id } });
            }
          }}
        >
          <Ionicons name="add-circle" size={20} color={COLORS.DARK_BG} />
          <Text style={styles.bottomBtnText}>สมัครงานวิ่ง</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.bottomBtn, { backgroundColor: theme.border }]}>
        <Text style={[styles.bottomBtnText, { color: COLORS.GRAY_500 }]}>ยังไม่เปิดรับสมัคร</Text>
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Event Details" onBack={() => router.back()} isDark={isDark} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: getImageUrl(event.coverImage) }} style={styles.coverImage} contentFit="cover" transition={300} cachePolicy="memory-disk" />

        <View style={styles.contentWrapper}>
          <View style={Layout.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h3, { color: theme.text }]}>{event.title}</Text>
              <View style={[Layout.rowCenter, { marginTop: 4 }]}>
                <Ionicons name="location-outline" size={14} color={COLORS.PRIMARY_YELLOW} />
                <Text style={[Typography.caption, { color: COLORS.GRAY_400, marginLeft: 4 }]}>Virtual Run</Text>
              </View>
            </View>
            <View style={[Components.badgeTiny, { backgroundColor: canRegister ? COLORS.SUCCESS : COLORS.GRAY_400 }]}>
              <Text style={[Typography.badge, { color: COLORS.DARK_BG }]}>
                {canRegister ? 'OPEN' : isExpired ? 'CLOSED' : event.status?.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={[Layout.rowBetween, { marginTop: 20 }]}>
            <InfoRow icon="calendar-outline" label="เปิดรับสมัคร" value={formatDate(event.startDate)} />
            <InfoRow icon="time-outline" label="ปิดรับสมัคร" value={formatDate(event.endDate)} />
          </View>

          {event.submitDate && (
            <View style={{ marginTop: 10 }}>
              <InfoRow icon="document-text-outline" label="ส่งผลวิ่งได้ถึง" value={formatDate(event.submitDate)} />
            </View>
          )}

          <View style={[Components.divider, { backgroundColor: theme.border, marginVertical: 20 }]} />

          <Text style={[Typography.sectionTitle, { color: theme.text, marginBottom: 10 }]}>รายละเอียด</Text>
          <Text style={[Typography.bodyMedium, { color: theme.textSecondary, lineHeight: 22 }]}>
            {event.description || 'ไม่มีรายละเอียด'}
          </Text>

          <Text style={[Typography.sectionTitle, { color: theme.text, marginTop: 25, marginBottom: 15 }]}>แพ็คเกจ</Text>
          {packages.map((pkg) => (
            <View
              key={pkg.id}
              style={[styles.packageCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={Layout.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.body, { color: theme.text, fontWeight: 'bold' }]}>{pkg.name}</Text>
                  <Text style={[Typography.caption, { color: COLORS.GRAY_400, marginTop: 2 }]}>
                    {Number(pkg.targetDistance)}K
                    {pkg.packageItems?.length > 0 && ` — ${pkg.packageItems.map(pi => pi.items?.name).filter(Boolean).join(', ')}`}
                  </Text>
                </View>
                <Text style={[Typography.bodyLarge, { color: COLORS.PRIMARY_YELLOW, fontWeight: '900' }]}>
                  ฿{Number(pkg.price).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        {renderBottomButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  coverImage: { width: width, height: width * 0.56 },
  contentWrapper: { ...Layout.padding },
  infoRow: { ...Layout.rowCenter, width: '48%' },
  iconBox: { ...Components.iconContainerSmall, marginRight: 10, borderRadius: 10 },
  packageCard: { padding: 16, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  bottomBtnText: {
    color: COLORS.DARK_BG,
    fontSize: 17,
    fontWeight: '700',
  },
});
