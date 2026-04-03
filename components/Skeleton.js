import React, { useEffect, useRef } from 'react';
import { View, Animated, useColorScheme } from 'react-native';
import { getTheme } from '../constants/GlobalStyles';

export function SkeletonBox({ width, height, borderRadius = 8, style }) {
  const isDark = useColorScheme() === 'dark';
  const opacity = useRef(new Animated.Value(0.3)).current;
  const bgColor = isDark ? '#2A2A2A' : '#E0E0E0';

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: bgColor, opacity }, style]}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <View style={{ marginBottom: 20, borderRadius: 20, overflow: 'hidden' }}>
      <SkeletonBox width="100%" height={180} borderRadius={20} />
    </View>
  );
}

export function EventDetailSkeleton() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SkeletonBox width="100%" height={220} borderRadius={0} />

      <View style={{ padding: 20 }}>
        <SkeletonBox width="75%" height={26} style={{ marginBottom: 10 }} />
        <SkeletonBox width="35%" height={16} style={{ marginBottom: 24 }} />

        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          <SkeletonBox width={38} height={38} borderRadius={10} style={{ marginRight: 12 }} />
          <View>
            <SkeletonBox width={90} height={12} style={{ marginBottom: 6 }} />
            <SkeletonBox width={110} height={16} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <SkeletonBox width={38} height={38} borderRadius={10} style={{ marginRight: 12 }} />
          <View>
            <SkeletonBox width={90} height={12} style={{ marginBottom: 6 }} />
            <SkeletonBox width={110} height={16} />
          </View>
        </View>

        <SkeletonBox width="50%" height={20} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={14} style={{ marginBottom: 6 }} />
        <SkeletonBox width="90%" height={14} style={{ marginBottom: 6 }} />
        <SkeletonBox width="65%" height={14} style={{ marginBottom: 28 }} />

        <SkeletonBox width="35%" height={20} style={{ marginBottom: 14 }} />
        <SkeletonBox width="100%" height={72} borderRadius={15} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={72} borderRadius={15} />
      </View>
    </View>
  );
}
