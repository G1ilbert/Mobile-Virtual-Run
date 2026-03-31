import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, getTheme, Typography, Layout } from '../constants/GlobalStyles';
import { useRouter } from 'expo-router';

const TopNavigation = ({ activeTab, isDark }) => {
  const insets = useSafeAreaInsets();
  const theme = getTheme(isDark);
  const router = useRouter();

  const isProfileTab = activeTab === 'Profile';

  return (
    <View style={[styles.header, {
      paddingTop: insets.top,
      backgroundColor: theme.background,
    }]}>
      <View style={styles.content}>

        {/* Left Section: Logo & Brand */}
        <View style={styles.leftSection}>
          {!isProfileTab && (
            <View style={styles.logoSection}>
                          <Image
                            source={require('../assets/logo.png')}
                            style={[
                              styles.logoImage,
                              { tintColor: '#F2CC0F' }
                            ]}
                            resizeMode="contain"
                          />
                        </View>
          )}
        </View>

        {/* Right Section: Icons */}
        <View style={styles.rightSection}>

          {/* Search Button */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => router.push('/search')}
          >
            <FontAwesome5 name="search" size={20} color={theme.text} />
          </TouchableOpacity>

          {/* Notifications Button */}
          <TouchableOpacity
            style={[styles.iconButton, { marginLeft: 15 }]}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications" size={24} color={theme.text} />
            <View style={[styles.redBadge, { borderColor: theme.background }]} />
          </TouchableOpacity>

          {/* Settings Button (Show only on Profile tab) */}
          {isProfileTab && (
            <TouchableOpacity
              style={[styles.iconButton, { marginLeft: 15 }]}
              activeOpacity={0.7}
              onPress={() => router.push('/profile/settings')}
            >
              <Ionicons name="settings-sharp" size={24} color={theme.text} />
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
    zIndex: 100,
  },
  content: {
    height: 60,
    ...Layout.rowBetween,
    paddingHorizontal: 20,

  },
  leftSection: {
    flex: 1.5,
    justifyContent: 'center',
  },
  logoSection: {
    ...Layout.rowCenter,
  },
  logoImage: {
    width: 132,
    height: 132,
    marginBottom: -30,
  },
  brandName: {
    ...Typography.h4,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rightSection: {
    flex: 1,
    ...Layout.rowCenter,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 5,
    position: 'relative',
    ...Layout.centerAll,
  },
  redBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.ERROR || '#FF3B30',
    borderWidth: 1.5,
  },
});

export default TopNavigation;
