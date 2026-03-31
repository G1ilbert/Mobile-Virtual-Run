import { StyleSheet } from 'react-native';

export const COLORS = {
  PRIMARY_YELLOW: '#F2CC0F',
  DARK_BG: '#212121',
  LIGHT_BG: '#FFFFFF',
  TEXT_DARK: '#FFFFFF',
  TEXT_LIGHT: '#212121',
  // Semantic colors
  SUCCESS: '#4CD964',
  ERROR: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#007AFF',
  // Neutral grays (for theme-aware usage)
  GRAY_900: '#1A1A1A',
  GRAY_800: '#212121',
  GRAY_700: '#2C2C2C',
  GRAY_600: '#333',
  GRAY_500: '#666',
  GRAY_400: '#888',
  GRAY_300: '#AAA',
  GRAY_200: '#BBB',
  GRAY_100: '#EEE',
  GRAY_50: '#F0F0F0',
  GRAY_25: '#F5F5F5',
  GRAY_10: '#F8F9FA',
  GRAY_5: '#F9F9F9',
};

export const getTheme = (isDark) => ({
  background: isDark ? COLORS.DARK_BG : COLORS.LIGHT_BG,
  text: isDark ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT,
  card: isDark ? COLORS.GRAY_700 : COLORS.GRAY_25,
  border: isDark ? COLORS.GRAY_600 : COLORS.GRAY_100,
  // Additional semantic colors
  textSecondary: isDark ? COLORS.GRAY_300 : COLORS.GRAY_500,
  textTertiary: isDark ? COLORS.GRAY_400 : COLORS.GRAY_400,
  overlay: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
  inputBg: isDark ? COLORS.GRAY_800 : COLORS.GRAY_25,
  inputBorder: isDark ? COLORS.GRAY_600 : COLORS.GRAY_100,
});

// Typography System
export const Typography = StyleSheet.create({
  // Headers
  h1: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  h3: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  h4: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  // Body Text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  // Captions
  caption: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  captionTiny: {
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 14,
  },
  // Special
  badge: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  buttonLarge: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // Numbers/Stats
  statLarge: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  statMedium: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  statSmall: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
});

// Layout System
export const Layout = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
  },
  containerPadding: {
    flex: 1,
    padding: 20,
  },
  // Flexbox
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Spacing
  padding: {
    padding: 20,
  },
  paddingHorizontal: {
    paddingHorizontal: 20,
  },
  paddingVertical: {
    paddingVertical: 20,
  },
  marginBottom: {
    marginBottom: 20,
  },
  marginBottomSmall: {
    marginBottom: 15,
  },
  marginBottomTiny: {
    marginBottom: 12,
  },
  // Common gaps
  gapSmall: {
    gap: 10,
  },
  gapMedium: {
    gap: 15,
  },
  gapLarge: {
    gap: 20,
  },
});

// Common Component Styles
export const Components = StyleSheet.create({
  // Cards
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardMedium: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardSmall: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLarge: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  // Buttons
  button: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonLarge: {
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  // Badges
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTiny: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  // Dividers
  divider: {
    height: 1,
    opacity: 0.3,
  },
  dividerVertical: {
    width: 1,
    opacity: 0.3,
  },
  // Inputs
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 15,
    fontWeight: '500',
  },
  inputLarge: {
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 18,
    fontWeight: '900',
  },
  // Icon Containers
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSmall: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerLarge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Shared Screen-level styles (used across multiple screens)
export const ScreenStyles = StyleSheet.create({
  // Absolute-positioned bottom action bar (event detail, registration, submit)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    paddingBottom: 35,
    borderTopWidth: 1,
  },
  // Footer variant with extra bottom padding (registration, submit)
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
});

// Legacy globalStyles for backward compatibility
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
});