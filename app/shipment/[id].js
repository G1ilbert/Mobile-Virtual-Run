import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import ShipmentProgress from '../../components/ShipmentProgress';
import { getShipmentById, confirmDelivery } from '../../utils/services/shipmentService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

export default function ShipmentDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isReady } = useAuthGuard();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const loadShipment = async () => {
    try {
      const data = await getShipmentById(id);
      setShipment(data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Cannot load shipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadShipment(); }, [id]);

  const handleConfirmDelivery = () => {
    Alert.alert(
      'Confirm Delivery',
      'Have you received all items?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Received', onPress: async () => {
            setConfirming(true);
            try {
              await confirmDelivery(id);
              await loadShipment();
              Alert.alert('Success', 'Delivery confirmed!');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Cannot confirm');
            } finally {
              setConfirming(false);
            }
          }
        }
      ]
    );
  };

  if (!isReady || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} />
      </View>
    );
  }

  if (!shipment) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <TopNavigationBack title="Shipment" onBack={() => router.back()} isDark={isDark} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.GRAY_400 }}>Shipment not found</Text>
        </View>
      </View>
    );
  }

  const event = shipment.registrations?.packages?.events;
  const items = shipment.shipmentItems || [];
  const staff = shipment.shipmentStaff;
  const tracking = staff?.trackingNumber;
  const carrier = staff?.carrier;
  const isShipped = ['shipped', 'delivered'].includes(shipment.status);
  const isDelivered = shipment.status === 'delivered';

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopNavigationBack title="Delivery Status" onBack={() => router.back()} isDark={isDark} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event name */}
        {event && (
          <Text style={[styles.eventName, { color: theme.text }]}>{event.title}</Text>
        )}

        {/* Progress */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ShipmentProgress status={shipment.status} theme={theme} />
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: COLORS.PRIMARY_YELLOW }]}>
              {getStatusLabel(shipment.status)}
            </Text>
            <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>
              {shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleDateString('th-TH') : ''}
            </Text>
          </View>
        </View>

        {/* Tracking info */}
        {isShipped && (tracking || carrier) && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardTitle}>
              <Ionicons name="locate-outline" size={18} color={COLORS.PRIMARY_YELLOW} />
              <Text style={[styles.cardTitleText, { color: theme.text }]}>Tracking Info</Text>
            </View>
            {carrier && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Carrier</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{carrier}</Text>
              </View>
            )}
            {tracking && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tracking #</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{tracking}</Text>
              </View>
            )}
            {staff?.shippedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shipped</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {new Date(staff.shippedAt).toLocaleDateString('th-TH')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Items */}
        {items.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardTitle}>
              <Ionicons name="cube-outline" size={18} color={COLORS.PRIMARY_YELLOW} />
              <Text style={[styles.cardTitleText, { color: theme.text }]}>Items</Text>
            </View>
            {items.map((si, idx) => (
              <View key={idx} style={[styles.itemRow, idx < items.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[{ color: theme.text, fontWeight: '600' }]}>
                    {si.items?.name || 'Item'}
                  </Text>
                  {si.itemVariants?.name && (
                    <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>
                      {si.itemVariants.name}
                    </Text>
                  )}
                </View>
                <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>x{si.quantity || 1}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Delivered confirmation */}
        {isDelivered && (
          <View style={[styles.deliveredBox, { backgroundColor: isDark ? '#1B3A1B' : '#E8F5E9' }]}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.SUCCESS} />
            <Text style={{ color: COLORS.SUCCESS, fontWeight: '700', marginLeft: 8, fontSize: 15 }}>
              Delivered
            </Text>
            {staff?.confirmedAt && (
              <Text style={{ color: COLORS.SUCCESS, fontSize: 12, marginLeft: 'auto' }}>
                {new Date(staff.confirmedAt).toLocaleDateString('th-TH')}
              </Text>
            )}
          </View>
        )}

        {/* Confirm button for shipped */}
        {shipment.status === 'shipped' && (
          <TouchableOpacity
            style={[styles.confirmBtn, { opacity: confirming ? 0.6 : 1 }]}
            onPress={handleConfirmDelivery}
            disabled={confirming}
          >
            {confirming ? (
              <ActivityIndicator color={COLORS.DARK_BG} />
            ) : (
              <Text style={styles.confirmBtnText}>CONFIRM DELIVERY</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function getStatusLabel(status) {
  const map = {
    preparing: 'Preparing your items...',
    print_label: 'Printing shipping label',
    ready_to_ship: 'Ready to ship',
    shipped: 'On the way!',
    delivered: 'Delivered',
  };
  return map[status] || status;
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  eventName: { ...Typography.h3, fontWeight: 'bold', marginBottom: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  statusLabel: { fontWeight: '700', fontSize: 14 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardTitleText: { fontWeight: '700', fontSize: 15, marginLeft: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { color: COLORS.GRAY_400, fontSize: 13 },
  infoValue: { fontWeight: '600', fontSize: 13 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  deliveredBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14 },
  confirmBtn: { backgroundColor: COLORS.PRIMARY_YELLOW, ...Components.buttonLarge, marginTop: 10 },
  confirmBtnText: { ...Typography.buttonLarge, color: COLORS.DARK_BG, fontWeight: 'bold' },
});
