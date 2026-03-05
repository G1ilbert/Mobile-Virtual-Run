import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from './GlobalStyles'; // ปรับ Path ตามที่วางไฟล์

const TopNavigationBack = ({ title, onBack, isDark }) => {
  const insets = useSafeAreaInsets();
  const theme = getTheme(isDark);

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
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="return-down-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Center: Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, { color: theme.text }]}>{title}</Text>
        </View>

        {/* Right: Empty View เพื่อให้ Title อยู่ตรงกลางพอดี */}
        <View style={styles.rightPlaceholder} />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { width: '100%' },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightPlaceholder: {
    width: 40, // เท่ากับความกว้างของปุ่ม Back เพื่อ Balance
  }
});

export default TopNavigationBack;