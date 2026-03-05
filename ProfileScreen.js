import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { globalStyles, COLORS, getTheme } from './GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_RANKINGS, MOCK_EVENTS } from './MockData'; // ดึงข้อมูล User และกิจกรรม

const ProfileScreen = ({ isDark }) => {
  const theme = getTheme(isDark);

  // ดึงข้อมูลตัวเองจาก Mock (ในที่นี้คือ ID: u4 หรือคนที่มีชื่อว่า 'You')
  const user = MOCK_RANKINGS.find(u => u.name === 'You') || MOCK_RANKINGS[0];

  // จำลองงานที่จบแล้ว (Complete)
  const finishedEvents = MOCK_EVENTS.filter(e => e.status === 'Complete');

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Image source={{ uri: item.image }} style={styles.historyImage} />
      <Text style={[styles.historyTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.historyDate}>Finished</Text>
    </View>
  );

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>

      {/* Header: ข้อมูล User จาก MockData */}
      <View style={styles.headerSection}>
        <Image source={{ uri: user.avatar }} style={[styles.profilePic, { borderColor: COLORS.PRIMARY_YELLOW, borderWidth: 2 }]} />
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
          <Text style={styles.userHandle}>@gold_stride • Runner</Text>
        </View>
      </View>

      {/* Dashboard: สถิติจริงจาก MockData */}
      <View style={[styles.dashboardContainer, { backgroundColor: theme.card }]}>
        <StatBox label="Events" value={user.events.toString()} />
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <StatBox label="Avg. Rank" value="#4" />
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <StatBox label="Total KM" value="156" />
      </View>

      {/* Section: Event History (งานที่จบแล้ว) */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Event History</Text>
        <TouchableOpacity style={[styles.viewAllBtn, { borderColor: theme.border }]}>
          <Text style={[styles.viewAllText, { color: theme.text }]}>View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={finishedEvents}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyList}
        ListEmptyComponent={<Text style={{color: '#888', marginLeft: 20}}>No finished events yet</Text>}
      />

      {/* Section: Menu Options */}
      <View style={styles.menuWrapper}>
        {/* เพิ่ม Run History (Submissions) */}
        <MenuOption
          theme={theme}
          icon="stats-chart-outline"
          label="Run History (Submissions)"
          badge="24 Logs"
        />
        
      </View>
    </ScrollView>
  );
};

const StatBox = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuOption = ({ icon, label, theme, badge, isLast }) => (
  <TouchableOpacity style={[styles.menuRow, { borderBottomColor: isLast ? 'transparent' : theme.border }]}>
    <Ionicons name={icon} size={22} color={theme.text} style={{ marginRight: 15 }} />
    <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    {badge && <Text style={styles.badgeText}>{badge}</Text>}
    <Ionicons name="chevron-forward" size={18} color="#888" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerSection: { flexDirection: 'row', alignItems: 'center', padding: 25 },
  profilePic: { width: 85, height: 85, borderRadius: 45, marginRight: 20 },
  userName: { fontSize: 24, fontWeight: 'bold' },
  userHandle: { color: '#888', fontSize: 14, marginTop: 4 },
  dashboardContainer: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 20, paddingVertical: 20, marginBottom: 30 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { color: COLORS.PRIMARY_YELLOW, fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: '50%', alignSelf: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  viewAllText: { fontSize: 12, fontWeight: 'bold' },
  historyList: { paddingLeft: 20, paddingBottom: 30 },
  historyCard: { width: 160, marginRight: 15 },
  historyImage: { width: 160, height: 100, borderRadius: 15, backgroundColor: '#333' },
  historyTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 10 },
  historyDate: { color: '#888', fontSize: 11, marginTop: 2 },
  menuWrapper: { paddingHorizontal: 20, paddingBottom: 100 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 0.5 },
  menuLabel: { flex: 1, fontSize: 16 },
  badgeText: { color: COLORS.PRIMARY_YELLOW, fontSize: 12, fontWeight: 'bold', marginRight: 10 }
});

export default ProfileScreen;