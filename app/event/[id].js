import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components, ScreenStyles } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import TopNavigationBack from '../../components/TopNavigationBack';
import { getEventById } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const item = getEventById(id);

  if (!item) return null;

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={18} color={COLORS.PRIMARY_YELLOW} />
      </View>
      <View>
        <Text style={[Typography.captionSmall, { color: COLORS.GRAY_400 }]}>{label}</Text>
        <Text style={[Typography.bodySmall, { color: theme.text, fontWeight: 'bold' }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <TopNavigationBack title="Event Details" onBack={() => router.back()} isDark={isDark} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: item.image }} style={styles.coverImage} />

        <View style={styles.contentWrapper}>
          <View style={Layout.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h3, { color: theme.text }]}>{item.title}</Text>
              <View style={[Layout.rowCenter, { marginTop: 4 }]}>
                <Ionicons name="location-outline" size={14} color={COLORS.PRIMARY_YELLOW} />
                <Text style={[Typography.caption, { color: COLORS.GRAY_400, marginLeft: 4 }]}>Virtual Run</Text>
              </View>
            </View>
            <View style={[Components.badgeTiny, { backgroundColor: item.status === 'Open' ? COLORS.SUCCESS : COLORS.GRAY_400 }]}>
              <Text style={[Typography.badge, { color: COLORS.DARK_BG }]}>{item.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={[Layout.rowBetween, { marginTop: 20 }]}>
            <InfoRow icon="calendar-outline" label="Date" value={item.startDate || 'TBA'} />
            <InfoRow icon="walk-outline" label="Distance" value={item.distance || '0 km'} />
          </View>

          <View style={[Components.divider, { backgroundColor: theme.border, marginVertical: 20 }]} />

          <Text style={[Typography.sectionTitle, { color: theme.text, marginBottom: 10 }]}>Description</Text>
          <Text style={[Typography.bodyMedium, { color: theme.textSecondary, lineHeight: 22 }]}>
            {item.fullDesc || 'No description available for this event.'}
          </Text>

          <Text style={[Typography.sectionTitle, { color: theme.text, marginTop: 25, marginBottom: 15 }]}>Packages</Text>
          {item.packages?.map((pkg, index) => (
            <View key={index} style={[styles.packageCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={Layout.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.body, { color: theme.text, fontWeight: 'bold' }]}>{pkg.name}</Text>
                  <Text style={[Typography.caption, { color: COLORS.GRAY_400 }]}>{pkg.items}</Text>
                </View>
                <Text style={[Typography.bodyLarge, { color: COLORS.PRIMARY_YELLOW, fontWeight: '900' }]}>฿{pkg.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {item.status === 'Open' && (
        <View style={[ScreenStyles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[Components.buttonLarge, { backgroundColor: COLORS.PRIMARY_YELLOW }]}
            onPress={() => router.push({ pathname: '/event/register', params: { eventId: id } })}
          >
            <Text style={[Typography.buttonLarge, { color: COLORS.DARK_BG }]}>REGISTER NOW</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  coverImage: { width: width, height: width * 0.56, resizeMode: 'cover' },
  contentWrapper: { ...Layout.padding },
  infoRow: { ...Layout.rowCenter, width: '48%' },
  iconBox: { ...Components.iconContainerSmall, marginRight: 10, borderRadius: 10 },
  packageCard: {
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 12
  }
});
