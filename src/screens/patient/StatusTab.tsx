import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';

export default function StatusTab() {
  const { queueStatus, fetchQueueStatus, handleCancelQueue, loading } = usePatientPortal();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headRow}>
          <View>
            <Text style={styles.title}>Queue Status</Text>
            <Text style={styles.sub}>Real-time updates for your appointment</Text>
          </View>
          <Pressable
            style={styles.refresh}
            onPress={() => void fetchQueueStatus()}
            hitSlop={8}
          >
            <Ionicons name="refresh" size={22} color={colors.slate600} />
          </Pressable>
        </View>

        {queueStatus ? (
          <View style={styles.body}>
            <View style={styles.grid2}>
              <View style={styles.box}>
                <Text style={styles.big}>{queueStatus.yourToken}</Text>
                <Text style={styles.cap}>Your Token</Text>
              </View>
              <View style={[styles.box, styles.boxPrimary]}>
                <Text style={[styles.big, { color: colors.primary600 }]}>
                  {queueStatus.currentServing}
                </Text>
                <Text style={[styles.cap, { color: colors.primary600 }]}>Serving</Text>
              </View>
            </View>
            <View style={styles.row2}>
              <View style={styles.smallBox}>
                <Text style={styles.mid}>{queueStatus.peopleAhead}</Text>
                <Text style={styles.capSm}>Ahead</Text>
              </View>
              <View style={styles.smallBox}>
                <Text style={styles.mid}>{queueStatus.estimatedTime}m</Text>
                <Text style={styles.capSm}>Est. Wait</Text>
              </View>
            </View>
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
              <View style={[styles.statusRow, { marginTop: 12 }]}>
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
                      queueStatus.priority === 'emergency'
                        ? styles.pillTxtR
                        : styles.pillTxtGr,
                    ]}
                  >
                    {queueStatus.priority === 'emergency' ? 'Emergency' : 'Normal'}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              style={styles.cancelBtn}
              onPress={handleCancelQueue}
              disabled={loading}
            >
              <Text style={styles.cancelBtnTxt}>Cancel Queue</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="pulse" size={40} color={colors.slate300} />
            </View>
            <Text style={styles.emptyTitle}>No active queue</Text>
            <Text style={styles.emptySub}>You are not currently waiting for any doctor.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.slate50 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  title: { fontSize: 22, fontWeight: '700', color: colors.slate800 },
  sub: { color: colors.slate500, fontSize: 13, marginTop: 4 },
  refresh: {
    padding: 10,
    backgroundColor: colors.slate50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  body: { gap: 18 },
  grid2: { flexDirection: 'row', gap: 12 },
  box: {
    flex: 1,
    backgroundColor: colors.slate50,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  boxPrimary: { backgroundColor: colors.primary50, borderColor: colors.primary100 },
  big: { fontSize: 44, fontWeight: '900', color: colors.slate800 },
  cap: { fontSize: 12, fontWeight: '600', color: colors.slate500, textTransform: 'uppercase', marginTop: 8, letterSpacing: 0.5 },
  row2: { flexDirection: 'row', gap: 12 },
  smallBox: {
    flex: 1,
    backgroundColor: colors.slate50,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  mid: { fontSize: 22, fontWeight: '700', color: colors.slate700 },
  capSm: { fontSize: 10, fontWeight: '600', color: colors.slate500, textTransform: 'uppercase', marginTop: 4 },
  statusPanel: {
    backgroundColor: colors.slate50,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLbl: { fontSize: 15, fontWeight: '600', color: colors.slate600 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillGreen: { backgroundColor: colors.green100 },
  pillYellow: { backgroundColor: '#fef9c3' },
  pillRed: { backgroundColor: colors.red100 },
  pillGray: { backgroundColor: colors.slate200 },
  pillTxt: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  pillTxtG: { color: colors.green700 },
  pillTxtY: { color: '#a16207' },
  pillTxtR: { color: colors.red700 },
  pillTxtGr: { color: colors.slate700 },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: colors.red50,
    borderWidth: 1,
    borderColor: colors.red200,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnTxt: { color: colors.red600, fontWeight: '700', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 36 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.slate800 },
  emptySub: { color: colors.slate500, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
});
