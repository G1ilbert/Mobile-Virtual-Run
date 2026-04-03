import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { globalStyles, COLORS, getTheme, Typography, Layout } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigation from '../../components/TopNavigation';
import { useAuthCheck } from '../../hooks/useAuthGuard';
import LoginPrompt from '../../components/LoginPrompt';
import { getMyRegistrations } from '../../utils/services/registrationService';
import { confirmDelivery } from '../../utils/services/shipmentService';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/60x60/333/666?text=E';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

// Timeline step component — vertical style
function TimelineStep({ icon, label, status, detail, showProgress, progress, trackingNumber, onCopyTracking, showConfirmButton, onConfirm, isLast, theme }) {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const isPending = status === 'pending';

  const circleColor = isCompleted ? '#4CAF50' : isActive ? COLORS.PRIMARY_YELLOW : theme.border;
  const lineColor = isCompleted ? '#4CAF50' : theme.border;
  const textColor = isPending ? COLORS.GRAY_500 : theme.text;

  return (
    <View style={{ flexDirection: 'row' }}>
      {/* Circle + line */}
      <View style={{ alignItems: 'center', width: 36 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: circleColor, justifyContent: 'center', alignItems: 'center' }}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          ) : (
            <Ionicons name={icon} size={14} color={isPending ? COLORS.GRAY_500 : COLORS.DARK_BG} />
          )}
        </View>
        {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: lineColor, minHeight: 30 }} />}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 20 }}>
        <Text style={{ color: textColor, fontSize: 15, fontWeight: '600' }}>{label}</Text>
        {detail && <Text style={{ color: COLORS.GRAY_400, fontSize: 13, marginTop: 3 }}>{detail}</Text>}

        {showProgress && (
          <View style={{ marginTop: 8 }}>
            <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: COLORS.PRIMARY_YELLOW, borderRadius: 3, width: `${Math.min((progress || 0) * 100, 100)}%` }} />
            </View>
          </View>
        )}

        {trackingNumber && (
          <TouchableOpacity onPress={onCopyTracking} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: theme.border, padding: 8, borderRadius: 8, alignSelf: 'flex-start' }}>
            <Ionicons name="copy-outline" size={14} color={COLORS.PRIMARY_YELLOW} />
            <Text style={{ color: COLORS.PRIMARY_YELLOW, marginLeft: 6, fontSize: 13 }}>คัดลอกเลขพัสดุ</Text>
          </TouchableOpacity>
        )}

        {showConfirmButton && (
          <TouchableOpacity onPress={onConfirm} style={{ backgroundColor: COLORS.PRIMARY_YELLOW, padding: 12, borderRadius: 10, marginTop: 8, alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 20 }}>
            <Text style={{ color: COLORS.DARK_BG, fontWeight: '700', fontSize: 14 }}>ยืนยันได้รับของแล้ว</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function DeliveryScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthCheck();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await getMyRegistrations();
      const regs = Array.isArray(data) ? data : data?.data || [];
      // Show all confirmed registrations (with or without shipment)
      const confirmed = regs
        .filter(r => r.paymentStatus === 'confirmed' && r.status === 'active' && !r.cancelledAt)
        .map(r => {
          const event = r.packages?.events;
          const pkg = r.packages;
          const shipment = r.shipments?.[0] || r.shipment;
          const results = r.runningResults || [];
          const approvedResults = results.filter(res => res.status === 'approved');
          const currentKm = approvedResults.reduce((sum, res) => sum + Number(res.runningProofs?.distance || 0), 0);
          const targetKm = Number(r.targetDistanceSnapshot || pkg?.targetDistance || 0);

          const tracking = shipment?.shipmentStaff?.[0]?.trackingNumber || shipment?.trackingNumber;
          const carrier = shipment?.shipmentStaff?.[0]?.carrier || shipment?.carrier;
          const isShipped = shipment && ['shipped', 'delivered'].includes(shipment.status);
          const isDelivered = shipment?.status === 'delivered';
          const distanceReached = targetKm > 0 && currentKm >= targetKm;

          return {
            regId: r.id,
            event,
            pkg,
            shipment,
            currentKm: Math.round(currentKm * 10) / 10,
            targetKm,
            distanceReached,
            isShipped,
            isDelivered,
            tracking,
            carrier,
            deliveredDate: shipment?.updatedAt && isDelivered ? new Date(shipment.updatedAt).toLocaleDateString('th-TH') : null,
          };
        });
      setItems(confirmed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { if (isAuthenticated) { setLoading(true); fetchData(); } }, [isAuthenticated]));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleConfirmDelivery = (shipmentId) => {
    Alert.alert('ยืนยันรับของ', 'คุณได้รับของรางวัลเรียบร้อยแล้วใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ยืนยัน', onPress: async () => {
          try {
            await confirmDelivery(shipmentId);
            Alert.alert('สำเร็จ', 'ยืนยันรับของเรียบร้อยแล้ว');
            fetchData();
          } catch (e) {
            Alert.alert('ผิดพลาด', e?.response?.data?.message || 'ไม่สามารถยืนยันได้');
          }
        }
      }
    ]);
  };

  const copyTracking = async (num) => {
    try { await Clipboard.setStringAsync(num); Alert.alert('คัดลอกแล้ว', `เลขพัสดุ: ${num}`); } catch {}
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <TopNavigation activeTab="Delivery" isDark={isDark} />
        <LoginPrompt message="เข้าสู่ระบบเพื่อดูสถานะการจัดส่ง" />
      </View>
    );
  }

  const renderItem = ({ item: d }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: getImageUrl(d.event?.coverImage) }} style={styles.eventThumb} contentFit="cover" cachePolicy="memory-disk" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>{d.event?.title || 'Event'}</Text>
          <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>{d.pkg?.name || ''} — {d.targetKm}K</Text>
        </View>
      </View>

      {/* 4-stage vertical timeline */}
      <View style={styles.timeline}>
        <TimelineStep
          icon="card-outline"
          label="ชำระเงิน"
          status="completed"
          detail="ชำระเงินแล้ว"
          theme={theme}
        />
        <TimelineStep
          icon="fitness-outline"
          label="กำลังเตรียมของ"
          status={d.distanceReached ? 'completed' : 'active'}
          detail={d.distanceReached
            ? 'วิ่งครบระยะแล้ว ✓'
            : `วิ่งแล้ว ${d.currentKm} / ${d.targetKm} KM`}
          showProgress={!d.distanceReached}
          progress={d.targetKm > 0 ? d.currentKm / d.targetKm : 0}
          theme={theme}
        />
        <TimelineStep
          icon="car-outline"
          label="จัดส่งแล้ว"
          status={d.isShipped ? 'completed' : d.distanceReached ? 'active' : 'pending'}
          detail={d.isShipped
            ? `${d.carrier || 'ขนส่ง'}: ${d.tracking}`
            : 'รอผู้จัดเตรียมจัดส่ง'}
          trackingNumber={d.isShipped ? d.tracking : null}
          onCopyTracking={() => d.tracking && copyTracking(d.tracking)}
          theme={theme}
        />
        <TimelineStep
          icon="checkmark-circle-outline"
          label="ได้รับแล้ว"
          status={d.isDelivered ? 'completed' : d.isShipped ? 'active' : 'pending'}
          detail={d.isDelivered ? `ยืนยันรับของเมื่อ ${d.deliveredDate}` : null}
          showConfirmButton={d.isShipped && !d.isDelivered && d.shipment}
          onConfirm={() => d.shipment && handleConfirmDelivery(d.shipment.id)}
          isLast
          theme={theme}
        />
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigation activeTab="Delivery" isDark={isDark} />

      {(loading || authLoading) ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 80 }} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => String(item.regId)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.PRIMARY_YELLOW} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 50 }}>
              <Ionicons name="cube-outline" size={50} color={theme.border} />
              <Text style={{ color: theme.textSecondary, fontSize: 15, marginTop: 12 }}>ยังไม่มีรายการจัดส่ง</Text>
              <Text style={{ color: COLORS.GRAY_400, fontSize: 12, marginTop: 4, textAlign: 'center', paddingHorizontal: 30 }}>
                รายการจัดส่งจะปรากฏเมื่อชำระเงินเรียบร้อยแล้ว
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(150,150,150,0.15)' },
  eventThumb: { width: 50, height: 50, borderRadius: 10 },
  eventTitle: { fontSize: 15, fontWeight: '700' },
  timeline: { paddingLeft: 4 },
});
