import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, getTheme } from './GlobalStyles';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import TopNavigationBack from './TopNavigationBack';

const SubmitScreen = ({ isDark, onBack }) => {
  const theme = getTheme(isDark);

  // รายการงานที่จะได้รับผลการวิ่งครั้งนี้ (Auto-sync to all)
  const syncEvents = [
    { id: '1', title: "Bangkok Midnight", accumulated: "12.5", target: "42", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200" },
    { id: '2', title: "Phuket Night Run", accumulated: "5.0", target: "10", image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200" },
  ];

  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = () => {
    if (!distance || !duration) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกระยะทางและระยะเวลา");
      return;
    }
    Alert.alert(
      "ส่งผลสำเร็จ",
      `ระยะทาง ${distance} km ถูกบันทึกไปยัง ${syncEvents.length} งานเรียบร้อยแล้ว`,
      [{ text: "ตกลง", onPress: onBack }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <TopNavigationBack title="Submit Result" onBack={onBack} isDark={isDark} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ส่วนอัปโหลดรูปภาพหลักฐาน */}
          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="cloud-upload" size={48} color={COLORS.PRIMARY_YELLOW} />
            <Text style={[styles.uploadText, { color: theme.text }]}>Upload Activity Screenshot</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>Strava, Garmin, Nike Run, etc.</Text>
          </TouchableOpacity>

          {/* ช่องกรอกข้อมูลตัวเลข */}
          <View style={styles.formRow}>
            <View style={styles.inputHalf}>
              <Text style={[styles.label, { color: theme.text }]}>Distance (km)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="0.00" keyboardType="decimal-pad" value={distance} onChangeText={setDistance}
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="00:00:00" value={duration} onChangeText={setDuration}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* ส่วนสรุปว่าส่งเข้างานไหนบ้าง */}
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
                <Ionicons name="add-circle" size={18} color="#4CD964" />
              </View>
            ))}
          </View>

        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>CONFIRM & SUBMIT ALL</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  imagePicker: { height: 180, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  uploadText: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },

  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputHalf: { width: '48%' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { height: 55, borderRadius: 15, borderWidth: 1, paddingHorizontal: 15, fontSize: 18, fontWeight: '900' },

  divider: { height: 1, marginVertical: 30, opacity: 0.3 },

  syncHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },

  eventGrid: { gap: 10 },
  miniCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1 },
  miniThumb: { width: 35, height: 35, borderRadius: 8, marginRight: 12 },
  miniTitle: { fontSize: 13, fontWeight: '600' },
  miniProgress: { fontSize: 11, color: '#888', marginTop: 2 },

  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1 },
  submitBtn: { backgroundColor: COLORS.PRIMARY_YELLOW, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  submitBtnText: { fontWeight: '900', fontSize: 16, color: '#000' }
});

export default SubmitScreen;