import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, getMyProfile } from '../../utils/services/userService';
import { getProvinces, getDistricts, getSubDistricts } from '../../utils/services/geographyService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

function PickerModal({ visible, onClose, data, onSelect, title, loading, theme }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={pickerStyles.overlay}>
        <View style={[pickerStyles.container, { backgroundColor: theme.background }]}>
          <View style={[pickerStyles.header, { borderBottomColor: theme.border }]}>
            <Text style={[pickerStyles.title, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.PRIMARY_YELLOW} />
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[pickerStyles.item, { borderBottomColor: theme.border }]}
                  onPress={() => { onSelect(item); onClose(); }}
                >
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

export default function EditProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { userData, refreshUserData } = useAuth();
  const { isReady } = useAuthGuard();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [geoInitialized, setGeoInitialized] = useState(false);

  // Geography
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

  // Pre-fill form — fetch fresh data from API, fallback to context
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getMyProfile();
        const p = profile.user || profile;
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phoneNumber || '',
          address: p.addressDetail || '',
        });
        // Pre-select geography from nested API response
        if (p.subDistricts) {
          const sub = p.subDistricts;
          const dist = sub.districts;
          const prov = dist?.provinces;
          if (prov) setSelectedProvince({ id: prov.id, nameTh: prov.nameTh });
          if (dist) setSelectedDistrict({ id: dist.id, nameTh: dist.nameTh });
          setSelectedSubDistrict({ id: sub.id, nameTh: sub.nameTh, postalCode: sub.postalCode });
        }
      } catch {
        // Fallback to context
        if (userData) {
          setForm({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phoneNumber || '',
            address: userData.addressDetail || '',
          });
          if (userData.subDistricts) {
            const sub = userData.subDistricts;
            const dist = sub.districts;
            const prov = dist?.provinces;
            if (prov) setSelectedProvince({ id: prov.id, nameTh: prov.nameTh });
            if (dist) setSelectedDistrict({ id: dist.id, nameTh: dist.nameTh });
            setSelectedSubDistrict({ id: sub.id, nameTh: sub.nameTh, postalCode: sub.postalCode });
          }
        }
      }
    }
    loadProfile();
  }, []);

  // Load provinces
  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  // Load districts when province changes (skip reset on initial pre-fill)
  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); return; }
    setGeoLoading(true);
    if (geoInitialized) {
      setSelectedDistrict(null);
      setSelectedSubDistrict(null);
      setSubDistricts([]);
    }
    getDistricts(selectedProvince.id).then(setDistricts).catch(console.error).finally(() => setGeoLoading(false));
  }, [selectedProvince]);

  // Load sub-districts when district changes (skip reset on initial pre-fill)
  useEffect(() => {
    if (!selectedDistrict) { setSubDistricts([]); return; }
    setGeoLoading(true);
    if (geoInitialized) {
      setSelectedSubDistrict(null);
    } else {
      setGeoInitialized(true); // After first load completes, enable cascade resets
    }
    getSubDistricts(selectedDistrict.id).then(setSubDistricts).catch(console.error).finally(() => setGeoLoading(false));
  }, [selectedDistrict]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phoneNumber: form.phone || undefined,
        addressDetail: form.address || undefined,
        subDistrictId: selectedSubDistrict?.id || undefined,
      });
      await refreshUserData();
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลแล้ว', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกได้');
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <TopNavigationBack title="แก้ไขข้อมูลส่วนตัว" onBack={() => router.back()} isDark={isDark} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* Personal Info Card */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>ข้อมูลส่วนตัว</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <InputGroup label="ชื่อ" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} theme={theme} placeholder="ชื่อจริง" />
            <InputGroup label="นามสกุล" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} theme={theme} placeholder="นามสกุล" />
            <InputGroup label="เบอร์โทร" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} theme={theme} keyboardType="phone-pad" placeholder="08X-XXX-XXXX" isLast />
          </View>

          {/* Address Card */}
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>ที่อยู่จัดส่ง</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.inputBox}>
              <Text style={styles.label}>ที่อยู่</Text>
              <TextInput
                style={[styles.input, { color: theme.text, height: 70, textAlignVertical: 'top' }]}
                value={form.address}
                multiline
                onChangeText={(v) => setForm({ ...form, address: v })}
                placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            {/* Province */}
            <View style={[styles.inputBox, { borderTopWidth: 0.5, borderTopColor: theme.border }]}>
              <Text style={styles.label}>จังหวัด</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowProvince(true)}>
                <Text style={{ color: selectedProvince ? theme.text : COLORS.GRAY_400, fontSize: 16 }}>
                  {selectedProvince?.nameTh || 'เลือกจังหวัด'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            </View>

            {/* District */}
            <View style={[styles.inputBox, { borderTopWidth: 0.5, borderTopColor: theme.border }]}>
              <Text style={styles.label}>อำเภอ/เขต</Text>
              <TouchableOpacity
                style={[styles.pickerBtn, { opacity: selectedProvince ? 1 : 0.4 }]}
                onPress={() => selectedProvince && setShowDistrict(true)}
                disabled={!selectedProvince}
              >
                <Text style={{ color: selectedDistrict ? theme.text : COLORS.GRAY_400, fontSize: 16 }}>
                  {selectedDistrict?.nameTh || 'เลือกอำเภอ'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            </View>

            {/* Sub-district */}
            <View style={[styles.inputBox, { borderTopWidth: 0.5, borderTopColor: theme.border }]}>
              <Text style={styles.label}>ตำบล/แขวง</Text>
              <TouchableOpacity
                style={[styles.pickerBtn, { opacity: selectedDistrict ? 1 : 0.4 }]}
                onPress={() => selectedDistrict && setShowSubDistrict(true)}
                disabled={!selectedDistrict}
              >
                <Text style={{ color: selectedSubDistrict ? theme.text : COLORS.GRAY_400, fontSize: 16 }}>
                  {selectedSubDistrict ? `${selectedSubDistrict.nameTh} (${selectedSubDistrict.postalCode})` : 'เลือกตำบล'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={[styles.saveBtn, { opacity: saving ? 0.6 : 1 }]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={COLORS.DARK_BG} />
            ) : (
              <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Modals */}
      <PickerModal visible={showProvince} onClose={() => setShowProvince(false)} data={provinces} onSelect={setSelectedProvince} title="เลือกจังหวัด" loading={false} theme={theme} />
      <PickerModal visible={showDistrict} onClose={() => setShowDistrict(false)} data={districts} onSelect={setSelectedDistrict} title="เลือกอำเภอ" loading={geoLoading} theme={theme} />
      <PickerModal visible={showSubDistrict} onClose={() => setShowSubDistrict(false)} data={subDistricts} onSelect={setSelectedSubDistrict} title="เลือกตำบล" loading={geoLoading} theme={theme} />
    </SafeAreaView>
  );
}

const InputGroup = ({ label, value, onChange, theme, keyboardType = 'default', placeholder = '', isLast = false }) => (
  <View style={[styles.inputBox, !isLast && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, { color: theme.text }]}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.textTertiary}
    />
  </View>
);

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { maxHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  item: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, flexDirection: 'row', justifyContent: 'space-between' },
});

const styles = StyleSheet.create({
  container: { ...Layout.padding, paddingBottom: 40 },
  sectionTitle: { ...Typography.bodyLarge, fontWeight: '700', marginBottom: 12 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  inputBox: { paddingHorizontal: 20, paddingVertical: 14 },
  label: { ...Typography.caption, color: COLORS.PRIMARY_YELLOW, fontWeight: 'bold', marginBottom: 4 },
  input: { ...Typography.bodyLarge, paddingVertical: 4 },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  saveBtn: {
    backgroundColor: COLORS.PRIMARY_YELLOW,
    ...Components.buttonLarge,
    marginTop: 30,
  },
  saveBtnText: { ...Typography.buttonLarge, color: COLORS.DARK_BG, fontWeight: 'bold' },
});
