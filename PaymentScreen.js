import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
// เปลี่ยนมานำเข้า SafeAreaView จากที่นี่แทน
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from './TopNavigationBack';

const PaymentScreen = ({ amount, onBack, onSuccess }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 2000);
  };

  return (
    // edges={['right', 'bottom', 'left']} เพื่อให้ด้านบนใช้ตาม TopNavigationBack
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopNavigationBack title="Payment" onBack={onBack} isDark={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* สรุปยอดเงิน */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>฿{amount}</Text>
        </View>

        {/* ส่วน QR Code */}
        <View style={styles.qrSection}>
          <View style={styles.promptPayHeader}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/PromptPay-logo.png/640px-PromptPay-logo.png' }}
              style={styles.ppLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.qrPlaceholder}>
            <Image
              source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ExamplePromptPay' }}
              style={styles.qrImage}
            />
          </View>

          <Text style={styles.timerText}>
            QR expires in <Text style={styles.timerBold}>{formatTime(timeLeft)}</Text>
          </Text>
        </View>

        {/* คำแนะนำในการใช้งาน */}
        <View style={styles.instructionBox}>
          <View style={styles.instructionRow}>
            <Ionicons name="camera-outline" size={16} color="#888" />
            <Text style={styles.instructionText}>Save QR or Take a screenshot</Text>
          </View>
          <View style={styles.instructionRow}>
            <Ionicons name="apps-outline" size={16} color="#888" />
            <Text style={styles.instructionText}>Open banking app to scan</Text>
          </View>
        </View>

        {/* ปุ่มตรวจสอบสถานะ */}
        <TouchableOpacity
          style={[styles.verifyBtn, isVerifying && { opacity: 0.8 }]}
          onPress={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="shield-checkmark-outline" size={20} color="#000" style={{ marginRight: 10 }} />
              <Text style={styles.verifyBtnText}>I'VE PAID (CHECK STATUS)</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10, alignItems: 'center' },

  amountCard: {
    backgroundColor: '#FFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  amountLabel: { fontSize: 13, color: '#666', marginBottom: 2 },
  amountValue: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },

  qrSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  promptPayHeader: { width: '100%', alignItems: 'center', marginBottom: 12 },
  ppLogo: { width: 100, height: 35 },
  qrPlaceholder: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  qrImage: { width: 180, height: 180 }, // ปรับขนาดเล็กลงอีกนิดเพื่อความชัวร์
  timerText: { marginTop: 12, fontSize: 12, color: '#888' },
  timerBold: { fontWeight: 'bold', color: '#E74C3C' },

  instructionBox: { marginTop: 20, width: '100%', paddingHorizontal: 10 },
  instructionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  instructionText: { fontSize: 13, color: '#777', marginLeft: 10 },

  verifyBtn: {
    backgroundColor: COLORS.PRIMARY_YELLOW,
    width: '100%',
    height: 55,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.PRIMARY_YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  verifyBtnText: { fontWeight: '900', fontSize: 15, color: '#000' }
});

export default PaymentScreen;