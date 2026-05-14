import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';

export default function ReportsTab() {
  const { reports, fetchReports } = usePatientPortal();

  useFocusEffect(
    useCallback(() => {
      void fetchReports();
    }, [fetchReports])
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Medical Reports</Text>
      {reports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={56} color={colors.slate300} />
          <Text style={styles.emptyTitle}>No medical reports</Text>
          <Text style={styles.emptySub}>
            Prescriptions and diagnosis reports will be available here after visits.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 18 }}>
          {reports.map((report) => (
            <View key={report._id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dx}>{report.diagnosis}</Text>
                  <View style={styles.drRow}>
                    <Ionicons name="person" size={14} color={colors.primary600} />
                    <Text style={styles.dr}>Dr. {report.doctor?.name}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.dt}>
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString()
                      : ''}
                  </Text>
                  {report.followUp ? (
                    <View style={styles.follow}>
                      <Text style={styles.followTxt}>Follow Up Required</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.cardBody}>
                {report.symptoms ? (
                  <View style={styles.block}>
                    <Text style={styles.k}>Symptoms</Text>
                    <Text style={styles.symBox}>{report.symptoms}</Text>
                  </View>
                ) : null}
                {report.prescription && report.prescription.length > 0 ? (
                  <View style={styles.block}>
                    <Text style={styles.k}>Prescription</Text>
                    {report.prescription.map((med, i) => (
                      <View key={i} style={styles.medRow}>
                        <View style={styles.dot} />
                        <Text style={styles.medName}>{med.medicineName}</Text>
                        <Text style={styles.medMeta}>{med.dosage}</Text>
                        <Text style={styles.medMeta}>{med.frequency}</Text>
                        <View style={styles.dur}>
                          <Text style={styles.durTxt}>{med.duration}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
                {report.doctorNotes ? (
                  <View style={styles.block}>
                    <Text style={styles.k}>Doctor Notes</Text>
                    <Text style={styles.notesBox}>{report.doctorNotes}</Text>
                  </View>
                ) : null}
                {report.nextAppointment ? (
                  <View style={styles.nextRow}>
                    <Ionicons name="calendar-outline" size={18} color={colors.blue500} />
                    <Text style={styles.nextTxt}>
                      Next Appointment:{' '}
                      <Text style={styles.nextBold}>
                        {new Date(report.nextAppointment).toLocaleDateString()}
                      </Text>
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.slate50 },
  content: { padding: 16, paddingBottom: 32 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.slate800, marginBottom: 18 },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.slate800, marginTop: 12 },
  emptySub: { color: colors.slate500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: 'hidden',
  },
  cardHead: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.slate50,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    gap: 12,
  },
  dx: { fontSize: 17, fontWeight: '700', color: colors.slate800 },
  drRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dr: { fontSize: 13, fontWeight: '600', color: colors.primary600 },
  dt: { fontSize: 13, fontWeight: '500', color: colors.slate500 },
  follow: {
    marginTop: 8,
    backgroundColor: colors.orange100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  followTxt: { fontSize: 11, fontWeight: '700', color: colors.orange700 },
  cardBody: { padding: 16, gap: 18 },
  block: { gap: 8 },
  k: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  symBox: {
    backgroundColor: colors.slate50,
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    color: colors.slate700,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  medRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    marginBottom: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary500 },
  medName: { fontWeight: '700', color: colors.slate800, minWidth: 100, flex: 1 },
  medMeta: { fontSize: 13, color: colors.slate600, fontWeight: '500' },
  dur: { backgroundColor: colors.slate100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durTxt: { fontSize: 11, fontWeight: '600', color: colors.slate500 },
  notesBox: {
    backgroundColor: '#fffbeb',
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    color: colors.slate700,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.blue50,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue100,
  },
  nextTxt: { fontSize: 13, fontWeight: '500', color: colors.slate700, flex: 1 },
  nextBold: { fontWeight: '700', color: colors.slate900 },
});
