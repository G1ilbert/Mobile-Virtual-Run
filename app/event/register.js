import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import FormInput from '../../components/FormInput';
import { getEventById } from '../../utils/helpers';

export default function RegistrationForm() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { eventId } = useLocalSearchParams();

  const event = getEventById(eventId);

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isUsingProfile, setIsUsingProfile] = useState(false);

  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
  });

  if (!event) return null;

  const isFormValid = selectedPkg !== null && formData.receiverName && formData.receiverPhone && formData.receiverAddress;

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <TopNavigationBack title="Register Event" onBack={() => router.back()} isDark={isDark} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              color={selectedPkg === index ? COLORS.PRIMARY_YELLOW : theme.textSecondary}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.pkgName, { color: theme.text }]}>{pkg.name}</Text>
              <Text style={styles.pkgItems} numberOfLines={1}>{pkg.items}</Text>
            </View>
            <Text style={styles.pkgPrice}>฿{pkg.price}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Shipping Address</Text>
          <View style={styles.profileToggle}>
            <Text style={{ fontSize: 12, color: theme.textTertiary, marginRight: 8 }}>Use Profile Data</Text>
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
          value={formData.receiverName}
          onChangeText={(t) => setFormData({...formData, receiverName: t})}
          theme={theme}
        />

        <FormInput
          label="Phone Number"
          placeholder="08X-XXX-XXXX"
          keyboardType="phone-pad"
          value={formData.receiverPhone}
          onChangeText={(t) => setFormData({...formData, receiverPhone: t})}
          theme={theme}
        />

        <FormInput
          label="Full Address"
          placeholder="บ้านเลขที่, หมู่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
          multiline={true}
          value={formData.receiverAddress}
          onChangeText={(t) => setFormData({...formData, receiverAddress: t})}
          theme={theme}
        />
      </ScrollView>

      <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.payButton, { opacity: isFormValid ? 1 : 0.5 }]}
          disabled={!isFormValid}
          onPress={() => router.push({ pathname: '/event/payment', params: { amount: event.packages[selectedPkg].price } })}
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
}

const styles = StyleSheet.create({
  scrollContent: { ...Layout.padding, paddingBottom: 140 },
  sectionTitle: { ...Typography.sectionTitle, marginBottom: 15 },
  sectionHeader: { ...Layout.rowBetween, marginBottom: 15 },
  profileToggle: { ...Layout.rowCenter },
  divider: { ...Components.divider, marginVertical: 25 },
  pkgCard: { ...Layout.rowCenter, padding: 16, ...Components.cardSmall, borderWidth: 1, marginBottom: 12 },
  pkgName: { ...Typography.body, fontWeight: 'bold' },
  pkgItems: { ...Typography.caption, color: COLORS.GRAY_400, marginTop: 2 },
  pkgPrice: { ...Typography.bodyLarge, fontWeight: '900', color: COLORS.PRIMARY_YELLOW, marginLeft: 10 },
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
