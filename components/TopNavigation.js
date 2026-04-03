import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme, Typography, Layout } from '../constants/GlobalStyles';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from './Logo';

const CART_KEY = 'cart';

const TopNavigation = ({ activeTab, isDark }) => {
  const insets = useSafeAreaInsets();
  const theme = getTheme(isDark);
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const isProfileTab = activeTab === 'Profile';

  // Reload cart count every time screen is focused
  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [])
  );

  const loadCartCount = async () => {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      setCartCount(cart.length);
    } catch { setCartCount(0); }
  };

  return (
    <View style={[styles.header, {
      paddingTop: insets.top,
      backgroundColor: theme.background,
    }]}>
      <View style={styles.content}>

        {/* Left Section: Logo */}
        <View style={styles.leftSection}>
          {!isProfileTab && (
            <Logo size="small" />
          )}
        </View>

        {/* Right Section: Icons */}
        <View style={styles.rightSection}>

          {/* Search */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(common)/search')}
          >
            <Ionicons name="search" size={20} color={theme.text} />
          </TouchableOpacity>

          {/* Cart */}
          <TouchableOpacity
            style={[styles.iconButton, { marginLeft: 14 }]}
            activeOpacity={0.7}
            onPress={() => router.push('/(common)/cart')}
          >
            <Ionicons name="bag-handle" size={22} color={theme.text} />
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { borderColor: theme.background }]}>
                <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={[styles.iconButton, { marginLeft: 14 }]}
            activeOpacity={0.7}
            onPress={() => router.push('/(common)/notifications')}
          >
            <Ionicons name="notifications" size={22} color={theme.text} />
            <View style={[styles.redBadge, { borderColor: theme.background }]} />
          </TouchableOpacity>

          {/* Settings (Profile tab only) */}
          {isProfileTab && (
            <TouchableOpacity
              style={[styles.iconButton, { marginLeft: 14 }]}
              activeOpacity={0.7}
              onPress={() => router.push('/profile/settings')}
            >
              <Ionicons name="settings-sharp" size={22} color={theme.text} />
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
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ERROR || '#FF3B30',
    borderWidth: 1.5,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_YELLOW,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: COLORS.DARK_BG,
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 12,
  },
});

export default TopNavigation;
