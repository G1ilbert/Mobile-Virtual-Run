import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getMyRunningProofs } from '../../utils/services/runningProofService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getProofImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/running-proofs/${path}`;
}

function formatDuration(dur) {
  if (!dur) return '-';
  const str = typeof dur === 'string' ? dur : '';
  if (str.includes('T') && str.includes('1970')) {
    const d = new Date(str);
    const totalSec = Math.floor(d.getTime() / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return str;
}

function calcPace(distance, duration) {
  if (!distance || !duration) return '-';
  const str = typeof duration === 'string' ? duration : '';
  let totalSec = 0;
  if (str.includes('T') && str.includes('1970')) {
    totalSec = Math.floor(new Date(str).getTime() / 1000);
  } else {
    const parts = str.split(':').map(Number);
    totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  if (totalSec <= 0 || distance <= 0) return '-';
  const pacePerKm = totalSec / distance;
  return `${Math.floor(pacePerKm / 60)}:${String(Math.round(pacePerKm % 60)).padStart(2, '0')}`;
}

export default function RunHistoryScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isReady } = useAuthGuard();

  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Date');
  const [order, setOrder] = useState('desc');
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyRunningProofs();
        const list = Array.isArray(data) ? data : data?.data || [];
        setProofs(list.map(p => ({
          id: String(p.id),
          date: p.createdAt ? new Date(p.createdAt).toLocaleString('th-TH') : '-',
          distance: Number(p.distance || 0),
          duration: formatDuration(p.duration),
          pace: calcPace(Number(p.distance), p.duration),
          timestamp: p.createdAt ? new Date(p.createdAt).getTime() : 0,
          imageUrl: p.imageUrl,
          status: p.runningResults?.[0]?.status || null,
        })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleSort = (value) => {
    if (sortBy === value) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(value);
      setOrder('desc');
    }
  };

  const sortedRuns = useMemo(() => {
    let result = [...proofs];
    const isAsc = order === 'asc';
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'Distance': comparison = b.distance - a.distance; break;
        case 'Duration': comparison = b.duration.localeCompare(a.duration); break;
        case 'Pace': comparison = b.pace.localeCompare(a.pace); break;
        default: comparison = b.timestamp - a.timestamp;
      }
      return isAsc ? comparison * -1 : comparison;
    });
    return result;
  }, [proofs, sortBy, order]);

  const SortButton = ({ label, value }) => {
    const isActive = sortBy === value;
    return (
      <TouchableOpacity
        style={[styles.sortBtn, { backgroundColor: isActive ? COLORS.PRIMARY_YELLOW : theme.card, borderColor: isActive ? COLORS.PRIMARY_YELLOW : theme.border }]}
        onPress={() => handleSort(value)}
      >
        <View style={styles.sortBtnContent}>
          <Text style={[styles.sortBtnText, { color: isActive ? COLORS.DARK_BG : theme.text }]}>{label}</Text>
          {isActive && <Ionicons name={order === 'desc' ? "arrow-down" : "arrow-up"} size={14} color={COLORS.DARK_BG} style={{ marginLeft: 4 }} />}
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return COLORS.SUCCESS;
    if (status === 'rejected') return COLORS.ERROR;
    if (status === 'suspicious') return '#ff6f00';
    if (status === 'pending') return COLORS.PRIMARY_YELLOW;
    return null;
  };

  const renderItem = ({ item }) => (
    <View style={[styles.runCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.dateGroup}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.PRIMARY_YELLOW} />
          <Text style={[styles.dateText, { color: theme.text }]}>{item.date}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {item.status && (
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          )}
          <View style={[styles.paceBadge, { backgroundColor: theme.border }]}>
            <Text style={[styles.paceText, { color: theme.text }]}>{item.pace} /km</Text>
          </View>
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

      {/* Tap to view proof image */}
      {item.imageUrl && (
        <TouchableOpacity
          style={[styles.viewProofBtn, { borderColor: theme.border }]}
          onPress={() => setViewImage(getProofImageUrl(item.imageUrl))}
        >
          <Ionicons name="image-outline" size={14} color={COLORS.PRIMARY_YELLOW} />
          <Text style={{ color: COLORS.PRIMARY_YELLOW, fontSize: 12, marginLeft: 4 }}>View Proof</Text>
        </TouchableOpacity>
      )}
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

      {(!isReady || loading) ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={sortedRuns}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No run history found.</Text>}
        />
      )}

      {/* Image Viewer Modal */}
      <Modal visible={!!viewImage} transparent animationType="fade">
        <TouchableOpacity style={styles.imageOverlay} activeOpacity={1} onPress={() => setViewImage(null)}>
          <TouchableOpacity activeOpacity={1} onPress={() => setViewImage(null)} style={styles.closeBtn}>
            <Ionicons name="close-circle" size={32} color="#fff" />
          </TouchableOpacity>
          {viewImage && <Image source={{ uri: viewImage }} style={styles.fullImage} contentFit="contain" cachePolicy="memory-disk" />}
        </TouchableOpacity>
      </Modal>
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
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  cardBody: { ...Layout.rowAround },
  statDetail: { alignItems: 'center' },
  statLabel: { ...Typography.captionSmall, color: COLORS.GRAY_400, marginBottom: 4, textTransform: 'uppercase' },
  statValue: { ...Typography.h4 },
  unit: { ...Typography.caption, fontWeight: 'normal' },
  verticalDivider: { ...Components.dividerVertical, height: 30, width: 1 },

  viewProofBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingVertical: 8, borderTopWidth: 0.5 },

  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.GRAY_400, ...Typography.bodyMedium },

  imageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullImage: { width: '90%', height: '70%' },
});
