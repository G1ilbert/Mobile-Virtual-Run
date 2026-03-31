import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import { MOCK_EVENTS } from '../../constants/MockData';
import TopNavigation from '../../components/TopNavigation';
import { getStatusConfig } from '../../utils/helpers';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const renderEventItem = ({ item }) => {
    const config = getStatusConfig(item.status);
    const showDays = item.daysLeft > 0 && item.status !== 'Complete';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/event/${item.id}`)}
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
      <TopNavigation activeTab="Home" isDark={isDark} />
      <FlatList
        data={MOCK_EVENTS}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[Layout.padding, { paddingTop: 15, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    ...Components.card,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  cardImage: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 18,
    justifyContent: 'space-between'
  },
  cardHeader: {
    ...Layout.rowBetween,
    alignItems: 'flex-start'
  },
  statusBadge: {
    ...Components.badge,
  },
  statusText: {
    color: COLORS.DARK_BG,
    ...Typography.badge,
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
    color: COLORS.GRAY_200,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 1
  },
  daysText: {
    color: COLORS.PRIMARY_YELLOW,
    ...Typography.caption,
    fontWeight: '900'
  },
  eventTitle: {
    color: COLORS.TEXT_DARK,
    ...Typography.h3,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 10
  }
});
