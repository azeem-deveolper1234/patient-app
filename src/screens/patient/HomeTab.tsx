import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Vibration,
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
      return ['#0d9488', '#0f766e']; // Dynamic Green/Teal (serving)
    }
    if (peopleAhead <= 2) {
      return ['#e11d48', '#be123c']; // Glowing Rose/Red (urgent)
    }
    if (peopleAhead <= 5) {
      return ['#d97706', '#b45309']; // Warm Amber (medium wait)
    }
    return ['#3b82f6', '#1d4ed8']; // Royal Blue (normal wait)
  };

  // Spec icon selector
  const getSpecIcon = (spec: string): keyof typeof Ionicons.glyphMap => {
    const clean = spec.toLowerCase();
    if (clean.includes('heart') || clean.includes('cardio')) return 'heart-outline';
    if (clean.includes('pediatric') || clean.includes('child')) return 'gift-outline';
    if (clean.includes('dent')) return 'shield-checkmark-outline';
    if (clean.includes('derm') || clean.includes('skin')) return 'sparkles-outline';
    if (clean.includes('eye') || clean.includes('opthal')) return 'eye-outline';
    if (clean.includes('physiotherapist') || clean.includes('therapy')) return 'body-outline';
    return 'pulse-outline';
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onCancelPress = () => {
    Vibration.vibrate(100);
    handleCancelQueue();
  };

  return (
    <View style={styles.root}>
      {/* Background Ambient Glows */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <ScrollView 
        style={styles.flex} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Header Area */}
          <View style={styles.head}>
            <Text style={styles.greeting}>
              Salaam, <Text style={styles.greetingHighlight}>{firstName}!</Text>
            </Text>
            <Text style={styles.muted}>Aapki sehat hamari sabse barhi tarjeeh hai.</Text>
          </View>

          {/* Active Queue Ticket (Boarding Pass design) */}
          {queueStatus ? (
            <View style={styles.ticketContainer}>
              <LinearGradient
                colors={getProximityGradient(queueStatus.peopleAhead, queueStatus.status)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradCard}
              >
                {/* Background Watermark Symbol */}
                <View style={styles.watermark} pointerEvents="none">
                  <Ionicons name="pulse" size={170} color="rgba(255,255,255,0.06)" />
                </View>

                {/* Ticket Top Half */}
                <View style={styles.ticketTop}>
                  <View style={styles.ticketBadgeRow}>
                    <View style={styles.liveBadge}>
                      <View style={styles.livePulse} />
                      <Text style={styles.liveText}>LIVE PASS</Text>
                    </View>
                    <Text style={styles.specialtyText}>
                      {(queueStatus.serviceName || '').toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.ticketMainRow}>
                    <View>
                      <Text style={styles.tokenLabel}>TOKEN NUMBER</Text>
                      <Text style={styles.tokenHuge}>{queueStatus.yourToken}</Text>
                    </View>
                    <View style={styles.statusBox}>
                      <Ionicons
                        name={queueStatus.status === 'serving' ? 'checkmark-circle' : 'time-outline'}
                        size={20}
                        color="#ffffff"
                      />
                      <Text style={styles.statusText}>
                        {queueStatus.status === 'serving' ? 'SERVING NOW' : 'WAITING'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Ticket Punch/Dash Line Separator */}
                <View style={styles.ticketSeparatorContainer} pointerEvents="none">
                  <View style={styles.leftPunch} />
                  <View style={styles.dashLine} />
                  <View style={styles.rightPunch} />
                </View>

                {/* Ticket Bottom Half */}
                <View style={styles.ticketBottom}>
                  <View style={styles.statRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>{queueStatus.peopleAhead}</Text>
                      <Text style={styles.statLbl}>Patients Ahead</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>{queueStatus.estimatedTime}m</Text>
                      <Text style={styles.statLbl}>Wait Time</Text>
                    </View>
                  </View>

                  <View style={styles.arrivalRow}>
                    <Ionicons name="time" size={18} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.arrivalText}>
                      Expected Arrival: {getExpectedArrivalTime(queueStatus.estimatedTime)}
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.cancelGrad,
                      pressed && styles.cancelGradPressed
                    ]}
                    onPress={onCancelPress}
                    disabled={loading}
                  >
                    <Text style={styles.cancelGradText}>Cancel Appointment</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          ) : (
            /* Empty Queue - CTA Card */
            <View style={styles.emptyCard}>
              <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.emptyInner}
              >
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="calendar-outline" size={32} color={colors.primary500} />
                </View>
                <Text style={styles.emptyTitle}>No Active Appointment</Text>
                <Text style={styles.emptySub}>
                  Koi active token nahi mila. Doctor se consult karne ke liye naya appointment book karein.
                </Text>
                
                <Pressable
                  onPress={() => {
                    Vibration.vibrate(40);
                    navigation.jumpTo('Book');
                  }}
                  style={({ pressed }) => [
                    styles.ctaBtn,
                    pressed && styles.ctaBtnPressed
                  ]}
                >
                  <LinearGradient
                    colors={[colors.primary500, '#0d9488']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGrad}
                  >
                    <Text style={styles.ctaText}>Book Appointment Now</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </LinearGradient>
            </View>
          )}

          {/* Specialists Header */}
          <Text style={styles.sectionTitle}>Our Panel Specialists</Text>
          
          {/* Specialists Grid */}
          <View style={styles.docGrid}>
            {doctors.map((doc, idx) => (
              <Animated.View key={doc._id} style={styles.docCardContainer}>
                <LinearGradient
                  colors={['#111827', '#0b0f19']}
                  style={styles.docCard}
                >
                  <View style={styles.docRow}>
                    <LinearGradient
                      colors={[colors.primary900, '#115e59']}
                      style={styles.docAvatar}
                    >
                      <Ionicons name={getSpecIcon(doc.specialization)} size={24} color={colors.primary500} />
                    </LinearGradient>
                    
                    <View style={styles.docInfo}>
                      <Text style={styles.docName}>Dr. {doc.name}</Text>
                      <Text style={styles.docSpec}>{doc.specialization.toUpperCase()}</Text>
                      
                      <View style={styles.docMetaRow}>
                        <View style={styles.docMetaBadge}>
                          <Ionicons name="time-outline" size={12} color={colors.primary100} />
                          <Text style={styles.docMetaText}>{doc.slotDuration} Mins</Text>
                        </View>
                        <View style={styles.docMetaBadge}>
                          <Ionicons name="wallet-outline" size={12} color="#ccfbf1" style={{ marginRight: 2 }} />
                          <Text style={styles.docMetaText}>PKR {doc.consultationFee}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070a13', position: 'relative' },
  flex: { flex: 1 },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    opacity: 0.8,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    opacity: 0.8,
  },
  content: { padding: 20, paddingBottom: 40 },
  head: { marginBottom: 24, marginTop: 10 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  greetingHighlight: { color: colors.primary500 },
  muted: { color: '#64748b', marginTop: 6, fontSize: 14, fontWeight: '500' },
  
  // Boarding Pass Ticket style
  ticketContainer: {
    marginBottom: 28,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradCard: { padding: 24, position: 'relative', overflow: 'hidden' },
  watermark: { position: 'absolute', right: -30, top: -20 },
  ticketTop: { gap: 14 },
  ticketBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 6,
  },
  livePulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#fff',
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  specialtyText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  ticketMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 },
  tokenLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  tokenHuge: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: -1, marginTop: 2 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  
  // Separation punch line
  ticketSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -24,
    marginVertical: 18,
    position: 'relative',
  },
  leftPunch: {
    width: 16,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#070a13',
  },
  rightPunch: {
    width: 16,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#070a13',
  },
  dashLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 10,
  },
  
  ticketBottom: { gap: 16 },
  statRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNum: { fontSize: 26, fontWeight: '900', color: '#fff' },
  statLbl: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  arrivalText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cancelGrad: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelGradPressed: { backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ scale: 0.99 }] },
  cancelGradText: { color: '#fff', fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Empty State Card
  emptyCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyInner: { padding: 30, alignItems: 'center' },
  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#f8fafc' },
  emptySub: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
    lineHeight: 20,
    fontSize: 13,
    fontWeight: '500',
  },
  ctaBtn: { marginTop: 22, width: '100%', maxWidth: 280 },
  ctaBtnPressed: { transform: [{ scale: 0.98 }] },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#94a3b8', marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  docGrid: { gap: 14 },
  docCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  docCard: { padding: 18 },
  docRow: { flexDirection: 'row', gap: 14 },
  docAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  docInfo: { flex: 1, justifyContent: 'center' },
  docName: { fontSize: 16, fontWeight: '900', color: '#f8fafc' },
  docSpec: { color: colors.primary500, fontWeight: '800', fontSize: 11, marginTop: 3, letterSpacing: 0.5 },
  docMetaRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  docMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  docMetaText: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
});
