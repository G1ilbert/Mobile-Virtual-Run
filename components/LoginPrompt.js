import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme, Typography } from '../constants/GlobalStyles';

export default function LoginPrompt({ message }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
      <Ionicons name="lock-closed-outline" size={60} color={theme.border} />
      <Text style={{ ...Typography.h3, color: theme.text, marginTop: 16, textAlign: 'center' }}>
        Login Required
      </Text>
      <Text style={{ color: theme.textSecondary, marginTop: 8, textAlign: 'center', fontSize: 14 }}>
        {message || 'Please log in to access this feature'}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.PRIMARY_YELLOW,
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 14,
          marginTop: 24,
        }}
        onPress={() => router.push('/login')}
      >
        <Text style={{ color: COLORS.DARK_BG, fontWeight: '700', fontSize: 16 }}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}
