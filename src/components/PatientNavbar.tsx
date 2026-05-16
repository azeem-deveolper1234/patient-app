import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CLINIC_BRAND } from '../constants/app';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

export default function PatientNavbar() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.row}>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={[colors.primary100, colors.primary50]}
            style={styles.logo}
          >
            <Ionicons name="pulse" size={28} color={colors.primary600} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>{CLINIC_BRAND.shortName}</Text>
            <Text style={styles.sub}>{CLINIC_BRAND.portalLabel}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <View style={styles.userPill}>
            <Ionicons name="person" size={14} color={colors.primary600} />
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name}
            </Text>
          </View>
          <Pressable onPress={() => void logout()} hitSlop={12} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.slate500} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...shadows.soft,
    zIndex: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.slate800, letterSpacing: -0.3 },
  sub: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '46%' },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.slate50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.slate100,
    flexShrink: 1,
  },
  userName: { fontSize: 12, fontWeight: '600', color: colors.slate600, maxWidth: 120 },
  logoutBtn: { padding: 6 },
});
