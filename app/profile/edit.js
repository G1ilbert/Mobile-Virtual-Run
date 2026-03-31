import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, getTheme, Typography, Layout, Components } from '../../constants/GlobalStyles';
import TopNavigationBack from '../../components/TopNavigationBack';

export default function EditProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();

  const initialData = {
    username: 'You',
    firstName: 'Gold',
    lastName: 'Stride',
    phone: '098-765-4321',
    address: '123/45 Sukhumvit Rd, Bangkok'
  };

  const [form, setForm] = useState(initialData);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <TopNavigationBack title="Personal Info" onBack={() => router.back()} isDark={isDark} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <InputGroup
              label="Username"
              value={form.username}
              onChange={(v) => setForm({...form, username: v})}
              theme={theme}
            />
            <InputGroup
              label="First Name"
              value={form.firstName}
              onChange={(v) => setForm({...form, firstName: v})}
              theme={theme}
            />
            <InputGroup
              label="Last Name"
              value={form.lastName}
              onChange={(v) => setForm({...form, lastName: v})}
              theme={theme}
            />
            <InputGroup
              label="Phone Number"
              value={form.phone}
              onChange={(v) => setForm({...form, phone: v})}
              theme={theme}
              keyboardType="phone-pad"
            />

            <View style={styles.inputBox}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, { color: theme.text, height: 80, textAlignVertical: 'top' }]}
                value={form.address}
                multiline
                onChangeText={(v) => setForm({...form, address: v})}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => Alert.alert("Saved", "Data updated!", [{ text: "OK", onPress: () => router.back() }])}
          >
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputGroup = ({ label, value, onChange, theme, keyboardType = 'default' }) => (
  <View style={[styles.inputBox, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, { color: theme.text }]}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      placeholderTextColor={theme.textTertiary}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { ...Layout.padding, paddingBottom: 40 },
  card: { ...Components.cardLarge, borderWidth: 1, paddingHorizontal: 20, overflow: 'hidden' },
  inputBox: { paddingVertical: 15 },
  label: { ...Typography.caption, color: COLORS.PRIMARY_YELLOW, fontWeight: 'bold', marginBottom: 5 },
  input: { ...Typography.bodyLarge, paddingVertical: 5 },
  saveBtn: {
    backgroundColor: COLORS.PRIMARY_YELLOW,
    ...Components.buttonLarge,
    marginTop: 30,
    shadowColor: COLORS.PRIMARY_YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  saveBtnText: { ...Typography.buttonLarge, color: COLORS.DARK_BG, fontWeight: 'bold' }
});
