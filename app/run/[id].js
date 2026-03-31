import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, COLORS, getTheme, Typography, Layout } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { calcProgress } from '../../utils/helpers';

export default function RunDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();

  const item = {
    title: params.title,
    status: params.status,
    currentKm: parseFloat(params.currentKm) || 0,
    targetKm: parseFloat(params.targetKm) || 0,
    daysLeft: parseInt(params.daysLeft) || 0,
    image: params.image,
    finishersCount: parseInt(params.finishersCount) || 0,
    totalSlots: parseInt(params.totalSlots) || 1200,
    daysUntilStart: parseInt(params.daysUntilStart) || 0,
  };

  const remainingKm = Math.max(0, item.targetKm - item.currentKm);
  const avgPerDay = item.daysLeft > 0 ? (remainingKm / item.daysLeft).toFixed(2) : 0;
  const progress = calcProgress(item.currentKm, item.targetKm);

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <TopNavigationBack
        title="Run Details"
        onBack={() => router.back()}
        isDark={isDark}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: item.image }} style={styles.banner} />

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>

          <View style={Layout.rowBetween}>
            <View>
              <Text style={styles.label}>Goal</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{item.targetKm} KM</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.label, { color: COLORS.PRIMARY_YELLOW }]}>Achieved</Text>
              <Text style={[styles.statValue, { color: COLORS.PRIMARY_YELLOW }]}>{item.currentKm} KM</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Ionicons name="trophy" size={20} color={COLORS.PRIMARY_YELLOW} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Finishers: {item.finishersCount} / {item.totalSlots}
            </Text>
          </View>

          {item.status !== 'Upcoming' && (
            <View style={[styles.highlightCard, { borderColor: COLORS.PRIMARY_YELLOW }]}>
              <Text style={styles.label}>Daily Target Required</Text>
              <Text style={styles.avgValue}>{avgPerDay} <Text style={styles.unit}>KM/Day</Text></Text>
              <Text style={styles.subText}>{remainingKm} KM left • {item.daysLeft} days remaining</Text>
            </View>
          )}

          <View style={styles.progressSection}>
            <View style={Layout.rowBetween}>
              <Text style={styles.label}>Progress</Text>
              <Text style={[styles.percent, { color: COLORS.PRIMARY_YELLOW }]}>{Math.round(progress)}%</Text>
            </View>
            <View style={[styles.barBg, { backgroundColor: theme.border }]}>
              <View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 220, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { ...Typography.h3, fontWeight: 'bold', marginBottom: 20 },
  label: { ...Typography.caption, color: COLORS.GRAY_400, textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: '900' },
  infoCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginVertical: 20 },
  infoText: { marginLeft: 10, fontWeight: 'bold' },
  highlightCard: { padding: 20, borderRadius: 15, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center' },
  avgValue: { fontSize: 32, fontWeight: '900', color: COLORS.PRIMARY_YELLOW, marginVertical: 5 },
  unit: { fontSize: 16 },
  subText: { ...Typography.captionSmall, color: COLORS.GRAY_400 },
  progressSection: { marginTop: 25 },
  percent: { fontWeight: 'bold' },
  barBg: { width: '100%', height: 10, borderRadius: 5, marginTop: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.PRIMARY_YELLOW }
});
