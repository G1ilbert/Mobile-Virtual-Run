import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Octicons, FontAwesome5, MaterialIcons, FontAwesome6, FontAwesome } from '@expo/vector-icons';
import { COLORS, getTheme } from './GlobalStyles';

const BottomNavigation = ({ activeTab, setActiveTab, isDark }) => {
  const insets = useSafeAreaInsets();
  const theme = getTheme(isDark);

  const leftTabs = [
    { id: 'Home', lib: Octicons, name: 'home-fill' },
    { id: 'Run', lib: FontAwesome5, name: 'running' },
  ];

  const rightTabs = [
    { id: 'Rank', lib: MaterialIcons, name: 'leaderboard' },
    { id: 'Profile', lib: FontAwesome6, name: 'user-large' },
  ];

  const renderTab = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={styles.item}
      onPress={() => setActiveTab(tab.id)}
      activeOpacity={1}
    >
      <tab.lib
        name={tab.name}
        size={22}
        color={activeTab === tab.id ? COLORS.PRIMARY_YELLOW : (isDark ? '#888' : '#AAA')}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[
      styles.nav,
      {
        // จัดการระยะล่างตาม SafeArea ของแต่ละเครื่อง
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        backgroundColor: theme.background,
        borderTopColor: theme.border
      }
    ]}>
      {leftTabs.map(renderTab)}

      {/* ปุ่มบวกตรงกลางที่ทับเส้นขอบพอดี */}
      <View style={styles.centerButtonWrapper}>
        <TouchableOpacity
          style={[styles.submitContainer, { backgroundColor: theme.background }]}
          onPress={() => setActiveTab('Submit')}
          activeOpacity={0.8}
        >
          <FontAwesome name="plus-circle" size={48} color={COLORS.PRIMARY_YELLOW} />
        </TouchableOpacity>
      </View>

      {rightTabs.map(renderTab)}
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 0.5,
    // --- จุดที่ปรับให้ขอบมาใกล้ไอคอน ---
    paddingTop: 4, // ลดจาก 8 เหลือ 4 เพื่อให้เส้นขอบลงมาใกล้ไอคอนที่สุด
    alignItems: 'center',
    zIndex: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44, // กำหนดความสูงพื้นที่กดให้แน่นอน
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    // ดันปุ่มขึ้นไปทับเส้นขอบที่ขยับลงมา
    marginTop: -32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default BottomNavigation;