import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
  KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import FormInput from '../../components/FormInput';
import * as ImagePicker from 'expo-image-picker';
import { getMyRegistrations } from '../../utils/services/registrationService';
import { uploadProofImage, createRunningProof, createRunningResult } from '../../utils/services/runningProofService';
import { useAuthCheck } from '../../hooks/useAuthGuard';
import LoginPrompt from '../../components/LoginPrompt';

const SUPABASE_URL = 'https://ouzinewiddtcvtfdmuub.supabase.co';
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

export default function SubmitScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthCheck();

  const [eligibleRegs, setEligibleRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch eligible registrations (confirmed + within submit window)
  const fetchEligible = useCallback(async () => {
    try {
      const data = await getMyRegistrations();
      const regs = Array.isArray(data) ? data : data?.data || [];
      const now = new Date();
      const eligible = regs.filter(r => {
        if (r.paymentStatus !== 'confirmed' || r.status !== 'active') return false;
        const event = r.packages?.events;
        if (!event) return false;
        // Check submit window if dates exist
        const submitStart = event.submitStartDate ? new Date(event.submitStartDate) : event.startDate ? new Date(event.startDate) : null;
        const submitEnd = event.submitEndDate ? new Date(event.submitEndDate) : event.endDate ? new Date(event.endDate) : null;
        if (submitStart && now < submitStart) return false;
        if (submitEnd && now > submitEnd) return false;
        return true;
      });
      setEligibleRegs(eligible);
      if (eligible.length === 1) setSelectedReg(eligible[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchEligible(); }, [fetchEligible, isAuthenticated]);

  const handlePickImage = async (useCamera) => {
    const fn = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await fn({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleBack = () => {
    if (distance || proofImage) {
      Alert.alert('ยกเลิกการส่งผล', 'ข้อมูลที่กรอกไว้จะหายไป', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', onPress: () => router.back() }
      ]);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!selectedReg) return Alert.alert('Error', 'Please select an event');
    const dist = parseFloat(distance);
    if (!dist || dist <= 0) return Alert.alert('Error', 'Enter a valid distance');
    if (!proofImage) return Alert.alert('Error', 'Please upload proof image');

    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const durationStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    // Pace warning
    const totalSec = h * 3600 + m * 60 + s;
    if (totalSec > 0 && dist > 0) {
      const paceMin = (totalSec / 60) / dist;
      if (paceMin < 3.5) {
        Alert.alert('Warning', `Your pace (${paceMin.toFixed(1)} min/km) is extremely fast and will be flagged for review.`);
      }
    }

    setSubmitting(true);
    try {
      // 1. Upload proof image
      const uploadResult = await uploadProofImage({
        uri: proofImage,
        name: `proof_${selectedReg.id}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      const imageUrl = uploadResult.path || uploadResult.url || uploadResult.data?.path;

      // 2. Create running proof
      const proof = await createRunningProof({
        imageUrl,
        distance: dist,
        duration: totalSec > 0 ? durationStr : undefined,
      });

      // 3. Link to registration via running result
      const proofId = proof.id || proof.data?.id;
      await createRunningResult({
        registrationId: selectedReg.id,
        runningProofId: proofId,
      });

      Alert.alert('Success', 'Running proof submitted successfully!', [
        { text: 'OK', onPress: () => { resetForm(); router.push('/(tabs)/run'); } }
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit proof';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDistance('');
    setHours('');
    setMinutes('');
    setSeconds('');
    setProofImage(null);
    setSelectedReg(null);
  };

  const selectedEvent = selectedReg?.packages?.events;
  const targetKm = Number(selectedReg?.targetDistanceSnapshot || selectedReg?.packages?.targetDistance || 0);

  if (!authLoading && !isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
        <TopNavigationBack title="Submit Result" onBack={() => router.back()} isDark={isDark} />
        <LoginPrompt message="Log in to submit your running proof" />
      </SafeAreaView>
    );
  }

  if (loading || authLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
        <TopNavigationBack title="Submit Result" onBack={() => router.back()} isDark={isDark} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <TopNavigationBack title="Submit Result" onBack={handleBack} isDark={isDark} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Event Selector */}
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Select Event</Text>
          {eligibleRegs.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="alert-circle-outline" size={24} color={COLORS.GRAY_400} />
              <Text style={{ color: COLORS.GRAY_400, marginTop: 6, textAlign: 'center', fontSize: 13 }}>
                No eligible events.{'\n'}Payment must be confirmed and within submit window.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowPicker(true)}
            >
              {selectedReg ? (
                <View style={styles.selectedRow}>
                  {selectedEvent?.coverImage && (
                    <Image source={{ uri: getImageUrl(selectedEvent.coverImage) }} style={styles.selectorThumb} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selectorTitle, { color: theme.text }]} numberOfLines={1}>
                      {selectedEvent?.title || 'Event'}
                    </Text>
                    <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>
                      {selectedReg.packages?.name} — Target: {targetKm}K
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color={theme.textTertiary} />
                </View>
              ) : (
                <View style={styles.selectedRow}>
                  <Text style={{ color: COLORS.GRAY_400 }}>Tap to select event</Text>
                  <Ionicons name="chevron-down" size={18} color={theme.textTertiary} />
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Target reminder */}
          {selectedReg && targetKm > 0 && (
            <View style={[styles.targetBox, { backgroundColor: theme.card, borderColor: COLORS.PRIMARY_YELLOW }]}>
              <Ionicons name="flag-outline" size={16} color={COLORS.PRIMARY_YELLOW} />
              <Text style={{ color: COLORS.PRIMARY_YELLOW, fontWeight: '700', marginLeft: 6, fontSize: 13 }}>
                Target: {targetKm} KM
              </Text>
            </View>
          )}

          {/* Proof Image Upload */}
          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 20 }]}>Proof Image</Text>
          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: theme.card, borderColor: proofImage ? COLORS.SUCCESS : theme.border }]}
            onPress={() => handlePickImage(false)}
          >
            {proofImage ? (
              <View style={{ alignItems: 'center' }}>
                <Image source={{ uri: proofImage }} style={styles.proofPreview} contentFit="cover" />
                <Text style={{ color: COLORS.SUCCESS, fontSize: 12, marginTop: 8 }}>Tap to change</Text>
              </View>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={40} color={COLORS.PRIMARY_YELLOW} />
                <Text style={[styles.uploadText, { color: theme.text }]}>Upload Activity Screenshot</Text>
                <Text style={{ color: theme.textTertiary, fontSize: 12 }}>Strava, Garmin, Nike Run, etc.</Text>
              </>
            )}
          </TouchableOpacity>
          <View style={styles.cameraRow}>
            <TouchableOpacity
              style={[styles.cameraBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handlePickImage(true)}
            >
              <Ionicons name="camera-outline" size={18} color={COLORS.PRIMARY_YELLOW} />
              <Text style={{ color: theme.text, fontSize: 12, marginLeft: 6 }}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cameraBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handlePickImage(false)}
            >
              <Ionicons name="images-outline" size={18} color={COLORS.PRIMARY_YELLOW} />
              <Text style={{ color: theme.text, fontSize: 12, marginLeft: 6 }}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Distance + Duration */}
          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 20 }]}>Distance (km)</Text>
          <FormInput
            label=""
            placeholder="e.g. 10.5"
            value={distance}
            onChangeText={setDistance}
            theme={theme}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 12 }]}>Duration</Text>
          <View style={styles.durationRow}>
            <View style={styles.durationField}>
              <FormInput label="" placeholder="HH" value={hours} onChangeText={setHours} theme={theme} keyboardType="number-pad" />
            </View>
            <Text style={[styles.durationColon, { color: theme.text }]}>:</Text>
            <View style={styles.durationField}>
              <FormInput label="" placeholder="MM" value={minutes} onChangeText={setMinutes} theme={theme} keyboardType="number-pad" />
            </View>
            <Text style={[styles.durationColon, { color: theme.text }]}>:</Text>
            <View style={styles.durationField}>
              <FormInput label="" placeholder="SS" value={seconds} onChangeText={setSeconds} theme={theme} keyboardType="number-pad" />
            </View>
          </View>

          <View style={[styles.warningBox, { backgroundColor: isDark ? '#332800' : '#FFF8E1' }]}>
            <Ionicons name="warning-outline" size={14} color="#ff6f00" />
            <Text style={{ color: '#ff6f00', fontSize: 12, marginLeft: 6, flex: 1 }}>
              Pace faster than 3:30 min/km will be flagged for review
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.submitBtn, { opacity: submitting ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.DARK_BG} />
            ) : (
              <Text style={styles.submitBtnText}>SUBMIT PROOF</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Event Picker Modal */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Event</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={eligibleRegs}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => {
                const ev = item.packages?.events;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, { borderBottomColor: theme.border }]}
                    onPress={() => { setSelectedReg(item); setShowPicker(false); }}
                  >
                    {ev?.coverImage && (
                      <Image source={{ uri: getImageUrl(ev.coverImage) }} style={styles.modalThumb} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[{ color: theme.text, fontWeight: '600' }]}>{ev?.title || 'Event'}</Text>
                      <Text style={{ color: COLORS.GRAY_400, fontSize: 12 }}>
                        {item.packages?.name} — Target: {Number(item.targetDistanceSnapshot || item.packages?.targetDistance || 0)}K
                      </Text>
                    </View>
                    {selectedReg?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.PRIMARY_YELLOW} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { ...Layout.padding },
  sectionLabel: { ...Typography.bodyMedium, fontWeight: 'bold', marginBottom: 8 },
  selector: { padding: 14, borderRadius: 12, borderWidth: 1 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorThumb: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  selectorTitle: { fontWeight: '700', fontSize: 15 },
  targetBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 10, borderRadius: 10, borderWidth: 1 },
  emptyBox: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  imagePicker: { height: 160, ...Components.cardLarge, borderWidth: 2, borderStyle: 'dashed', ...Layout.centerAll },
  uploadText: { ...Typography.bodyLarge, fontWeight: 'bold', marginTop: 8 },
  proofPreview: { width: 120, height: 120, borderRadius: 10 },
  cameraRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cameraBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, borderWidth: 1 },
  durationRow: { flexDirection: 'row', alignItems: 'center' },
  durationField: { flex: 1 },
  durationColon: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 6 },
  warningBox: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginTop: 14 },
  submitBtn: { backgroundColor: COLORS.PRIMARY_YELLOW, ...Components.buttonLarge, elevation: 4 },
  submitBtnText: { ...Typography.buttonLarge, color: COLORS.DARK_BG },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { maxHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 0.5 },
  modalThumb: { width: 45, height: 45, borderRadius: 10, marginRight: 12 },
});
