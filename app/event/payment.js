import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';

const STATUS = {
  PENDING: 'PENDING',
  VERIFYING: 'VERIFYING',
  SUCCESS: 'SUCCESS'
};

export default function PaymentScreen() {
  const theme = getTheme(false);
  const router = useRouter();
  const { amount = '450' } = useLocalSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(STATUS.PENDING);
  const [hasSlip, setHasSlip] = useState(false);

  const handleVerify = () => {
    setPaymentStatus(STATUS.VERIFYING);
    setTimeout(() => {
      setPaymentStatus(STATUS.SUCCESS);
    }, 2000);
  };

  const handleGoHome = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  if (paymentStatus === STATUS.SUCCESS) {
    return (
      <SafeAreaView style={[Layout.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <View style={[Layout.centerAll, { flex: 1, padding: 30 }]}>
          <View style={[Components.iconContainerLarge, { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.SUCCESS, marginBottom: 20 }]}>
            <Ionicons name="checkmark" size={60} color={COLORS.LIGHT_BG} />
          </View>

          <Text style={[Typography.h1, { color: theme.text, textAlign: 'center' }]}>Payment Successful</Text>
          <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 40 }]}>
            Your registration is now complete. Get ready to run!
          </Text>

          <TouchableOpacity
            style={[Components.buttonLarge, { backgroundColor: COLORS.PRIMARY_YELLOW, width: '100%' }]}
            onPress={handleGoHome}
          >
            <Text style={[Typography.buttonLarge, { color: COLORS.DARK_BG }]}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[Layout.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <TopNavigationBack title="Payment" onBack={() => router.back()} isDark={false} />

      <ScrollView contentContainerStyle={Layout.padding} showsVerticalScrollIndicator={false}>

        <View style={[Components.cardLarge, { backgroundColor: theme.card, padding: 25, alignItems: 'center', marginBottom: 20 }]}>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>TOTAL AMOUNT</Text>
          <Text style={[Typography.statLarge, { color: COLORS.PRIMARY_YELLOW }]}>฿{amount}</Text>
        </View>

        <View style={[Components.card, { backgroundColor: '#F8F9FA', padding: 20, alignItems: 'center', borderColor: '#EEE', borderWidth: 1 }]}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/PromptPay-logo.png/640px-PromptPay-logo.png' }}
            style={{ width: 120, height: 40, marginBottom: 15 }}
            resizeMode="contain"
          />
          <View style={{ padding: 10, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#EEE' }}>
            <Image
              source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GoldStridePayment' }}
              style={{ width: 200, height: 200 }}
            />
          </View>
          <Text style={[Typography.captionSmall, { color: '#666', marginTop: 15 }]}>Scan QR Code with any Banking App</Text>
        </View>

        <TouchableOpacity
          style={[
            Components.inputLarge,
            {
              marginTop: 20,
              height: 60,
              borderStyle: 'dashed',
              borderColor: hasSlip ? COLORS.SUCCESS : '#CCC',
              backgroundColor: '#FFF',
              ...Layout.rowCenter,
              justifyContent: 'center'
            }
          ]}
          onPress={() => setHasSlip(true)}
        >
          <Ionicons name={hasSlip ? "checkmark-circle" : "cloud-upload"} size={24} color={hasSlip ? COLORS.SUCCESS : '#999'} />
          <Text style={[Typography.bodyMedium, { color: hasSlip ? COLORS.SUCCESS : '#666', marginLeft: 10 }]}>
            {hasSlip ? "Slip Uploaded" : "Upload Payment Slip"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            Components.buttonLarge,
            {
              marginTop: 25,
              backgroundColor: hasSlip ? COLORS.PRIMARY_YELLOW : '#EEE',
              opacity: (paymentStatus === STATUS.VERIFYING || !hasSlip) ? 0.7 : 1
            }
          ]}
          onPress={handleVerify}
          disabled={!hasSlip || paymentStatus === STATUS.VERIFYING}
        >
          {paymentStatus === STATUS.VERIFYING ? (
            <ActivityIndicator color={COLORS.DARK_BG} />
          ) : (
            <Text style={[Typography.buttonLarge, { color: hasSlip ? COLORS.DARK_BG : '#999' }]}>
              {hasSlip ? "CONFIRM PAYMENT" : "PLEASE UPLOAD SLIP"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
