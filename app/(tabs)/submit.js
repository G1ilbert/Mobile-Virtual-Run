import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import FormInput from '../../components/FormInput';

export default function SubmitScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const syncEvents = [
    { id: '1', title: "Bangkok Midnight", accumulated: "12.5", target: "42", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200" },
    { id: '2', title: "Phuket Night Run", accumulated: "5.0", target: "10", image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200" },
  ];

  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const handleBack = () => {
    if (distance || duration) {
      Alert.alert(
        "ยกเลิกการส่งผล",
        "ข้อมูลที่กรอกไว้จะหายไป คุณต้องการย้อนกลับหรือไม่?",
        [
          { text: "ยกเลิก", style: "cancel" },
          { text: "ตกลง", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    if (!distance || !duration) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกระยะทางและระยะเวลา");
      return;
    }
    Alert.alert(
      "ส่งผลสำเร็จ",
      `ระยะทาง ${distance} km ถูกบันทึกไปยัง ${syncEvents.length} งานเรียบร้อยแล้ว`,
      [{ text: "ตกลง", onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <TopNavigationBack title="Submit Result" onBack={handleBack} isDark={isDark} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="cloud-upload" size={48} color={COLORS.PRIMARY_YELLOW} />
            <Text style={[styles.uploadText, { color: theme.text }]}>Upload Activity Screenshot</Text>
            <Text style={{ color: theme.textTertiary, fontSize: 12 }}>Strava, Garmin, Nike Run, etc.</Text>
          </TouchableOpacity>

          <View style={styles.formRow}>
            <View style={styles.inputHalf}>
              <FormInput label="Distance (km)" placeholder="0.00" value={distance} onChangeText={setDistance} theme={theme} keyboardType="decimal-pad" />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Duration" placeholder="00:00:00" value={duration} onChangeText={setDuration} theme={theme} />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.syncHeader}>
            <Ionicons name="sync-circle" size={20} color={COLORS.PRIMARY_YELLOW} />
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0, marginLeft: 8 }]}>
              Syncing to your events
            </Text>
          </View>

          <View style={styles.eventGrid}>
            {syncEvents.map((item) => (
              <View key={item.id} style={[styles.miniCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Image source={{ uri: item.image }} style={styles.miniThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.miniTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.miniProgress}>{item.accumulated} km current</Text>
                </View>
                <Ionicons name="add-circle" size={18} color={COLORS.SUCCESS} />
              </View>
            ))}
          </View>

        </ScrollView>

        <View style={[ScreenStyles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>CONFIRM & SUBMIT ALL</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { ...Layout.padding },
  imagePicker: { height: 180, ...Components.cardLarge, borderWidth: 2, borderStyle: 'dashed', ...Layout.centerAll, marginBottom: 25 },
  uploadText: { ...Typography.bodyLarge, fontWeight: 'bold', marginTop: 10 },
  formRow: { ...Layout.rowBetween },
  inputHalf: { width: '48%' },
  divider: { ...Components.divider, marginVertical: 30 },
  syncHeader: { ...Layout.rowCenter, marginBottom: 15 },
  sectionTitle: { ...Typography.bodyLarge, fontWeight: 'bold' },
  eventGrid: { gap: 10 },
  miniCard: { ...Layout.rowCenter, padding: 12, ...Components.cardSmall, borderWidth: 1 },
  miniThumb: { width: 35, height: 35, borderRadius: 8, marginRight: 12 },
  miniTitle: { ...Typography.bodySmall },
  miniProgress: { ...Typography.captionSmall, color: COLORS.GRAY_400, marginTop: 2 },
  submitBtn: { backgroundColor: COLORS.PRIMARY_YELLOW, ...Components.buttonLarge, elevation: 4 },
  submitBtnText: { ...Typography.buttonLarge, color: COLORS.DARK_BG }
});
