import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import TopNavigationBack from '../../components/TopNavigationBack';
import * as ImagePicker from 'expo-image-picker';
import { getPaymentQR, submitSlip, uploadSlipImage } from '../../utils/services/paymentService';
import { getRegistrationById } from '../../utils/services/registrationService';
import { useAuthGuard } from '../../hooks/useAuthGuard';

export default function PaymentScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { registrationId } = useLocalSearchParams();
  const { isReady } = useAuthGuard();

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [slipUri, setSlipUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load QR code + current payment status
  useEffect(() => {
    async function load() {
      try {
        const data = await getPaymentQR(registrationId);
        setQrData(data);
        setPaymentStatus(data.paymentStatus || 'pending');
      } catch (err) {
        const msg = err.response?.data?.message || 'ไม่สามารถโหลด QR ได้';
        Alert.alert('Error', msg);
      } finally {
        setLoading(false);
      }
    }
    if (registrationId) load();
  }, [registrationId]);

  // Pick slip image
  const handlePickSlip = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setSlipUri(result.assets[0].uri);
    }
  };

  // Upload + submit slip
  const handleSubmitSlip = async () => {
    if (!slipUri) return;
    setSubmitting(true);
    try {
      // 1. Upload slip image to backend
      setUploading(true);
      const uploadResult = await uploadSlipImage({
        uri: slipUri,
        name: `slip_${registrationId}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      setUploading(false);

      // 2. Submit slip URL to payment endpoint
      const slipPath = uploadResult.path || uploadResult.url || uploadResult.data?.path;
      await submitSlip(registrationId, slipPath);
      setPaymentStatus('pending_verification');
      Alert.alert('สำเร็จ', 'อัปโหลดสลิปแล้ว รอการตรวจสอบ');
    } catch (err) {
      const msg = err.response?.data?.message || 'ไม่สามารถอัปโหลดได้';
      Alert.alert('ผิดพลาด', msg);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // Refresh status
  const handleRefresh = async () => {
    try {
      const reg = await getRegistrationById(registrationId);
      setPaymentStatus(reg.paymentStatus);
    } catch {}
  };

  const handleGoHome = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  const handleGoMyRuns = () => {
    router.dismissAll();
    router.replace('/(tabs)/run');
  };

  if (!isReady || loading) {
    return (
      <SafeAreaView style={[Layout.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <TopNavigationBack title="Payment" onBack={() => router.back()} isDark={isDark} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_YELLOW} />
          <Text style={[Typography.bodyMedium, { color: theme.textSecondary, marginTop: 10 }]}>Loading QR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (paymentStatus === 'confirmed') {
    return (
      <SafeAreaView style={[Layout.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <View style={[Layout.centerAll, { flex: 1, padding: 30 }]}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.SUCCESS, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="checkmark" size={60} color={COLORS.LIGHT_BG} />
          </View>
          <Text style={[Typography.h1, { color: theme.text, textAlign: 'center' }]}>Payment Confirmed</Text>
          <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 40 }]}>
            การชำระเงินสำเร็จแล้ว เตรียมตัววิ่งได้เลย!
          </Text>
          <TouchableOpacity
            style={[Components.buttonLarge, { backgroundColor: COLORS.PRIMARY_YELLOW, width: '100%', marginBottom: 12 }]}
            onPress={handleGoMyRuns}
          >
            <Text style={[Typography.buttonLarge, { color: COLORS.DARK_BG }]}>VIEW MY RUNS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[Components.buttonLarge, { backgroundColor: theme.card, width: '100%', borderWidth: 1, borderColor: theme.border }]}
            onPress={handleGoHome}
          >
            <Text style={[Typography.buttonLarge, { color: theme.text }]}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Pending verification state
  if (paymentStatus === 'pending_verification') {
    return (
      <SafeAreaView style={[Layout.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <TopNavigationBack title="Payment" onBack={() => router.back()} isDark={isDark} />
        <View style={[Layout.centerAll, { flex: 1, padding: 30 }]}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.PRIMARY_YELLOW, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="hourglass-outline" size={40} color={COLORS.DARK_BG} />
          </View>
          <Text style={[Typography.h2, { color: theme.text, textAlign: 'center' }]}>Waiting for Verification</Text>
          <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 }]}>
            สลิปถูกส่งแล้ว กรุณารอการตรวจสอบจากผู้จัดงาน
          </Text>
          <TouchableOpacity
            style={[Components.buttonLarge, { backgroundColor: COLORS.PRIMARY_YELLOW, width: '100%', marginBottom: 12 }]}
            onPress={handleRefresh}
          >
            <Text style={[Typography.buttonLarge, { color: COLORS.DARK_BG }]}>REFRESH STATUS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[Components.buttonLarge, { backgroundColor: theme.card, width: '100%', borderWidth: 1, borderColor: theme.border }]}
            onPress={handleGoHome}
          >
            <Text style={[Typography.buttonLarge, { color: theme.text }]}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Rejected state
  if (paymentStatus === 'rejected') {
    return (
      <SafeAreaView style={[Layout.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <TopNavigationBack title="Payment" onBack={() => router.back()} isDark={isDark} />
        <View style={[Layout.centerAll, { flex: 1, padding: 30 }]}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.ERROR, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="close" size={40} color={COLORS.LIGHT_BG} />
          </View>
          <Text style={[Typography.h2, { color: theme.text, textAlign: 'center' }]}>Payment Rejected</Text>
          <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 }]}>
            สลิปไม่ถูกต้อง กรุณาอัปโหลดใหม่
          </Text>
          <TouchableOpacity
            style={[Components.buttonLarge, { backgroundColor: COLORS.PRIMARY_YELLOW, width: '100%' }]}
            onPress={() => { setPaymentStatus('pending'); setSlipUri(null); }}
          >
            <Text style={[Typography.buttonLarge, { color: COLORS.DARK_BG }]}>UPLOAD NEW SLIP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Default: pending — show QR + upload
  return (
    <SafeAreaView style={[Layout.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <TopNavigationBack title="Payment" onBack={() => router.back()} isDark={isDark} />

      <ScrollView contentContainerStyle={Layout.padding} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={[Components.cardLarge, { backgroundColor: theme.card, padding: 25, alignItems: 'center', marginBottom: 20 }]}>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>TOTAL AMOUNT</Text>
          <Text style={[Typography.statLarge, { color: COLORS.PRIMARY_YELLOW }]}>
            ฿{qrData?.amount ? Number(qrData.amount).toLocaleString() : '0'}
          </Text>
          {qrData?.promptpayName && (
            <Text style={[Typography.captionSmall, { color: theme.textSecondary, marginTop: 4 }]}>
              {qrData.promptpayName}
            </Text>
          )}
        </View>

        {/* QR Code */}
        <View style={[Components.card, { backgroundColor: isDark ? theme.card : '#F8F9FA', padding: 20, alignItems: 'center', borderColor: theme.border, borderWidth: 1 }]}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/PromptPay-logo.png/640px-PromptPay-logo.png' }}
            style={{ width: 120, height: 40, marginBottom: 15 }}
            contentFit="contain"
          />
          {qrData?.qrCode ? (
            <View style={{ padding: 10, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#EEE' }}>
              <Image
                source={{ uri: qrData.qrCode }}
                style={{ width: 220, height: 220 }}
                contentFit="contain"
              />
            </View>
          ) : (
            <Text style={{ color: COLORS.ERROR, marginVertical: 20 }}>QR Code not available</Text>
          )}
          <Text style={[Typography.captionSmall, { color: COLORS.GRAY_400, marginTop: 15 }]}>
            Scan QR Code with any Banking App
          </Text>
        </View>

        {/* Slip Upload */}
        <TouchableOpacity
          style={[
            styles.uploadArea,
            {
              borderColor: slipUri ? COLORS.SUCCESS : theme.border,
              backgroundColor: theme.card,
            }
          ]}
          onPress={handlePickSlip}
        >
          {slipUri ? (
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: slipUri }} style={styles.slipPreview} contentFit="cover" />
              <Text style={[Typography.caption, { color: COLORS.SUCCESS, marginTop: 8 }]}>Tap to change slip</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="cloud-upload-outline" size={32} color={COLORS.GRAY_400} />
              <Text style={[Typography.bodyMedium, { color: COLORS.GRAY_400, marginTop: 8 }]}>Upload Payment Slip</Text>
              <Text style={[Typography.captionSmall, { color: COLORS.GRAY_500, marginTop: 4 }]}>Tap to select from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            Components.buttonLarge,
            {
              marginTop: 20,
              backgroundColor: slipUri ? COLORS.PRIMARY_YELLOW : theme.border,
              opacity: (submitting || !slipUri) ? 0.6 : 1,
            }
          ]}
          onPress={handleSubmitSlip}
          disabled={!slipUri || submitting}
        >
          {submitting ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.DARK_BG} size="small" />
              <Text style={[Typography.buttonLarge, { color: COLORS.DARK_BG, marginLeft: 8 }]}>
                {uploading ? 'Uploading...' : 'Submitting...'}
              </Text>
            </View>
          ) : (
            <Text style={[Typography.buttonLarge, { color: slipUri ? COLORS.DARK_BG : COLORS.GRAY_400 }]}>
              {slipUri ? 'SUBMIT PAYMENT SLIP' : 'PLEASE UPLOAD SLIP'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  uploadArea: {
    marginTop: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  slipPreview: {
    width: 150,
    height: 200,
    borderRadius: 10,
  },
});
