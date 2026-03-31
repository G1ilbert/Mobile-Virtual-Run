import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, Typography, Components } from '../constants/GlobalStyles';

/**
 * Reusable form input with label.
 * Used in: event/register.js, (tabs)/submit.js
 *
 * Props:
 *  - label: string (field label)
 *  - placeholder: string
 *  - value: string
 *  - onChangeText: function
 *  - theme: object from getTheme()
 *  - multiline: boolean (default false)
 *  - keyboardType: string (default 'default')
 */
const FormInput = ({ label, placeholder, value, onChangeText, theme, multiline = false, keyboardType = 'default' }) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.card,
          color: theme.text,
          borderColor: theme.border,
          height: multiline ? 100 : 50,
          textAlignVertical: multiline ? 'top' : 'center'
        }
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.textTertiary}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 18 },
  label: { ...Typography.bodySmall, marginBottom: 8, opacity: 0.8 },
  input: { ...Components.input },
});

export default FormInput;
