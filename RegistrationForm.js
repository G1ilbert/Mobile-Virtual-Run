import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { globalStyles, COLORS, getTheme } from './GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from './TopNavigationBack';
import PaymentScreen from './PaymentScreen'; // อย่าลืม import หน้าชำระเงิน

const RegistrationForm = ({ event, isDark, onBack }) => {
  const theme = getTheme(isDark);

  // 1. States สำหรับจัดการการไหลของหน้าจอ
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isUsingProfile, setIsUsingProfile] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // 2. State สำหรับข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
  });

  // ฟังก์ชันดึงข้อมูลจาก Profile
  const handleUseProfile = (value) => {
    setIsUsingProfile(value);
    if (value) {
      setFormData({
        receiverName: 'สมชาย จดจ่อ',
        receiverPhone: '081-234-5678',
        receiverAddress: '123/4 หมู่ 5 ซ.วิ่งดี ถ.พหลโยธิน ต.จตุจักร อ.จตุจักร กรุงเทพฯ 10900',
      });
    } else {
      setFormData({ receiverName: '', receiverPhone: '', receiverAddress: '' });
    }
  };

  // เช็คว่ากรอกข้อมูลครบหรือยัง
  const isFormValid = selectedPkg !== null && formData.receiverName && formData.receiverPhone && formData.receiverAddress;

  // --- Logic การแสดงหน้า Payment QR Code ---
  if (showQR) {
    return (
      <PaymentScreen
        amount={event.packages[selectedPkg].price}
        onBack={() => setShowQR(false)}
        onSuccess={() => {
          setShowQR(false);
          setIsPaid(true);
          Alert.alert("Success", "การสมัครเสร็จสมบูรณ์!", [{ text: "OK", onPress: onBack }]);
        }}
      />
    );
  }

  const InputField = ({ label, placeholder, value, onChangeText, multiline = false, keyboardType = 'default' }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border,
            height: multiline ? 100 : 50,
            textAlignVertical: multiline ? 'top' : 'center'
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <TopNavigationBack title="Register Event" onBack={onBack} isDark={isDark} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. เลือก Package */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Package</Text>
        {event.packages?.map((pkg, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pkgCard,
              {
                backgroundColor: theme.card,
                borderColor: selectedPkg === index ? COLORS.PRIMARY_YELLOW : theme.border,
                borderWidth: selectedPkg === index ? 2 : 1
              }
            ]}
            onPress={() => setSelectedPkg(index)}
          >
            <Ionicons
              name={selectedPkg === index ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={selectedPkg === index ? COLORS.PRIMARY_YELLOW : "#444"}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.pkgName, { color: theme.text }]}>{pkg.name}</Text>
              <Text style={styles.pkgItems} numberOfLines={1}>{pkg.items}</Text>
            </View>
            <Text style={styles.pkgPrice}>฿{pkg.price}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* 2. ข้อมูลผู้รับ + ปุ่มดึงข้อมูล */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Shipping Address</Text>
          <View style={styles.profileToggle}>
            <Text style={{ fontSize: 12, color: '#888', marginRight: 8 }}>Use Profile Data</Text>
            <Switch
              value={isUsingProfile}
              onValueChange={handleUseProfile}
              trackColor={{ false: "#333", true: COLORS.PRIMARY_YELLOW }}
              thumbColor={Platform.OS === 'ios' ? undefined : (isUsingProfile ? "#FFF" : "#AAA")}
            />
          </View>
        </View>

        <InputField
          label="Recipient Name"
          placeholder="ชื่อ-นามสกุลจริง"
          value={formData.receiverName}
          onChangeText={(t) => setFormData({...formData, receiverName: t})}
        />

        <InputField
          label="Phone Number"
          placeholder="08X-XXX-XXXX"
          keyboardType="phone-pad"
          value={formData.receiverPhone}
          onChangeText={(t) => setFormData({...formData, receiverPhone: t})}
        />

        <InputField
          label="Full Address"
          placeholder="บ้านเลขที่, หมู่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
          multiline={true}
          value={formData.receiverAddress}
          onChangeText={(t) => setFormData({...formData, receiverAddress: t})}
        />

        <Text style={styles.disclaimer}>
          * โปรดตรวจสอบที่อยู่ให้ถูกต้องเพื่อป้องกันความผิดพลาดในการจัดส่งของรางวัล
        </Text>
      </ScrollView>

      {/* ปุ่มจ่ายเงิน */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.payButton, { opacity: isFormValid ? 1 : 0.5 }]}
          disabled={!isFormValid}
          onPress={() => setShowQR(true)}
        >
          <Text style={styles.payButtonText}>PROCEED TO PAYMENT</Text>
          {selectedPkg !== null && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>฿{event.packages[selectedPkg].price}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 140 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  profileToggle: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: 1, marginVertical: 25, opacity: 0.5 },
  pkgCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  pkgName: { fontSize: 15, fontWeight: 'bold' },
  pkgItems: { fontSize: 12, color: '#888', marginTop: 2 },
  pkgPrice: { fontSize: 16, fontWeight: '900', color: COLORS.PRIMARY_YELLOW, marginLeft: 10 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, opacity: 0.8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, fontSize: 15 },
  disclaimer: { fontSize: 11, color: '#666', fontStyle: 'italic', lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingBottom: 40, borderTopWidth: 1 },
  payButton: {
    backgroundColor: COLORS.PRIMARY_YELLOW,
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  payButtonText: { color: '#000', fontSize: 15, fontWeight: '900', flex: 1, textAlign: 'center' },
  priceBadge: { backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priceBadgeText: { color: '#000', fontSize: 16, fontWeight: '900' }
});

export default RegistrationForm;