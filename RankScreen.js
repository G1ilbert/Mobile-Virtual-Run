import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { globalStyles, COLORS, getTheme } from './GlobalStyles';
import { MOCK_RANKINGS } from './MockData';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const MEDAL_COLORS = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

const RankScreen = ({ isDark }) => {
  const [filter, setFilter] = useState('Yearly');
  const theme = getTheme(isDark);

  const top3 = MOCK_RANKINGS.slice(0, 3);
  const top4to10 = MOCK_RANKINGS.slice(3, 10);
  const myData = MOCK_RANKINGS.find(r => r.name === 'You');
  const myRank = MOCK_RANKINGS.findIndex(r => r.id === myData?.id) + 1;

  // เรียงลำดับโชว์: [อันดับ 2, อันดับ 1, อันดับ 3]
  const podiumData = [top3[1], top3[0], top3[2]];

  const renderTopThree = (item, index) => {
    // กำหนดลำดับตามตำแหน่งใน Array (0=Rank2, 1=Rank1, 2=Rank3)
    const rankPos = index === 0 ? 2 : index === 1 ? 1 : 3;
    const isFirst = rankPos === 1;
    const medalColor = MEDAL_COLORS[rankPos];

    return (
      <View key={item.id} style={[styles.topPlayerCol, isFirst && { marginTop: -20 }]}>
        <View style={styles.avatarContainer}>
          {/* ใบไม้ล้อมรอบเฉพาะอันดับ 1 */}
          {isFirst && (
            <View style={styles.wreathOverlay}>
              <Ionicons name="leaf" size={105} color="rgba(255,215,0,0.25)" style={styles.leafLeft} />
              <Ionicons name="leaf" size={105} color="rgba(255,215,0,0.25)" style={styles.leafRight} />
            </View>
          )}

          <Image
            source={{ uri: item.avatar }}
            style={[styles.topAvatar, { borderColor: medalColor, width: isFirst ? 90 : 70, height: isFirst ? 90 : 70 }]}
          />

          {/* วงกลมตัวเลขลำดับ */}
          <View style={[styles.badgeContainer, { backgroundColor: medalColor }]}>
            <Text style={styles.rankNum}>{rankPos}</Text>
          </View>
        </View>

        <Text style={[styles.topName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.topEvents, { color: medalColor }]}>{item.events}</Text>
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <View style={styles.customHeader}>
        <View>
          <Text style={[styles.mainTitle, { color: theme.text }]}>Participation</Text>
          <Text style={styles.subTitle}>Top 10 Leaders</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setFilter(filter === 'Yearly' ? 'All Time' : 'Yearly')}
        >
          <Text style={[styles.filterText, { color: theme.text }]}>{filter}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={top4to10}
        renderItem={({ item, index }) => (
          <View style={[styles.listItem, { borderBottomColor: theme.border }]}>
            <Text style={[styles.listRank, { color: theme.text, opacity: 0.4 }]}>{index + 4}</Text>
            <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
            <Text style={[styles.listName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.listEventsText, { color: theme.text }]}>{item.events}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={<View style={styles.topThreeWrapper}>{podiumData.map(renderTopThree)}</View>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating My Rank */}
      <View style={[styles.myRankContainer, { backgroundColor: theme.card, shadowColor: '#000', borderColor: isDark ? 'rgba(255,215,0,0.2)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
        <View style={styles.myRankContent}>
          <Text style={[styles.listRank, { color: COLORS.PRIMARY_YELLOW }]}>{myRank}</Text>
          <Image source={{ uri: myData.avatar }} style={[styles.listAvatar, { borderWidth: 2, borderColor: COLORS.PRIMARY_YELLOW }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.listName, { color: theme.text, fontWeight: 'bold' }]}>{myData.name} (Me)</Text>
          </View>
          <Text style={[styles.listEventsText, { color: COLORS.PRIMARY_YELLOW }]}>{myData.events}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  customHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold' },
  subTitle: { fontSize: 13, color: '#888' },
  filterToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 11, fontWeight: 'bold' },

  topThreeWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 35, marginTop: 10 },
  topPlayerCol: { alignItems: 'center', width: width * 0.3 },
  avatarContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  topAvatar: { borderRadius: 50, borderWidth: 3 },

  // ช่อใบไม้ล้อมรอบ
  wreathOverlay: { position: 'absolute', flexDirection: 'row', width: 150, justifyContent: 'center', opacity: 0.7 },
  leafLeft: { transform: [{ rotate: '-45deg' }, { scaleX: -1 }], marginRight: -12 },
  leafRight: { transform: [{ rotate: '45deg' }], marginLeft: -12 },

  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  rankNum: { fontSize: 11, fontWeight: 'bold', color: '#000' },

  topName: { fontWeight: 'bold', fontSize: 13, marginTop: 5 },
  topEvents: { fontWeight: '900', fontSize: 18 },

  listContent: { paddingHorizontal: 25, paddingBottom: 180 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5 },
  listRank: { width: 35, fontWeight: 'bold', fontSize: 15 },
  listAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  listName: { flex: 1, fontSize: 14 },
  listEventsText: { fontWeight: '900', fontSize: 16 },

  myRankContainer: { position: 'absolute', bottom: 90, left: 15, right: 15, borderRadius: 22, elevation: 8, shadowOpacity: 0.1, padding: 12 },
  myRankContent: { flexDirection: 'row', alignItems: 'center' }
});

export default RankScreen;