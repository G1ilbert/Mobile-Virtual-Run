import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GOLD = '#F2CC0F';
const GOLD_FADED = 'rgba(242,204,15,0.5)';

export default function Logo({ size = 'normal' }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View style={styles.container}>
      <Text style={[
        styles.english,
        isSmall && { fontSize: 15, letterSpacing: 5 },
        isLarge && { fontSize: 28, letterSpacing: 10 },
      ]}>
        KAOTORPAI
      </Text>
      <View style={[
        styles.line,
        isSmall && { width: 70, marginVertical: 3 },
        isLarge && { width: 160, marginVertical: 6 },
      ]} />
      <Text style={[
        styles.thai,
        isSmall && { fontSize: 8, letterSpacing: 1.5 },
        isLarge && { fontSize: 14, letterSpacing: 4 },
      ]}>
        ก้าวต่อไป
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  english: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 7,
    textAlign: 'center',
  },
  line: {
    width: 110,
    height: 1,
    backgroundColor: GOLD_FADED,
    marginVertical: 4,
  },
  thai: {
    color: GOLD_FADED,
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 3,
    textAlign: 'center',
  },
});
