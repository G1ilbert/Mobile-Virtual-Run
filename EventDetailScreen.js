import React, { useState } from 'react'; // เพิ่ม useState
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { globalStyles, COLORS, getTheme } from './GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from './TopNavigationBack';
import RegistrationForm from './RegistrationForm'; // นำเข้าหน้าฟอร์ม

const { width } = Dimensions.get('window');

const EventDetailScreen = ({ item, onBack, isDark }) => {
  const theme = getTheme(isDark);
  // เพิ่ม State สำหรับสลับไปหน้าฟอร์มภายในตัวมันเอง
  const [showForm, setShowForm] = useState(false);

  if (!item) return null;

  // --- เงื่อนไข: ถ้ากดปุ่มสมัคร ให้แสดงหน้า RegistrationForm แทน ---
  if (showForm) {
    return (
      <RegistrationForm
        event={item}
        isDark={isDark}
        onBack={() => setShowForm(false)}
      />
    );
  }

  const showBottomBar = item.status === 'Open';

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconBox, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
        <Ionicons name={icon} size={18} color={COLORS.PRIMARY_YELLOW} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Details" onBack={onBack} isDark={isDark} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: showBottomBar ? 120 : 40 }}>
        <Image source={{ uri: item.image }} style={styles.coverImage} />

        <View style={styles.contentWrapper}>
          <View style={styles.headerRow}>
             <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
                <View style={styles.participantRow}>
                   <Ionicons name="people-outline" size={14} color={COLORS.PRIMARY_YELLOW} />
                   <Text style={styles.participantText}>1,248 Runners Joined</Text>
                </View>
             </View>
             <View style={[styles.statusTag, { backgroundColor: item.status === 'Open' ? '#4CD964' : '#8E8E93' }]}>
                <Text style={styles.statusTagText}>{item.status.toUpperCase()}</Text>
             </View>
          </View>

          <View style={styles.statsGrid}>
            <InfoRow icon="calendar-outline" label="Period" value={item.startDate} />
            <InfoRow icon="walk-outline" label="Distance" value={item.distance} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={styles.description}>{item.fullDesc}</Text>

          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 25 }]}>
            {showBottomBar ? "Select Package" : "Event Packages"}
          </Text>
          {item.packages?.map((pkg, index) => (
            <View key={index} style={[styles.packageCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.packageHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.packageName, { color: theme.text }]}>{pkg.name}</Text>
                  <Text style={styles.packageItems}>{pkg.items}</Text>
                </View>
                <Text style={styles.packagePrice}>฿{pkg.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {showBottomBar && (
        <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.registerBtn}
            activeOpacity={0.8}
            onPress={() => setShowForm(true)} // เมื่อกดจะไปหน้าฟอร์ม
          >
            <Text style={styles.registerBtnText}>REGISTER NOW</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ... styles เหมือนเดิม ...


const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  coverImage: { width: width, height: width * 0.56, resizeMode: 'cover' },
  contentWrapper: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eventTitle: { fontSize: 22, fontWeight: 'bold' },
  participantRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  participantText: { fontSize: 12, color: COLORS.PRIMARY_YELLOW, marginLeft: 5, fontWeight: '600' },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusTagText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', width: '48%' },
  iconBox: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  infoLabel: { fontSize: 10, color: '#888' },
  infoValue: { fontSize: 13, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 14, color: '#AAA', lineHeight: 22 },
  packageCard: { padding: 16, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packageName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  packageItems: { fontSize: 12, color: '#777' },
  packagePrice: { fontSize: 16, fontWeight: '900', color: COLORS.PRIMARY_YELLOW },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingBottom: 35, borderTopWidth: 1 },
  registerBtn: { backgroundColor: COLORS.PRIMARY_YELLOW, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  registerBtnText: { color: '#000', fontSize: 16, fontWeight: '900' }
});

export default EventDetailScreen;