import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
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
  const { userName, queueStatus, doctors, handleCancelQueue, loading, joinForm, setJoinForm } = usePatientPortal();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
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
            <Text style={styles.muted}>Your health is our utmost priority.</Text>
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
                  No active queue ticket found. Book a new appointment to consult with our specialized doctors.
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
              <Pressable
                key={doc._id}
                style={({ pressed }) => [
                  styles.docCardContainer,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                ]}
                onPress={() => {
                  Vibration.vibrate(30);
                  setSelectedDoctor(doc);
                  setShowDoctorModal(true);
                }}
              >
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
                    <Ionicons name="chevron-forward" size={18} color="#475569" style={{ alignSelf: 'center' }} />
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          {/* Premium Doctor Profile Bottom-Sheet Modal */}
          <Modal
            visible={showDoctorModal}
            animationType="slide"
            transparent
            onRequestClose={() => {
              setShowDoctorModal(false);
              setSelectedDoctor(null);
            }}
          >
            <Pressable
              style={styles.modalBg}
              onPress={() => {
                Vibration.vibrate(30);
                setShowDoctorModal(false);
                setSelectedDoctor(null);
              }}
            >
              <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
                {selectedDoctor && (
                  <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    {/* Header Banner Accent */}
                    <LinearGradient
                      colors={[colors.primary700, '#0f766e']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalBanner}
                    >
                      <View style={styles.modalBannerInner}>
                        <Pressable
                          onPress={() => {
                            setShowDoctorModal(false);
                            setSelectedDoctor(null);
                          }}
                          style={styles.modalCloseBtn}
                        >
                          <Ionicons name="close" size={20} color="#fff" />
                        </Pressable>
                      </View>
                    </LinearGradient>

                    {/* Avatar and Name */}
                    <View style={styles.profileHeaderRow}>
                      <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.profileAvatar}
                      >
                        <Ionicons name={getSpecIcon(selectedDoctor.specialization)} size={38} color={colors.primary500} />
                      </LinearGradient>
                      <View style={styles.profileHeaderInfo}>
                        <Text style={styles.profileName}>Dr. {selectedDoctor.name}</Text>
                        <Text style={styles.profileSpec}>{selectedDoctor.specialization.toUpperCase()}</Text>
                        <Text style={styles.profileDegree}>{selectedDoctor.degree || 'M.B.B.S.'}</Text>
                      </View>
                    </View>

                    {/* Bio / About Section */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>About Consultant</Text>
                      <Text style={styles.modalBio}>
                        {selectedDoctor.about || `Dr. ${selectedDoctor.name} is a highly accomplished specialist offering premium clinical consultations and dedicated patient care.`}
                      </Text>
                    </View>

                    {/* Details Grid */}
                    <View style={styles.infoGrid}>
                      <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>EXPERIENCE</Text>
                        <Text style={styles.cellValue}>{selectedDoctor.experience || 5} Years</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>SPECIALIZED FROM</Text>
                        <Text style={styles.cellValue} numberOfLines={1}>{selectedDoctor.specializedFrom || 'City Medical University'}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>CONSULTATION FEE</Text>
                        <Text style={[styles.cellValue, { color: '#14b8a6' }]}>PKR {selectedDoctor.consultationFee || 1000}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>SLOT DURATION</Text>
                        <Text style={styles.cellValue}>{selectedDoctor.slotDuration || 15} Mins</Text>
                      </View>
                    </View>

                    {/* Timings / Schedule */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Consultation Schedule</Text>
                      <View style={styles.scheduleList}>
                        {selectedDoctor.schedule && selectedDoctor.schedule.length > 0 ? (
                          selectedDoctor.schedule.map((item: any, idx: number) => (
                            <View key={idx} style={styles.scheduleRow}>
                              <Text style={styles.scheduleDay}>{item.day}</Text>
                              <View style={[styles.timeBadge, item.isAvailable ? styles.timeBadgeActive : styles.timeBadgeOff]}>
                                <Text style={[styles.timeBadgeText, item.isAvailable ? styles.timeActiveText : styles.timeOffText]}>
                                  {item.isAvailable ? `${item.startTime} - ${item.endTime}` : 'Off Day'}
                                </Text>
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noScheduleTxt}>No timings schedule defined for this doctor.</Text>
                        )}
                      </View>
                    </View>

                    {/* Booking CTA Button */}
                    <Pressable
                      onPress={() => {
                        Vibration.vibrate([0, 60, 40, 60]);
                        setJoinForm((f) => ({
                          ...f,
                          serviceName: selectedDoctor.name,
                          totalAmount: selectedDoctor.consultationFee || 1000,
                        }));
                        setShowDoctorModal(false);
                        setSelectedDoctor(null);
                        navigation.jumpTo('Book');
                      }}
                      style={({ pressed }) => [
                        styles.bookCtaPress,
                        pressed && { transform: [{ scale: 0.98 }] }
                      ]}
                    >
                      <LinearGradient
                        colors={[colors.primary500, '#0d9488']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bookCtaGrad}
                      >
                        <Ionicons name="calendar-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.bookCtaText}>Book Appointment Now</Text>
                      </LinearGradient>
                    </Pressable>

                    {/* Close Button */}
                    <Pressable
                      onPress={() => {
                        Vibration.vibrate(30);
                        setShowDoctorModal(false);
                        setSelectedDoctor(null);
                      }}
                      style={({ pressed }) => [
                        styles.closeModalLink,
                        pressed && { opacity: 0.6 }
                      ]}
                    >
                      <Text style={styles.closeModalLinkTxt}>Close Profile</Text>
                    </Pressable>
                  </ScrollView>
                )}
              </Pressable>
            </Pressable>
          </Modal>

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
  // Doctor profile modal styles
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(7,10,19,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalBanner: {
    height: 100,
    marginHorizontal: -24,
    borderTopLeftRadius: 31,
    borderTopRightRadius: 31,
    position: 'relative',
  },
  modalBannerInner: {
    flex: 1,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginTop: -40,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0f172a',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  profileHeaderInfo: {
    flex: 1,
    paddingBottom: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  profileSpec: {
    color: colors.primary500,
    fontWeight: '800',
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  profileDegree: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modalSection: {
    marginTop: 18,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalBio: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#070a13',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridCell: {
    width: '47%',
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#f1f5f9',
  },
  scheduleList: {
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#070a13',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
  },
  scheduleDay: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeBadgeActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  timeBadgeOff: {
    backgroundColor: 'rgba(71, 85, 105, 0.08)',
    borderColor: 'rgba(71, 85, 105, 0.15)',
  },
  timeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timeActiveText: {
    color: colors.primary500,
  },
  timeOffText: {
    color: '#64748b',
  },
  noScheduleTxt: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
  },
  bookCtaPress: {
    marginTop: 28,
  },
  bookCtaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookCtaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  closeModalLink: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeModalLinkTxt: {
    color: '#64748b',
    fontWeight: '800',
    fontSize: 13,
  },
});
