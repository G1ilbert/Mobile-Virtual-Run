import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme } from './GlobalStyles';

const TopNavigation = ({ activeTab, isDark, onPressNoti, onPressSettings }) => {
  const insets = useSafeAreaInsets();
  const theme = getTheme(isDark);

  // เช็คว่าเป็นหน้า Profile หรือไม่
  const isProfilePage = activeTab === 'Profile';

  return (
    <View style={[styles.header, {
      paddingTop: insets.top,
      backgroundColor: theme.background,
    }]}>
      <View style={[
        styles.content,
        isProfilePage && { justifyContent: 'flex-end' } // ถ้าเป็น Profile ให้ดันไอคอนไปทางขวาสุด
      ]}>

        {/* Left: Logo & Name - แสดงเฉพาะเมื่อไม่ใช่หน้า Profile */}
        {!isProfilePage && (
          <View style={styles.logoSection}>
            <View style={[styles.logoPlaceholder, { backgroundColor: COLORS.PRIMARY_YELLOW }]}>
               <Text style={styles.logoText}>GS</Text>
            </View>
            <Text style={[styles.brandName, { color: COLORS.PRIMARY_YELLOW }]}>GoldStride</Text>
          </View>
        )}

        {/* Right: Notification & Settings */}
        <View style={styles.rightSection}>

          {/* ปุ่มกระดิ่งแจ้งเตือน */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={onPressNoti}
          >
            <Ionicons name="notifications" size={26} color={theme.text} />
            <View style={[styles.redBadge, { borderColor: theme.background }]} />
          </TouchableOpacity>

          {/* ปุ่มฟันเฟือง (Settings) - แสดงเฉพาะหน้า Profile */}
          {isProfilePage && (
            <TouchableOpacity
              style={[styles.iconButton, { marginLeft: 15 }]}
              activeOpacity={0.7}
              onPress={onPressSettings}
            >
              <Ionicons name="settings-outline" size={25} color={theme.text} />
            </TouchableOpacity>
          )}

        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  content: {
    height: 45, // ลดจาก 60 เหลือ 45 เพื่อความบาง
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 5, // ช่วยให้ระยะห่างด้านล่างดูไม่บวมจนเกินไป
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#212121',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
      padding: 4, // ลด padding รอบไอคอนเล็กน้อย
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
  redBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
  },
});

export default TopNavigation;