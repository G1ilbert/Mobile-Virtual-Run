import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, useColorScheme } from 'react-native';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { MOCK_RANKINGS } from '../../constants/MockData';
import { Ionicons } from '@expo/vector-icons';
import TopNavigation from '../../components/TopNavigation';
import { getCurrentUser, getCurrentUserRank } from '../../utils/helpers';

const { width } = Dimensions.get('window');
const MEDAL_COLORS = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

export default function RankScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  const top3 = MOCK_RANKINGS.slice(0, 3);
  const top4to10 = MOCK_RANKINGS.slice(3, 10);
  const myData = getCurrentUser();
  const myRank = getCurrentUserRank();

  const podiumData = [top3[1], top3[0], top3[2]];

  const renderTopThree = (item, index) => {
    const rankPos = index === 0 ? 2 : index === 1 ? 1 : 3;
    const isFirst = rankPos === 1;
    const medalColor = MEDAL_COLORS[rankPos];

    return (
      <View key={item.id} style={[styles.topPlayerCol, isFirst && { marginTop: -20 }]}>
        <View style={styles.avatarContainer}>
          {isFirst && (
            <View style={styles.wreathOverlay}>
              <Ionicons name="leaf" size={105} color="rgba(255,215,0,0.2)" style={styles.leafLeft} />
              <Ionicons name="leaf" size={105} color="rgba(255,215,0,0.2)" style={styles.leafRight} />
            </View>
          )}
          <Image
            source={{ uri: item.avatar }}
            style={[styles.topAvatar, { borderColor: medalColor, width: isFirst ? 95 : 75, height: isFirst ? 95 : 75 }]}
          />
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
      <TopNavigation activeTab="Rank" isDark={isDark} />
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
          <Text style={[styles.listRank, { color: COLORS.PRIMARY_YELLOW, width: 35 }]}>{myRank}</Text>
          <Image source={{ uri: myData.avatar }} style={[styles.listAvatar, { borderWidth: 2, borderColor: COLORS.PRIMARY_YELLOW }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.listName, { color: theme.text, fontWeight: 'bold' }]}>{myData.name} (Me)</Text>
          </View>
          <Text style={[styles.listEventsText, { color: COLORS.PRIMARY_YELLOW }]}>{myData.events}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topThreeWrapper: {
    ...Layout.rowCenter,
    paddingTop: 40,
    paddingBottom: 30
  },
  topPlayerCol: { alignItems: 'center', width: width * 0.3 },
  avatarContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  topAvatar: { borderRadius: 50, borderWidth: 3 },
  wreathOverlay: { position: 'absolute', ...Layout.row, width: 150, justifyContent: 'center' },
  leafLeft: { transform: [{ rotate: '-45deg' }, { scaleX: -1 }], marginRight: -12 },
  leafRight: { transform: [{ rotate: '45deg' }], marginLeft: -12 },
  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    ...Layout.centerAll,
    borderWidth: 2,
    borderColor: '#FFF'
  },
  rankNum: { ...Typography.caption, fontWeight: 'bold', color: '#000' },
  topName: { fontWeight: 'bold', ...Typography.bodySmall, marginTop: 5 },
  topEvents: { fontWeight: '900', ...Typography.h4 },

  listContent: { paddingHorizontal: 25, paddingBottom: 180 },
  listItem: { ...Layout.rowCenter, paddingVertical: 15, borderBottomWidth: 0.5 },
  listRank: { width: 40, fontWeight: 'bold', ...Typography.bodyLarge },
  listAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 15 },
  listName: { flex: 1, ...Typography.body },
  listEventsText: { fontWeight: '900', ...Typography.h3, fontSize: 17 },

  myRankContainer: { position: 'absolute', bottom: 90, left: 15, right: 15, ...Components.cardLarge, elevation: 10, shadowOpacity: 0.15, padding: 15 },
  myRankContent: { ...Layout.rowCenter }
});
