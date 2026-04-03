import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';
import FormInput from '../../components/FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { getMyProfile } from '../../utils/services/userService';
import { createRegistration } from '../../utils/services/registrationService';
import { getProvinces, getDistricts, getSubDistricts } from '../../utils/services/geographyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'cart';

function PickerModal({ visible, onClose, data, onSelect, title, loading, theme }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={pickerStyles.overlay}>
        <View style={[pickerStyles.container, { backgroundColor: theme.background }]}>
          <View style={[pickerStyles.header, { borderBottomColor: theme.border }]}>
            <Text style={[pickerStyles.title, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.PRIMARY_YELLOW} />
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={[pickerStyles.item, { borderBottomColor: theme.border }]} onPress={() => { onSelect(item); onClose(); }}>
                  <Text style={{ color: theme.text, fontSize: 15 }}>{item.nameTh}</Text>
                  {item.postalCode && <Text style={{ color: COLORS.GRAY_400, fontSize: 13 }}>{item.postalCode}</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: COLORS.GRAY_400 }}>ไม่มีข้อมูล</Text>}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function CheckoutScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isReady } = useAuthGuard();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [addressMode, setAddressMode] = useState('profile'); // 'profile' | 'custom'

  // Custom address form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  // Geography for custom mode
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showProvince, setShowProvince] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const [showSubDistrict, setShowSubDistrict] = useState(false);

  // Load cart
  useFocusEffect(useCallback(() => { loadCart(); loadProfile(); }, []));

  useEffect(() => { getProvinces().then(setProvinces).catch(console.error); }, []);
  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); return; }
    setGeoLoading(true); setSelectedDistrict(null); setSelectedSubDistrict(null); setSubDistricts([]);
    getDistricts(selectedProvince.id).then(setDistricts).catch(console.error).finally(() => setGeoLoading(false));
  }, [selectedProvince]);
  useEffect(() => {
    if (!selectedDistrict) { setSubDistricts([]); return; }
    setGeoLoading(true); setSelectedSubDistrict(null);
    getSubDistricts(selectedDistrict.id).then(setSubDistricts).catch(console.error).finally(() => setGeoLoading(false));
  }, [selectedDistrict]);

  const loadCart = async () => {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      setCart(raw ? JSON.parse(raw) : []);
    } catch { setCart([]); }
    finally { setLoading(false); }
  };

  const loadProfile = async () => {
    try {
      const p = await getMyProfile();
      const profile = p.user || p;
      setProfileData(profile);
      // Pre-fill custom form too
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phoneNumber || '');
      setAddressDetail(profile.addressDetail || '');
    } catch { /* no profile data */ }
  };

  const totalPrice = cart.reduce((sum, c) => sum + (c.price || 0), 0);

  const getAddress = () => {
    if (addressMode === 'profile' && profileData) {
      return {
        fullAddress: [
          `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
          profileData.phoneNumber,
          profileData.addressDetail,
          profileData.subDistricts?.nameTh,
          profileData.subDistricts?.districts?.nameTh,
          profileData.subDistricts?.districts?.provinces?.nameTh,
          profileData.subDistricts?.postalCode,
        ].filter(Boolean).join(', '),
        subDistrictId: profileData.subDistrictId || undefined,
      };
    }
    return {
      fullAddress: [
        `${firstName} ${lastName}`.trim(), phone, addressDetail,
        selectedSubDistrict?.nameTh, selectedDistrict?.nameTh,
        selectedProvince?.nameTh, selectedSubDistrict?.postalCode,
      ].filter(Boolean).join(', '),
      subDistrictId: selectedSubDistrict?.id || undefined,
    };
  };

  const handleCheckout = async () => {
    const addr = getAddress();
    if (!addr.fullAddress || addr.fullAddress.length < 5) {
      Alert.alert('กรุณากรอกที่อยู่', 'กรุณาเพิ่มที่อยู่ในโปรไฟล์ หรือกรอกที่อยู่เอง');
      return;
    }
    if (cart.length === 0) return;

    setSubmitting(true);
    const results = [];
    const errors = [];

    for (const item of cart) {
      try {
        const itemVariants = (item.items || []).filter(i => i.variantId).map(i => ({ itemId: i.itemId, itemVariantId: i.variantId }));
        const body = {
          packageId: item.packageId,
          addressDetail: addr.fullAddress,
          subDistrictId: addr.subDistrictId,
          itemVariants: itemVariants.length > 0 ? itemVariants : undefined,
        };
        const reg = await createRegistration(body);
        results.push({ ...item, registrationId: reg.id || reg.data?.id });
      } catch (err) {
        errors.push(`${item.eventTitle}: ${err.response?.data?.message || 'สมัครไม่สำเร็จ'}`);
      }
    }

    await AsyncStorage.setItem(CART_KEY, JSON.stringify([]));
    setCart([]);
    setSubmitting(false);

    if (errors.length > 0 && results.length === 0) {
      Alert.alert('สมัครไม่สำเร็จ', errors.join('\n'));
      return;
    }
    if (errors.length > 0) {
      Alert.alert(`สำเร็จ ${results.length}/${results.length + errors.length}`, errors.join('\n'), [
        { text: 'OK', onPress: () => navigateAfter(results) },
      ]);
    } else {
      navigateAfter(results);
    }
  };

  const navigateAfter = (results) => {
    if (results.length === 1) {
      router.replace({ pathname: '/event/payment', params: { registrationId: results[0].registrationId } });
    } else {
      Alert.alert('สมัครสำเร็จ', `สมัคร ${results.length} รายการ\nไปชำระเงินที่หน้า "งานวิ่ง"`, [
        { text: 'ไปเลย', onPress: () => { router.dismissAll(); router.replace('/(tabs)/run'); } },
      ]);
    }
  };

  if (!isReady || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} />
      </View>
    );
  }

  const hasProfileAddress = profileData && (profileData.addressDetail || profileData.firstName);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopNavigationBack title="กรอกข้อมูลจัดส่ง" onBack={() => router.back()} isDark={isDark} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Address section */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>ที่อยู่จัดส่ง</Text>

          {/* Profile address card — read only */}
          {addressMode === 'profile' && hasProfileAddress && (
            <View style={[styles.addressCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.addressBadge, { backgroundColor: COLORS.PRIMARY_YELLOW + '20' }]}>
                <Ionicons name="person-circle" size={14} color={COLORS.PRIMARY_YELLOW} />
                <Text style={{ color: COLORS.PRIMARY_YELLOW, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>จากโปรไฟล์</Text>
              </View>
              <Text style={[styles.addressName, { color: theme.text }]}>
                {`${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'ไม่ระบุชื่อ'}
              </Text>
              <Text style={{ color: COLORS.GRAY_400, fontSize: 13, marginBottom: 6 }}>
                {profileData.phoneNumber || 'ยังไม่ระบุเบอร์โทร'}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20 }}>
                {[
                  profileData.addressDetail,
                  profileData.subDistricts?.nameTh ? `ต.${profileData.subDistricts.nameTh}` : null,
                  profileData.subDistricts?.districts?.nameTh ? `อ.${profileData.subDistricts.districts.nameTh}` : null,
                  profileData.subDistricts?.districts?.provinces?.nameTh ? `จ.${profileData.subDistricts.districts.provinces.nameTh}` : null,
                  profileData.subDistricts?.postalCode,
                ].filter(Boolean).join(' ') || 'ยังไม่ระบุที่อยู่'}
              </Text>
            </View>
          )}

          {addressMode === 'profile' && !hasProfileAddress && (
            <View style={[styles.warningBox, { backgroundColor: isDark ? '#332800' : '#FFF8E1' }]}>
              <Ionicons name="warning-outline" size={18} color="#ff6f00" />
              <Text style={{ color: '#ff6f00', fontSize: 13, marginLeft: 8, flex: 1 }}>
                กรุณากรอกที่อยู่ในโปรไฟล์ก่อน หรือกด "แก้ไขเอง" ด้านล่าง
              </Text>
            </View>
          )}

          {/* Toggle buttons */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, { borderColor: COLORS.PRIMARY_YELLOW, backgroundColor: addressMode === 'profile' ? COLORS.PRIMARY_YELLOW + '15' : 'transparent' }]}
              onPress={() => { setAddressMode('profile'); loadProfile(); }}
            >
              <Ionicons name="person-circle-outline" size={16} color={COLORS.PRIMARY_YELLOW} />
              <Text style={{ color: COLORS.PRIMARY_YELLOW, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                {hasProfileAddress ? 'ที่อยู่โปรไฟล์' : 'แก้ไขที่โปรไฟล์'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, { borderColor: addressMode === 'custom' ? COLORS.PRIMARY_YELLOW : theme.border, backgroundColor: addressMode === 'custom' ? COLORS.PRIMARY_YELLOW + '15' : 'transparent' }]}
              onPress={() => setAddressMode(addressMode === 'custom' ? 'profile' : 'custom')}
            >
              <Ionicons name="create-outline" size={16} color={addressMode === 'custom' ? COLORS.PRIMARY_YELLOW : COLORS.GRAY_400} />
              <Text style={{ color: addressMode === 'custom' ? COLORS.PRIMARY_YELLOW : COLORS.GRAY_400, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>แก้ไขเอง</Text>
            </TouchableOpacity>
          </View>

          {/* If profile mode but no address, offer to go edit */}
          {addressMode === 'profile' && !hasProfileAddress && (
            <TouchableOpacity
              style={[styles.goEditBtn, { borderColor: COLORS.PRIMARY_YELLOW }]}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons name="person-add-outline" size={18} color={COLORS.PRIMARY_YELLOW} />
              <Text style={{ color: COLORS.PRIMARY_YELLOW, fontWeight: '700', marginLeft: 8, fontSize: 14 }}>ไปกรอกข้อมูลโปรไฟล์</Text>
            </TouchableOpacity>
          )}

          {/* Custom address form */}
          {addressMode === 'custom' && (
            <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <FormInput label="ชื่อ" placeholder="ชื่อจริง" value={firstName} onChangeText={setFirstName} theme={theme} />
              <FormInput label="นามสกุล" placeholder="นามสกุล" value={lastName} onChangeText={setLastName} theme={theme} />
              <FormInput label="เบอร์โทร" placeholder="08X-XXX-XXXX" value={phone} onChangeText={setPhone} theme={theme} keyboardType="phone-pad" />
              <FormInput label="ที่อยู่" placeholder="บ้านเลขที่, หมู่, ซอย, ถนน" value={addressDetail} onChangeText={setAddressDetail} theme={theme} multiline />

              <Text style={[styles.geoLabel, { color: COLORS.PRIMARY_YELLOW }]}>จังหวัด</Text>
              <TouchableOpacity style={[styles.geoPicker, { backgroundColor: theme.background, borderColor: theme.border }]} onPress={() => setShowProvince(true)}>
                <Text style={{ color: selectedProvince ? theme.text : COLORS.GRAY_400, fontSize: 15 }}>{selectedProvince?.nameTh || 'เลือกจังหวัด'}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>

              <Text style={[styles.geoLabel, { color: COLORS.PRIMARY_YELLOW }]}>อำเภอ/เขต</Text>
              <TouchableOpacity style={[styles.geoPicker, { backgroundColor: theme.background, borderColor: theme.border, opacity: selectedProvince ? 1 : 0.4 }]} onPress={() => selectedProvince && setShowDistrict(true)} disabled={!selectedProvince}>
                <Text style={{ color: selectedDistrict ? theme.text : COLORS.GRAY_400, fontSize: 15 }}>{selectedDistrict?.nameTh || 'เลือกอำเภอ'}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>

              <Text style={[styles.geoLabel, { color: COLORS.PRIMARY_YELLOW }]}>ตำบล/แขวง</Text>
              <TouchableOpacity style={[styles.geoPicker, { backgroundColor: theme.background, borderColor: theme.border, opacity: selectedDistrict ? 1 : 0.4 }]} onPress={() => selectedDistrict && setShowSubDistrict(true)} disabled={!selectedDistrict}>
                <Text style={{ color: selectedSubDistrict ? theme.text : COLORS.GRAY_400, fontSize: 15 }}>{selectedSubDistrict ? `${selectedSubDistrict.nameTh} (${selectedSubDistrict.postalCode})` : 'เลือกตำบล'}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            </View>
          )}

          {/* Order summary */}
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>สรุปรายการ</Text>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {cart.map((item, i) => (
              <View key={i} style={[styles.summaryRow, i < cart.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{item.eventTitle}</Text>
                  <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>{item.packageName}</Text>
                </View>
                <Text style={{ color: COLORS.PRIMARY_YELLOW, fontWeight: '900', fontSize: 15 }}>฿{(item.price || 0).toLocaleString()}</Text>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>รวมทั้งหมด</Text>
              <Text style={{ color: COLORS.PRIMARY_YELLOW, fontWeight: '900', fontSize: 20 }}>฿{totalPrice.toLocaleString()}</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.checkoutBtn, { opacity: submitting ? 0.6 : 1 }]}
          onPress={handleCheckout}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.DARK_BG} />
          ) : (
            <Text style={styles.checkoutText}>ยืนยันการสมัคร (฿{totalPrice.toLocaleString()})</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Picker Modals */}
      <PickerModal visible={showProvince} onClose={() => setShowProvince(false)} data={provinces} onSelect={setSelectedProvince} title="เลือกจังหวัด" loading={false} theme={theme} />
      <PickerModal visible={showDistrict} onClose={() => setShowDistrict(false)} data={districts} onSelect={setSelectedDistrict} title="เลือกอำเภอ" loading={geoLoading} theme={theme} />
      <PickerModal visible={showSubDistrict} onClose={() => setShowSubDistrict(false)} data={subDistricts} onSelect={setSelectedSubDistrict} title="เลือกตำบล" loading={geoLoading} theme={theme} />
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { maxHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  item: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, flexDirection: 'row', justifyContent: 'space-between' },
});

const styles = StyleSheet.create({
  scroll: { ...Layout.padding, paddingBottom: 140 },
  sectionTitle: { ...Typography.bodyLarge, fontWeight: '700', marginBottom: 10 },
  addressCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10 },
  addressBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  addressName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  warningBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, borderWidth: 1 },
  goEditBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', marginBottom: 16 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10 },
  geoLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, marginTop: 10 },
  geoPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4, borderTopWidth: 1 },
  checkoutBtn: { backgroundColor: COLORS.PRIMARY_YELLOW, ...Components.buttonLarge },
  checkoutText: { color: COLORS.DARK_BG, fontSize: 16, fontWeight: '700' },
});
