import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme,
  ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'cart';
const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';

function getImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/80x80/333/666?text=E';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

export default function CartScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      setCart(raw ? JSON.parse(raw) : []);
    } catch { setCart([]); }
    finally { setLoading(false); }
  };

  const saveCart = async (newCart) => {
    setCart(newCart);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(newCart));
  };

  const removeItem = (eventId) => {
    Alert.alert('ลบรายการ', 'ต้องการลบรายการนี้ออกจากตะกร้า?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => saveCart(cart.filter(c => c.eventId !== eventId)) },
    ]);
  };

  const totalPrice = cart.reduce((sum, c) => sum + (c.price || 0), 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push({ pathname: '/login', params: { redirect: '/(common)/cart' } });
      return;
    }
    if (cart.length === 0) return;
    router.push('/(common)/checkout');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Image source={{ uri: getImageUrl(item.coverImage) }} style={styles.eventImg} />
      <View style={styles.cardContent}>
        <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>{item.eventTitle}</Text>
        <Text style={[styles.pkgName, { color: COLORS.GRAY_400 }]}>{item.packageName} — {item.targetDistance || 0}K</Text>
        {item.items?.filter(i => i.variantName).map((i, idx) => (
          <Text key={idx} style={{ color: COLORS.GRAY_500, fontSize: 11 }}>{i.itemName}: {i.variantName}</Text>
        ))}
        <Text style={styles.price}>฿{(item.price || 0).toLocaleString()}</Text>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.eventId)} style={styles.removeBtn}>
        <Ionicons name="close-circle" size={22} color={COLORS.ERROR} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopNavigationBack title="ตะกร้า" onBack={() => router.back()} isDark={isDark} />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 80 }} />
      ) : cart.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Ionicons name="bag-outline" size={60} color={theme.border} />
          <Text style={{ color: theme.textSecondary, fontSize: 16, marginTop: 12 }}>ตะกร้าว่างเปล่า</Text>
          <Text style={{ color: COLORS.GRAY_400, fontSize: 13, marginTop: 4 }}>เลือกงานวิ่งที่ชอบแล้วเพิ่มลงตะกร้า</Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: COLORS.PRIMARY_YELLOW, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 }}
            onPress={() => { router.dismissAll(); router.replace('/(tabs)'); }}
          >
            <Text style={{ color: COLORS.DARK_BG, fontWeight: '700', fontSize: 15 }}>ค้นหางานวิ่ง</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={item => String(item.eventId)}
            contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Footer */}
          <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            <View style={styles.footerRow}>
              <View>
                <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>รวมทั้งหมด ({cart.length} รายการ)</Text>
                <Text style={{ color: COLORS.PRIMARY_YELLOW, fontSize: 22, fontWeight: '900' }}>
                  ฿{totalPrice.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutText}>ดำเนินการสมัคร</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  eventImg: { width: 70, height: 70, borderRadius: 12 },
  cardContent: { flex: 1, marginLeft: 14 },
  eventTitle: { fontSize: 15, fontWeight: '700' },
  pkgName: { fontSize: 12, marginTop: 2 },
  price: { color: COLORS.PRIMARY_YELLOW, fontWeight: '900', fontSize: 15, marginTop: 4 },
  removeBtn: { padding: 6 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkoutBtn: {
    backgroundColor: COLORS.PRIMARY_YELLOW,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  checkoutText: {
    color: COLORS.DARK_BG,
    fontWeight: '700',
    fontSize: 15,
  },
});
