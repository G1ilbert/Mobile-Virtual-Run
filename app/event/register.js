import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, Switch, useColorScheme, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import FormInput from '../../components/FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { getEventById, getEventPackages } from '../../utils/services/eventService';
import { createRegistration } from '../../utils/services/registrationService';
import { getProvinces, getDistricts, getSubDistricts } from '../../utils/services/geographyService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

// Picker modal for province/district/sub-district
function PickerModal({ visible, onClose, data, onSelect, title, loading }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
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
                  <Text style={[pickerStyles.itemText, { color: theme.text }]}>{item.nameTh}</Text>
                  {item.postalCode && <Text style={pickerStyles.postalCode}>{item.postalCode}</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={pickerStyles.empty}>ไม่มีข้อมูล</Text>}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function RegistrationForm() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { eventId, packageId } = useLocalSearchParams();
  const { userData } = useAuth();
  const { isReady } = useAuthGuard();

  // Data states
  const [event, setEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedPkgId, setSelectedPkgId] = useState(packageId ? Number(packageId) : null);
  const [itemVariants, setItemVariants] = useState({});
  const [isUsingProfile, setIsUsingProfile] = useState(false);

  // Address
  const [addressDetail, setAddressDetail] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Geography
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Picker modals
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showSubDistrictPicker, setShowSubDistrictPicker] = useState(false);

  // Load event + packages
  useEffect(() => {
    async function load() {
      try {
        const [ev, pkgs] = await Promise.all([
          getEventById(eventId),
          getEventPackages(eventId),
        ]);
        setEvent(ev);
        setPackages(pkgs);
      } catch (err) {
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลงานได้');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  // Load provinces once
  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); return; }
    setGeoLoading(true);
    setSelectedDistrict(null);
    setSelectedSubDistrict(null);
    setSubDistricts([]);
    getDistricts(selectedProvince.id)
      .then(setDistricts)
      .catch(console.error)
      .finally(() => setGeoLoading(false));
  }, [selectedProvince]);

  // Load sub-districts when district changes
  useEffect(() => {
    if (!selectedDistrict) { setSubDistricts([]); return; }
    setGeoLoading(true);
    setSelectedSubDistrict(null);
    getSubDistricts(selectedDistrict.id)
      .then(setSubDistricts)
      .catch(console.error)
      .finally(() => setGeoLoading(false));
  }, [selectedDistrict]);

  // Get currently selected package
  const selectedPkg = packages.find(p => p.id === selectedPkgId);

  // Handle "use profile data" toggle
  const handleUseProfile = (value) => {
    setIsUsingProfile(value);
    if (value && userData) {
      setReceiverName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim());
      setReceiverPhone(userData.phoneNumber || '');
      setAddressDetail(userData.addressDetail || '');
    } else {
      setReceiverName('');
      setReceiverPhone('');
      setAddressDetail('');
    }
  };

  // Handle variant selection for an item
  const handleVariantSelect = (itemId, variantId) => {
    setItemVariants(prev => ({ ...prev, [itemId]: variantId }));
  };

  // Validation
  const isFormValid = selectedPkgId && receiverName && receiverPhone && addressDetail;

  // Submit registration
  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    try {
      // Build itemVariants array from selected variants
      const variantsArr = Object.entries(itemVariants).map(([itemId, variantId]) => ({
        itemId: Number(itemId),
        itemVariantId: variantId ? Number(variantId) : undefined,
      }));

      // Build full address string
      const fullAddress = [
        receiverName,
        receiverPhone,
        addressDetail,
        selectedSubDistrict?.nameTh,
        selectedDistrict?.nameTh,
        selectedProvince?.nameTh,
        selectedSubDistrict?.postalCode,
      ].filter(Boolean).join(', ');

      const body = {
        packageId: selectedPkgId,
        addressDetail: fullAddress,
        subDistrictId: selectedSubDistrict?.id || undefined,
        itemVariants: variantsArr.length > 0 ? variantsArr : undefined,
      };

      const result = await createRegistration(body);
      router.replace({
        pathname: '/event/payment',
        params: { registrationId: result.id || result.data?.id },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'ไม่สามารถสมัครได้';
      Alert.alert('ผิดพลาด', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} />
      </View>
    );
  }

  if (!event) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <TopNavigationBack title="Register Event" onBack={() => router.back()} isDark={isDark} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Event Info */}
        <View style={[styles.eventInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
          <Text style={[Typography.caption, { color: COLORS.GRAY_400 }]}>
            {event.startDate ? new Date(event.startDate).toLocaleDateString('th-TH') : ''} - {event.endDate ? new Date(event.endDate).toLocaleDateString('th-TH') : ''}
          </Text>
        </View>

        {/* Package Selection */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Package</Text>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.pkgCard,
              {
                backgroundColor: theme.card,
                borderColor: selectedPkgId === pkg.id ? COLORS.PRIMARY_YELLOW : theme.border,
                borderWidth: selectedPkgId === pkg.id ? 2 : 1
              }
            ]}
            onPress={() => setSelectedPkgId(pkg.id)}
          >
            <Ionicons
              name={selectedPkgId === pkg.id ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={selectedPkgId === pkg.id ? COLORS.PRIMARY_YELLOW : theme.textSecondary}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.pkgName, { color: theme.text }]}>{pkg.name}</Text>
              <Text style={styles.pkgItems} numberOfLines={2}>
                {Number(pkg.targetDistance)}K
                {pkg.packageItems?.length > 0 && ` — ${pkg.packageItems.map(pi => pi.items?.name).filter(Boolean).join(', ')}`}
              </Text>
            </View>
            <Text style={styles.pkgPrice}>฿{Number(pkg.price).toLocaleString()}</Text>
          </TouchableOpacity>
        ))}

        {/* Item Variant Selection (e.g., shirt size) */}
        {selectedPkg?.packageItems?.filter(pi => pi.items?.itemVariants?.length > 0).map((pi) => (
          <View key={pi.itemId} style={{ marginTop: 15 }}>
            <Text style={[styles.variantLabel, { color: theme.text }]}>
              {pi.items.name} — เลือกตัวเลือก
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {pi.items.itemVariants.map((variant) => {
                const isSelected = itemVariants[pi.itemId] === variant.id;
                return (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.variantBtn,
                      {
                        backgroundColor: isSelected ? COLORS.PRIMARY_YELLOW : theme.card,
                        borderColor: isSelected ? COLORS.PRIMARY_YELLOW : theme.border,
                      }
                    ]}
                    onPress={() => handleVariantSelect(pi.itemId, variant.id)}
                  >
                    <Text style={{ color: isSelected ? COLORS.DARK_BG : theme.text, fontWeight: isSelected ? 'bold' : 'normal' }}>
                      {variant.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Shipping Address Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Shipping Address</Text>
          <View style={styles.profileToggle}>
            <Text style={{ fontSize: 12, color: theme.textTertiary, marginRight: 8 }}>Use Profile</Text>
            <Switch
              value={isUsingProfile}
              onValueChange={handleUseProfile}
              trackColor={{ false: theme.border, true: COLORS.PRIMARY_YELLOW }}
              thumbColor={Platform.OS === 'ios' ? undefined : (isUsingProfile ? COLORS.TEXT_DARK : theme.textSecondary)}
            />
          </View>
        </View>

        <FormInput
          label="Recipient Name"
          placeholder="ชื่อ-นามสกุลจริง"
          value={receiverName}
          onChangeText={setReceiverName}
          theme={theme}
        />

        <FormInput
          label="Phone Number"
          placeholder="08X-XXX-XXXX"
          keyboardType="phone-pad"
          value={receiverPhone}
          onChangeText={setReceiverPhone}
          theme={theme}
        />

        <FormInput
          label="Address Detail"
          placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
          multiline
          value={addressDetail}
          onChangeText={setAddressDetail}
          theme={theme}
        />

        {/* Geography Pickers */}
        <Text style={[styles.geoLabel, { color: COLORS.PRIMARY_YELLOW }]}>Province / จังหวัด</Text>
        <TouchableOpacity
          style={[styles.geoPicker, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowProvincePicker(true)}
        >
          <Text style={{ color: selectedProvince ? theme.text : COLORS.GRAY_400 }}>
            {selectedProvince?.nameTh || 'เลือกจังหวัด'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <Text style={[styles.geoLabel, { color: COLORS.PRIMARY_YELLOW }]}>District / อำเภอ</Text>
        <TouchableOpacity
          style={[styles.geoPicker, { backgroundColor: theme.card, borderColor: theme.border, opacity: selectedProvince ? 1 : 0.5 }]}
          onPress={() => selectedProvince && setShowDistrictPicker(true)}
          disabled={!selectedProvince}
        >
          <Text style={{ color: selectedDistrict ? theme.text : COLORS.GRAY_400 }}>
            {selectedDistrict?.nameTh || 'เลือกอำเภอ'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <Text style={[styles.geoLabel, { color: COLORS.PRIMARY_YELLOW }]}>Sub-District / ตำบล</Text>
        <TouchableOpacity
          style={[styles.geoPicker, { backgroundColor: theme.card, borderColor: theme.border, opacity: selectedDistrict ? 1 : 0.5 }]}
          onPress={() => selectedDistrict && setShowSubDistrictPicker(true)}
          disabled={!selectedDistrict}
        >
          <Text style={{ color: selectedSubDistrict ? theme.text : COLORS.GRAY_400 }}>
            {selectedSubDistrict ? `${selectedSubDistrict.nameTh} (${selectedSubDistrict.postalCode})` : 'เลือกตำบล'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Button */}
      <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.payButton, { opacity: isFormValid && !submitting ? 1 : 0.5 }]}
          disabled={!isFormValid || submitting}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.DARK_BG} />
          ) : (
            <>
              <Text style={styles.payButtonText}>PROCEED TO PAYMENT</Text>
              {selectedPkg && (
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>฿{Number(selectedPkg.price).toLocaleString()}</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Picker Modals */}
      <PickerModal
        visible={showProvincePicker}
        onClose={() => setShowProvincePicker(false)}
        data={provinces}
        onSelect={setSelectedProvince}
        title="เลือกจังหวัด"
        loading={false}
      />
      <PickerModal
        visible={showDistrictPicker}
        onClose={() => setShowDistrictPicker(false)}
        data={districts}
        onSelect={setSelectedDistrict}
        title="เลือกอำเภอ"
        loading={geoLoading}
      />
      <PickerModal
        visible={showSubDistrictPicker}
        onClose={() => setShowSubDistrictPicker(false)}
        data={subDistricts}
        onSelect={setSelectedSubDistrict}
        title="เลือกตำบล"
        loading={geoLoading}
      />
    </KeyboardAvoidingView>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { maxHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  item: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { fontSize: 16 },
  postalCode: { fontSize: 14, color: COLORS.GRAY_400 },
  empty: { textAlign: 'center', marginTop: 30, color: COLORS.GRAY_400 },
});

const styles = StyleSheet.create({
  scrollContent: { ...Layout.padding, paddingBottom: 140 },
  eventInfo: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  eventTitle: { ...Typography.bodyLarge, fontWeight: 'bold', marginBottom: 4 },
  sectionTitle: { ...Typography.sectionTitle, marginBottom: 15 },
  sectionHeader: { ...Layout.rowBetween, marginBottom: 15 },
  profileToggle: { ...Layout.rowCenter },
  divider: { ...Components.divider, marginVertical: 25 },
  pkgCard: { ...Layout.rowCenter, padding: 16, ...Components.cardSmall, borderWidth: 1, marginBottom: 12 },
  pkgName: { ...Typography.body, fontWeight: 'bold' },
  pkgItems: { ...Typography.caption, color: COLORS.GRAY_400, marginTop: 2 },
  pkgPrice: { ...Typography.bodyLarge, fontWeight: '900', color: COLORS.PRIMARY_YELLOW, marginLeft: 10 },
  variantLabel: { ...Typography.bodyMedium, fontWeight: 'bold' },
  variantBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 10,
  },
  geoLabel: { ...Typography.caption, fontWeight: 'bold', marginBottom: 6, marginTop: 12 },
  geoPicker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 4,
  },
  payButton: {
    backgroundColor: COLORS.PRIMARY_YELLOW,
    ...Components.buttonLarge,
    ...Layout.rowCenter,
    paddingHorizontal: 20
  },
  payButtonText: { color: COLORS.DARK_BG, ...Typography.button, flex: 1, textAlign: 'center' },
  priceBadge: { backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priceBadgeText: { color: COLORS.DARK_BG, ...Typography.bodyLarge, fontWeight: '900' }
});
