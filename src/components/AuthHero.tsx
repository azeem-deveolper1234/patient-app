import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type AuthHeroProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconSize: number;
  title: string;
  subtitle: string;
  /** Register screen thoda compact */
  compact?: boolean;
};

/** Typing par form re-render ho, hero (gradient + icons) nahi — low-end Android par smooth */
function AuthHeroInner({ icon, iconSize, title, subtitle, compact }: AuthHeroProps) {
  const paddingVertical = compact ? 28 : 32;
  const wrap = compact ? styles.heroIconSm : styles.heroIcon;
  const titleStyle = compact ? styles.heroTitleSm : styles.heroTitle;
  return (
    <LinearGradient
      colors={[colors.primary600, colors.primary800]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingVertical }]}
    >
      <View style={wrap}>
        <Ionicons name={icon} size={iconSize} color="#fff" />
      </View>
      <Text style={titleStyle}>{title}</Text>
      <Text style={styles.heroSub}>{subtitle}</Text>
    </LinearGradient>
  );
}

export default memo(AuthHeroInner);

const baseIcon = {
  borderRadius: 16,
  backgroundColor: 'rgba(255,255,255,0.2)',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
};

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, alignItems: 'center' },
  heroIcon: {
    ...baseIcon,
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  heroIconSm: {
    ...baseIcon,
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  heroTitleSm: { color: '#fff', fontSize: 20, fontWeight: '700' },
  heroSub: { color: colors.primary100, fontSize: 13, marginTop: 6, fontWeight: '500' },
});
