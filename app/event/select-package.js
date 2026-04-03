import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme,
  ActivityIndicator, Alert, Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getEventById, getEventPackages } from '../../utils/services/eventService';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'cart';

export default function SelectPackageScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const { isReady } = useAuthGuard();

  const [event, setEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [adding, setAdding] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [ev, pkgs] = await Promise.all([
          getEventById(eventId),
          getEventPackages(eventId),
        ]);
        setEvent(ev);
        setPackages(pkgs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (isReady) load();
  }, [eventId, isReady]);

  const selectedPkg = packages.find(p => p.id === selectedPkgId);

  const handleVariant = (itemId, variantId) => {
    setSelectedVariants(prev => ({ ...prev, [itemId]: variantId }));
  };

  const handleAddToCart = async () => {
    if (!selectedPkgId || !selectedPkg) return;

    setAdding(true);
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];

      // Check: 1 event = 1 package only
      const existing = cart.findIndex(c => c.eventId === Number(eventId));
      if (existing !== -1) {
        Alert.alert(
          'มีในตะกร้าแล้ว',
          'คุณมีแพ็คเกจของงานนี้ในตะกร้าแล้ว ต้องการเปลี่ยนหรือไม่?',
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'เปลี่ยน', onPress: async () => {
                cart[existing] = buildCartItem();
                await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
                showSuccess();
              }
            },
          ]
        );
        setAdding(false);
        return;
      }

      cart.push(buildCartItem());
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
      showSuccess();
    } catch (err) {
      Alert.alert('Error', 'ไม่สามารถเพิ่มลงตะกร้าได้');
    } finally {
      setAdding(false);
    }
  };

  const buildCartItem = () => ({
    eventId: Number(eventId),
    eventTitle: event?.title || '',
    packageId: selectedPkgId,
    packageName: selectedPkg?.name || '',
    price: Number(selectedPkg?.price || 0),
    targetDistance: Number(selectedPkg?.targetDistance || 0),
    selectedVariants,
    coverImage: event?.coverImage || '',
    items: (selectedPkg?.packageItems || []).map(pi => ({
      itemId: pi.itemId,
      itemName: pi.items?.name || '',
      variantId: selectedVariants[pi.itemId] || null,
      variantName: pi.items?.itemVariants?.find(v => v.id === selectedVariants[pi.itemId])?.name || null,
    })),
  });

  const showSuccess = () => {
    setShowCartModal(true);
  };

  if (!isReady || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopNavigationBack title="เลือกแพ็คเกจ" onBack={() => router.back()} isDark={isDark} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Event title */}
        <Text style={[Typography.bodyLarge, { color: theme.text, fontWeight: '700', marginBottom: 16 }]}>
          {event?.title}
        </Text>

        {/* Package list — radio style */}
        {packages.map((pkg) => {
          const isSelected = selectedPkgId === pkg.id;
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.pkgCard,
                {
                  backgroundColor: theme.card,
                  borderColor: isSelected ? COLORS.PRIMARY_YELLOW : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                }
              ]}
              onPress={() => { setSelectedPkgId(pkg.id); setSelectedVariants({}); }}
              activeOpacity={0.7}
            >
              <View style={styles.pkgHeader}>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isSelected ? COLORS.PRIMARY_YELLOW : theme.textSecondary}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[Typography.body, { color: theme.text, fontWeight: 'bold' }]}>{pkg.name}</Text>
                  <Text style={[Typography.caption, { color: COLORS.GRAY_400, marginTop: 2 }]}>
                    {Number(pkg.targetDistance)}K
                  </Text>
                </View>
                <Text style={{ color: COLORS.PRIMARY_YELLOW, fontWeight: '900', fontSize: 16 }}>
                  ฿{Number(pkg.price).toLocaleString()}
                </Text>
              </View>

              {/* Items in package */}
              {pkg.packageItems?.length > 0 && (
                <View style={styles.itemsList}>
                  {pkg.packageItems.map((pi) => (
                    <View key={pi.itemId} style={styles.itemRow}>
                      <Ionicons name="gift-outline" size={14} color={COLORS.GRAY_400} />
                      <Text style={[Typography.caption, { color: theme.textSecondary, marginLeft: 6 }]}>
                        {pi.items?.name || 'Item'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Variant selectors — only for selected package */}
              {isSelected && pkg.packageItems?.filter(pi => pi.items?.itemVariants?.length > 0).map((pi) => (
                <View key={`variant-${pi.itemId}`} style={styles.variantSection}>
                  <Text style={[Typography.caption, { color: COLORS.PRIMARY_YELLOW, fontWeight: '700', marginBottom: 8 }]}>
                    เลือก {pi.items.name}
                  </Text>
                  <View style={styles.variantRow}>
                    {pi.items.itemVariants.map((v) => {
                      const vSelected = selectedVariants[pi.itemId] === v.id;
                      return (
                        <TouchableOpacity
                          key={v.id}
                          style={[
                            styles.variantChip,
                            {
                              backgroundColor: vSelected ? COLORS.PRIMARY_YELLOW : theme.card,
                              borderColor: vSelected ? COLORS.PRIMARY_YELLOW : theme.border,
                            }
                          ]}
                          onPress={() => handleVariant(pi.itemId, v.id)}
                        >
                          <Text style={{ color: vSelected ? COLORS.DARK_BG : theme.text, fontWeight: vSelected ? '700' : '400', fontSize: 13 }}>
                            {v.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom button */}
      <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.addBtn, { opacity: selectedPkgId && !adding ? 1 : 0.5 }]}
          disabled={!selectedPkgId || adding}
          onPress={handleAddToCart}
        >
          {adding ? (
            <ActivityIndicator color={COLORS.DARK_BG} />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color={COLORS.DARK_BG} style={{ marginRight: 8 }} />
              <Text style={styles.addBtnText}>เพิ่มลงตะกร้า</Text>
              {selectedPkg && (
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>฿{Number(selectedPkg.price).toLocaleString()}</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Cart success modal */}
      <Modal visible={showCartModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark" size={36} color={COLORS.DARK_BG} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>เพิ่มลงตะกร้าแล้ว!</Text>
            <Text style={{ color: COLORS.GRAY_400, fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
              {selectedPkg?.name} — {event?.title}
            </Text>
            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={() => { setShowCartModal(false); router.push('/(common)/cart'); }}
            >
              <Ionicons name="bag-handle-outline" size={18} color={COLORS.DARK_BG} style={{ marginRight: 6 }} />
              <Text style={{ color: COLORS.DARK_BG, fontWeight: '700', fontSize: 16 }}>ไปที่ตะกร้า</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtnSecondary, { borderColor: theme.border }]}
              onPress={() => { setShowCartModal(false); router.back(); }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 15 }}>เลือกดูงานวิ่งต่อ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { ...Layout.padding, paddingBottom: 140 },
  pkgCard: { borderRadius: 16, padding: 16, marginBottom: 14 },
  pkgHeader: { flexDirection: 'row', alignItems: 'center' },
  itemsList: { marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(150,150,150,0.2)' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  variantSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(150,150,150,0.2)' },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  addBtn: {
    backgroundColor: COLORS.PRIMARY_YELLOW,
    ...Components.buttonLarge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: COLORS.DARK_BG, fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  priceBadge: { backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priceBadgeText: { color: COLORS.DARK_BG, fontSize: 15, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { borderRadius: 20, padding: 24, width: '90%', alignItems: 'center' },
  modalIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.PRIMARY_YELLOW, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalBtnPrimary: { backgroundColor: COLORS.PRIMARY_YELLOW, padding: 14, borderRadius: 12, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  modalBtnSecondary: { padding: 14, borderRadius: 12, width: '100%', alignItems: 'center', borderWidth: 1 },
});
