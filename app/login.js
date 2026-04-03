import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, useColorScheme, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, getTheme, Typography } from '../constants/GlobalStyles';
import Logo from '../components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Required for Google auth session redirect on web
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '340544898744-p2hol0d5g65rioe339944t2cha99jaq7.apps.googleusercontent.com';

const isGoogleConfigured = true;

// Force Expo auth proxy for HTTPS redirect URI
const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
console.log('Google OAuth Redirect URI:', redirectUri);

const Google = require('expo-auth-session/providers/google');
const useGoogleAuth = () => Google.useIdTokenAuthRequest({
  expoClientId: GOOGLE_WEB_CLIENT_ID,
  webClientId: GOOGLE_WEB_CLIENT_ID,
  androidClientId: '340544898744-v1qklo3hblep8kl27a34hao5g187t48c.apps.googleusercontent.com',
  redirectUri,
});

// Wrapper component for Google button (isolates the hook)
function GoogleSignInButton({ onToken, isLoading, isRegister, theme }) {
  if (!useGoogleAuth) return null;

  const [request, response, promptAsync] = useGoogleAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const { id_token } = response.params;
      onToken(id_token);
    } else if (response.type === 'error' || response.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response]);

  const handlePress = () => {
    setGoogleLoading(true);
    promptAsync({ useProxy: true });
  };

  const disabled = !request || isLoading || googleLoading;

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={{
          backgroundColor: '#ffffff',
          paddingVertical: 14,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#dadce0',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {googleLoading ? (
          <ActivityIndicator color="#212121" />
        ) : (
          <>
            <View style={{
              width: 24, height: 24, marginRight: 10,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#4285F4' }}>G</Text>
            </View>
            <Text style={{ color: '#212121', fontSize: 15, fontWeight: '600' }}>
              {isRegister ? 'สมัครด้วย Google' : 'เข้าสู่ระบบด้วย Google'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
        <Text style={{ marginHorizontal: 16, color: theme.textTertiary, fontSize: 13 }}>หรือ</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
      </View>
    </>
  );
}

export default function LoginScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const { loginWithEmail, registerWithEmail, loginWithGoogle, error, setError } = useAuth();
  const { redirect } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleToken = async (idToken) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(idToken);
      router.replace(redirect || '/(tabs)');
    } catch (err) {
      // Error is set by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (isRegister && !username.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อผู้ใช้');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await registerWithEmail(email.trim(), password, username.trim());
      } else {
        await loginWithEmail(email.trim(), password);
      }
      router.replace(redirect || '/(tabs)');
    } catch (err) {
      // Error is set by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Close button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 8, left: 16, zIndex: 10, padding: 8 }}
      >
        <Ionicons name="close" size={28} color={theme.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Logo size="large" />
        </View>

        {/* Title */}
        <Text style={{ ...Typography.h2, color: theme.text, textAlign: 'center', marginBottom: 24 }}>
          {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </Text>

        {/* Error */}
        {error && (
          <View style={{ backgroundColor: '#d32f2f20', padding: 12, borderRadius: 10, marginBottom: 16 }}>
            <Text style={{ color: '#ef5350', fontSize: 14, textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        {/* Google Sign-In — only rendered when configured */}
        {isGoogleConfigured && (
          <GoogleSignInButton
            onToken={handleGoogleToken}
            isLoading={loading}
            isRegister={isRegister}
            theme={theme}
          />
        )}

        {/* Username (register only) */}
        {isRegister && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 6 }}>ชื่อผู้ใช้</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              style={{
                backgroundColor: theme.inputBg,
                borderWidth: 1,
                borderColor: theme.inputBorder,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: theme.text,
              }}
            />
          </View>
        )}

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 6 }}>อีเมล</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor={theme.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: theme.inputBg,
              borderWidth: 1,
              borderColor: theme.inputBorder,
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              color: theme.text,
            }}
          />
        </View>

        {/* Password */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 6 }}>รหัสผ่าน</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry
            style={{
              backgroundColor: theme.inputBg,
              borderWidth: 1,
              borderColor: theme.inputBorder,
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              color: theme.text,
            }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: COLORS.PRIMARY_YELLOW,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#212121" />
          ) : (
            <Text style={{ color: '#212121', fontSize: 16, fontWeight: '700' }}>
              {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle */}
        <TouchableOpacity
          onPress={() => { setIsRegister(!isRegister); setError(null); }}
          style={{ marginTop: 20, alignItems: 'center' }}
        >
          <Text style={{ color: COLORS.PRIMARY_YELLOW, fontSize: 14 }}>
            {isRegister ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
