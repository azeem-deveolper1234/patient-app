import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import type { PatientTabParamList } from '../../navigation/types';

export default function HomeTab() {
  const navigation = useNavigation<MaterialTopTabNavigationProp<PatientTabParamList>>();
  const { userName, queueStatus, doctors, handleCancelQueue, loading } = usePatientPortal();
  const firstName = userName.split(' ')[0] || userName;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Expected Arrival Time
  const getExpectedArrivalTime = (estimatedMinutes: number) => {
    if (estimatedMinutes < 0) return 'N/A';
    const arrival = new Date(Date.now() + estimatedMinutes * 60000);
    return arrival.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Gradient based on Proximity
  const getProximityGradient = (peopleAhead: number, status: string): [string, string] => {
    if (status === 'serving' || peopleAhead === 0) {
      return ['#16a34a', '#15803d']; // Green
    }
    if (peopleAhead <= 2) {
      return ['#dc2626', '#b91c1c']; // Red
    }
    if (peopleAhead <= 5) {
      return ['#ca8a04', '#a16207']; // Yellow
    }
    return [colors.primary600, colors.primary800]; // Blue
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.head}>
        <Text style={styles.h2}>Good morning, {firstName}!</Text>
        <Text style={styles.muted}>Here is your health overview for today.</Text>
      </View>

      {queueStatus ? (
        <LinearGradient
          colors={getProximityGradient(queueStatus.peopleAhead, queueStatus.status)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradCard}
        >
          <View style={styles.watermark} pointerEvents="none">
            <Ionicons name="pulse" size={180} color="rgba(255,255,255,0.08)" />
          </View>
          <View style={styles.gradInner}>
            <View>
              <View
                style={[
                  styles.badge,
                  queueStatus.status === 'serving' ? styles.badgeLight : styles.badgeDim,
                ]}
              >
                <Ionicons
                  name={queueStatus.status === 'serving' ? 'checkmark-circle' : 'time'}
                  size={14}
                  color={queueStatus.status === 'serving' ? colors.green600 : '#fff'}
                />
                <Text
                  style={[
                    styles.badgeText,
                    queueStatus.status === 'serving' && { color: colors.green600 },
                  ]}
                >
                  {queueStatus.status === 'serving' ? 'Currently Serving You' : 'Waiting in Queue'}
                </Text>
              </View>
              <Text style={styles.tokenHuge}>Token #{queueStatus.yourToken}</Text>
              <Text style={styles.drSub}>
                <Ionicons name="person" size={14} color={colors.primary100} /> Dr.{' '}
                {queueStatus.serviceName}
              </Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{queueStatus.peopleAhead}</Text>
                <Text style={styles.statLbl}>Ahead</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{queueStatus.estimatedTime}m</Text>
                <Text style={styles.statLbl}>Wait Time</Text>
              </View>
            </View>

            {/* Expected Arrival time */}
            <View style={styles.arrivalRow}>
              <Ionicons name="time" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.arrivalText}>
                Expected Arrival: {getExpectedArrivalTime(queueStatus.estimatedTime)}
              </Text>
            </View>
          </View>
          <View style={styles.gradFooter}>
            <Pressable
              style={styles.cancelGrad}
              onPress={handleCancelQueue}
              disabled={loading}
            >
              <Text style={styles.cancelGradText}>Cancel Queue</Text>
            </Pressable>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar" size={40} color={colors.slate300} />
          </View>
          <Text style={styles.emptyTitle}>No active appointments</Text>
          <Text style={styles.emptySub}>
            {"You're all caught up. Book an appointment if you need to consult a doctor."}
          </Text>
          <Pressable
            style={styles.cta}
            onPress={() => navigation.jumpTo('Book')}
          >
            <Text style={styles.ctaText}>Book Appointment</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>Our Specialists</Text>
      <View style={styles.docGrid}>
        {doctors.map((doc) => (
          <View key={doc._id} style={styles.docCard}>
            <View style={styles.docRow}>
              <View style={styles.docAvatar}>
                <Ionicons name="person" size={28} color={colors.secondary600} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>Dr. {doc.name}</Text>
                <Text style={styles.docSpec}>{doc.specialization}</Text>
                <View style={styles.docMeta}>
                  <Ionicons name="time-outline" size={14} color={colors.slate400} />
                  <Text style={styles.docMetaText}>{doc.slotDuration} min consultation</Text>
                </View>
                <View style={styles.docMeta}>
                  <Ionicons name="cash-outline" size={14} color={colors.slate400} />
                  <Text style={styles.docMetaText}>Rs. {doc.consultationFee}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.slate50 },
  content: { padding: 16, paddingBottom: 32 },
  head: { marginBottom: 20 },
  h2: { fontSize: 22, fontWeight: '700', color: colors.slate800, letterSpacing: -0.3 },
  muted: { color: colors.slate500, marginTop: 4, fontSize: 14 },
  gradCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...shadows.glow,
  },
  watermark: { position: 'absolute', right: -20, top: 8 },
  gradInner: { gap: 20 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeLight: { backgroundColor: '#fff' },
  badgeDim: { backgroundColor: 'rgba(255,255,255,0.2)' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tokenHuge: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  drSub: { color: colors.primary100, fontSize: 15, marginTop: 8, fontWeight: '500' },
  statRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statNum: { fontSize: 28, fontWeight: '700', color: '#fff' },
  statLbl: {
    color: colors.primary100,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  gradFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    alignItems: 'flex-end',
  },
  cancelGrad: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelGradText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 8,
    marginTop: 4,
  },
  arrivalText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    ...shadows.soft,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.slate800 },
  emptySub: {
    color: colors.slate500,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 20,
  },
  cta: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary600,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.slate800, marginBottom: 12 },
  docGrid: { gap: 14 },
  docCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    ...shadows.soft,
  },
  docRow: { flexDirection: 'row', gap: 14 },
  docAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: { fontSize: 17, fontWeight: '700', color: colors.slate800 },
  docSpec: { color: colors.primary600, fontWeight: '600', fontSize: 13, marginTop: 2, marginBottom: 8 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  docMetaText: { fontSize: 12, color: colors.slate500, fontWeight: '500' },
});
