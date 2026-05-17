import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CLINIC_BRAND } from '../constants/app';
import { useAuth } from '../context/AuthContext';
import { usePatientPortal } from '../context/PatientPortalContext';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

export default function PatientNavbar() {
  const { user, logout } = useAuth();
  const { inAppNotification, setInAppNotification } = usePatientPortal();
  const insets = useSafeAreaInsets();
  
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (inAppNotification) {
      Animated.spring(slideAnim, {
        toValue: insets.top + 20,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [inAppNotification, slideAnim, insets.top]);

  return (
    <>
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
      
      <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }] }]} pointerEvents={inAppNotification ? 'auto' : 'none'}>
        <View style={styles.toastInner}>
          <Ionicons name="notifications" size={26} color={colors.white} />
          <View style={styles.toastTextCont}>
             <Text style={styles.toastTitle}>{inAppNotification?.title}</Text>
             <Text style={styles.toastBody}>{inAppNotification?.body}</Text>
          </View>
          <Pressable onPress={() => setInAppNotification(null)} hitSlop={10} style={{ padding: 4 }}>
             <Ionicons name="close" size={20} color={colors.white} />
          </Pressable>
        </View>
      </Animated.View>
    </>
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
  toast: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 100,
    ...shadows.glow,
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary600,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  toastTextCont: { flex: 1 },
  toastTitle: { color: colors.white, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  toastBody: { color: colors.primary100, fontSize: 13, lineHeight: 18 },
});
