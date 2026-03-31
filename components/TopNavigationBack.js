import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, Typography, Layout } from '../constants/GlobalStyles';
import { useRouter } from 'expo-router';

const TopNavigationBack = ({ title, onBack, isDark }) => {
  const insets = useSafeAreaInsets();
  const theme = getTheme(isDark);
  const router = useRouter();

  const handleBack = onBack || (() => router.back());

  return (
    <View style={[styles.header, {
      paddingTop: insets.top,
      backgroundColor: theme.background,
      borderBottomColor: theme.border,
      borderBottomWidth: 0.5
    }]}>
      <View style={styles.content}>

        {/* Left: Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="return-down-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Center: Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, { color: theme.text }]}>{title}</Text>
        </View>

        {/* Right: Empty View */}
        <View style={styles.rightPlaceholder} />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { width: '100%' },
  content: {
    height: 56,
    ...Layout.rowBetween,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    ...Typography.sectionTitle,
  },
  rightPlaceholder: {
    width: 40,
  }
});

export default TopNavigationBack;
