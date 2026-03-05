import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import { globalStyles, COLORS, getTheme } from './GlobalStyles';
import { MOCK_EVENTS } from './MockData';

// เพิ่ม Props onSelectEvent เข้ามา
const HomeScreen = ({ isDark, onSelectEvent }) => {
  const theme = getTheme(isDark);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Open': return { bg: '#4CD964', text: 'REGISTER NOW', subText: 'Ends in' };
      case 'Ongoing': return { bg: COLORS.PRIMARY_YELLOW, text: 'ONGOING', subText: 'Submit in' };
      case 'Complete': return { bg: '#8E8E93', text: 'FINISHED', subText: null };
      default: return { bg: '#888', text: status, subText: null };
    }
  };

  const renderEventItem = ({ item }) => {
    const config = getStatusConfig(item.status);
    const showDays = item.daysLeft > 0 && item.status !== 'Complete';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, { backgroundColor: theme.card }]}
        // เมื่อกด จะส่งข้อมูลของงาน (item) กลับไปเพื่อเปิดหน้า Detail
        onPress={() => onSelectEvent(item)}
      >
        <ImageBackground source={{ uri: item.image }} style={styles.cardImage}>
          <View style={styles.overlay}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                <Text style={styles.statusText}>{config.text}</Text>
              </View>

              {showDays && (
                <View style={styles.daysBadge}>
                   <Text style={styles.daysSubText}>{config.subText}</Text>
                   <Text style={styles.daysText}>{item.daysLeft} Days</Text>
                </View>
              )}
            </View>

            <View>
              <Text style={styles.eventTitle}>{item.title}</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={MOCK_EVENTS}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 15,
          paddingBottom: 100
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
// ... styles เหมือนเดิม

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardImage: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 18,
    justifyContent: 'space-between'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8
  },
  statusText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  daysBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  daysSubText: {
    color: '#BBB',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 1
  },
  daysText: {
    color: COLORS.PRIMARY_YELLOW,
    fontSize: 12,
    fontWeight: '900'
  },
  eventTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 10
  }
});

export default HomeScreen;