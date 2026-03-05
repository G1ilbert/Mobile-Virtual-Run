import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import { globalStyles, COLORS, getTheme } from './GlobalStyles';
import { MOCK_MY_RUNS } from './MockData';

const RunScreen = ({ isDark }) => {
  const theme = getTheme(isDark);

  const renderMyRunItem = ({ item }) => {
    const isUpcoming = item.status === 'Upcoming';
    const progress = (item.currentKm / item.targetKm) * 100;

    return (
      <TouchableOpacity activeOpacity={0.8} style={[styles.card, { backgroundColor: theme.card }]}>
        <ImageBackground source={{ uri: item.image }} style={styles.cardImage}>
          <View style={styles.overlay}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: isUpcoming ? '#555' : COLORS.PRIMARY_YELLOW }]}>
                <Text style={styles.statusLabel}>{isUpcoming ? `START IN ${item.daysUntilStart} DAYS` : 'ONGOING'}</Text>
              </View>
              {!isUpcoming && (
                <View style={styles.daysLeftBadge}><Text style={styles.daysLeftText}>{item.daysLeft} Days Left</Text></View>
              )}
            </View>
            <View>
              <Text style={styles.eventTitle}>{item.title}</Text>
              {!isUpcoming ? (
                <View style={styles.progressSection}>
                  <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.progressInfo}>{item.currentKm} / {item.targetKm} KM</Text>
                    <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
                  </View>
                </View>
              ) : ( <Text style={styles.upcomingTarget}>Target: {item.targetKm} KM</Text> )}
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={MOCK_MY_RUNS}
        renderItem={renderMyRunItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { width: '100%', height: 170, marginBottom: 15, borderRadius: 20, overflow: 'hidden', elevation: 3 },
  cardImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', padding: 15, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  statusLabel: { color: '#000', fontSize: 10, fontWeight: '900' },
  daysLeftBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  daysLeftText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  eventTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  progressSection: { marginTop: 10 },
  progressBarBg: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, marginBottom: 6 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.PRIMARY_YELLOW, borderRadius: 3 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressInfo: { color: COLORS.PRIMARY_YELLOW, fontSize: 13, fontWeight: '900' },
  percentageText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  upcomingTarget: { color: '#CCC', fontSize: 13, marginTop: 5 }
});

export default RunScreen;