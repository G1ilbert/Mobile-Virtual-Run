import { StyleSheet } from 'react-native';

export const COLORS = {
  PRIMARY_YELLOW: '#F2CC0F',
  DARK_BG: '#212121',
  LIGHT_BG: '#FFFFFF',
  TEXT_DARK: '#FFFFFF',
  TEXT_LIGHT: '#212121',
};

// ตรวจสอบว่ามีคำว่า export หน้า const getTheme
export const getTheme = (isDark) => ({
  background: isDark ? COLORS.DARK_BG : COLORS.LIGHT_BG,
  text: isDark ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT,
  card: isDark ? '#2C2C2C' : '#F5F5F5',
  border: isDark ? '#333' : '#EEE',
});

// ตรวจสอบว่ามีคำว่า container อยู่ข้างในนี้
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  }
});