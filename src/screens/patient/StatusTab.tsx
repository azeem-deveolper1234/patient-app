import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { LinearGradient } from 'expo-linear-gradient';

export default function StatusTab() {
  const { queueStatus, fetchQueueStatus, handleCancelQueue, loading } = usePatientPortal();
  const [refreshing, setRefreshing] = useState(false);

  // Expected Arrival Time calculation
  const getExpectedArrivalTime = (estimatedMinutes: number) => {
    if (estimatedMinutes < 0) return 'N/A';
    const arrival = new Date(Date.now() + estimatedMinutes * 60000);
    return arrival.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Proximity Alert Config
  const getProximityInfo = (peopleAhead: number, status: string) => {
    if (status === 'serving' || peopleAhead === 0) {
      return {
        label: "It's your turn now! Please proceed inside immediately. 🏃‍♂️",
        color: '#14b8a6',
        bg: 'rgba(20, 184, 166, 0.1)',
        border: 'rgba(20, 184, 166, 0.25)',
        textColor: '#ccfbf1',
        icon: 'checkmark-circle-sharp' as const,
      };
    }
    if (peopleAhead <= 2) {
      return {
        label: `🔴 Urgent Alert: Only ${peopleAhead} patient(s) ahead. Please be ready!`,
        color: '#f43f5e',
        bg: 'rgba(244, 63, 94, 0.1)',
        border: 'rgba(244, 63, 94, 0.25)',
        textColor: '#fda4af',
        icon: 'alert-circle-sharp' as const,
      };
    }
    if (peopleAhead <= 5) {
      return {
        label: `🟡 Turn Approaching: Only ${peopleAhead} patient(s) ahead. Stay close!`,
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.25)',
        textColor: '#fef3c7',
        icon: 'notifications-sharp' as const,
      };
    }
    return {
      label: `🔵 Waiting in Queue: There are ${peopleAhead} patient(s) ahead of you.`,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.25)',
      textColor: '#dbeafe',
      icon: 'information-circle-sharp' as const,
    };
  };

  const proximity = queueStatus 
    ? getProximityInfo(queueStatus.peopleAhead, queueStatus.status)
    : null;

  const onRefresh = async () => {
    Vibration.vibrate(50);
    setRefreshing(true);
    try {
      await fetchQueueStatus();
    } finally {
      setRefreshing(false);
    }
  };

  const onCancel = () => {
    Vibration.vibrate(120);
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
        <View style={styles.card}>
          <View style={styles.headRow}>
            <View>
              <Text style={styles.title}>Real-time Monitor</Text>
              <Text style={styles.sub}>Your live queue updates are here</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.refresh,
                pressed && styles.refreshPressed
              ]}
              onPress={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.primary500} />
              ) : (
                <Ionicons name="refresh" size={20} color={colors.primary500} />
              )}
            </Pressable>
          </View>

          {queueStatus && proximity ? (
            <View style={styles.body}>
              
              {/* Proximity Color Alert Banner */}
              <View style={[styles.alertBanner, { backgroundColor: proximity.bg, borderColor: proximity.border }]}>
                <Ionicons name={proximity.icon} size={20} color={proximity.color} />
                <Text style={[styles.alertBannerText, { color: proximity.textColor }]}>
                  {proximity.label}
                </Text>
              </View>

              {/* Main Ticket Values */}
              <View style={styles.grid2}>
                <View style={styles.box}>
                  <Text style={styles.big}>{queueStatus.yourToken}</Text>
                  <Text style={styles.cap}>Your Token</Text>
                </View>
                <View style={[styles.box, { backgroundColor: proximity.bg, borderColor: proximity.border }]}>
                  <Text style={[styles.big, { color: proximity.color }]}>
                    {queueStatus.currentServing}
                  </Text>
                  <Text style={[styles.cap, { color: proximity.textColor }]}>Serving Now</Text>
                </View>
              </View>

              {/* Secondary Details Grid */}
              <View style={styles.row2}>
                <View style={styles.smallBox}>
                  <Text style={styles.mid}>{queueStatus.peopleAhead}</Text>
                  <Text style={styles.capSm}>Ahead</Text>
                </View>
                <View style={styles.smallBox}>
                  <Text style={styles.mid}>{queueStatus.estimatedTime} min</Text>
                  <Text style={styles.capSm}>Remaining Wait</Text>
                </View>
              </View>

              {/* Expected Arrival Time Row */}
              <View style={styles.arrivalBox}>
                <LinearGradient
                  colors={[colors.primary900, '#115e59']}
                  style={styles.timeIconWrap}
                >
                  <Ionicons name="time" size={20} color={colors.primary500} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.arrivalTitle}>EXPECTED ARRIVAL TIME</Text>
                  <Text style={styles.arrivalVal}>
                    {getExpectedArrivalTime(queueStatus.estimatedTime)}
                  </Text>
                </View>
              </View>

              {/* Status and Priority Panel */}
              <View style={styles.statusPanel}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLbl}>Current Status</Text>
                  <View
                    style={[
                      styles.pill,
                      queueStatus.status === 'serving' ? styles.pillGreen : styles.pillYellow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillTxt,
                        queueStatus.status === 'serving' ? styles.pillTxtG : styles.pillTxtY,
                      ]}
                    >
                      {queueStatus.status === 'serving' ? 'Your Turn' : 'Waiting'}
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.statusRow, { marginTop: 16 }]}>
                  <Text style={styles.statusLbl}>Priority Level</Text>
                  <View
                    style={[
                      styles.pill,
                      queueStatus.priority === 'emergency' ? styles.pillRed : styles.pillGray,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillTxt,
                        queueStatus.priority === 'emergency' ? styles.pillTxtR : styles.pillTxtGr,
                      ]}
                    >
                      {queueStatus.priority === 'emergency' ? 'Emergency' : 'Normal'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && styles.cancelBtnPressed
                ]}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={styles.cancelBtnTxt}>Cancel My Token</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="pulse" size={36} color={colors.primary500} />
              </View>
              <Text style={styles.emptyTitle}>No Active Token</Text>
              <Text style={styles.emptySub}>
                You are currently not in any doctor's live queue.
              </Text>
            </View>
          )}
        </View>
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
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  sub: { color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: '500' },
  refresh: {
    padding: 10,
    backgroundColor: '#070a13',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshPressed: { transform: [{ scale: 0.95 }] },
  body: { gap: 20 },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  alertBannerText: {
    fontSize: 13.5,
    fontWeight: '800',
    flex: 1,
    lineHeight: 18,
  },
  grid2: { flexDirection: 'row', gap: 12 },
  box: {
    flex: 1,
    backgroundColor: '#070a13',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  big: { fontSize: 38, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  cap: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginTop: 8, letterSpacing: 0.5 },
  row2: { flexDirection: 'row', gap: 12 },
  smallBox: {
    flex: 1,
    backgroundColor: '#070a13',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  mid: { fontSize: 20, fontWeight: '900', color: '#f8fafc' },
  capSm: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginTop: 4 },
  arrivalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070a13',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  timeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  arrivalTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrivalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#f8fafc',
    marginTop: 2,
  },
  statusPanel: {
    backgroundColor: '#070a13',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLbl: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  pillGreen: { backgroundColor: 'rgba(20, 184, 166, 0.1)', borderWidth: 1, borderColor: 'rgba(20, 184, 166, 0.2)' },
  pillYellow: { backgroundColor: 'rgba(251, 191, 36, 0.1)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' },
  pillRed: { backgroundColor: 'rgba(244, 63, 94, 0.1)', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.2)' },
  pillGray: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  pillTxt: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  pillTxtG: { color: '#14b8a6' },
  pillTxtY: { color: '#fbbf24' },
  pillTxtR: { color: '#f43f5e' },
  pillTxtGr: { color: '#94a3b8' },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.15)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelBtnPressed: { backgroundColor: 'rgba(244, 63, 94, 0.15)', transform: [{ scale: 0.99 }] },
  cancelBtnTxt: { color: '#fca5a5', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
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
  emptySub: { color: '#64748b', marginTop: 8, textAlign: 'center', paddingHorizontal: 20, fontSize: 13, lineHeight: 18, fontWeight: '500' },
});

