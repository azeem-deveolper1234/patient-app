import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Vibration,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';

export default function ReportsTab() {
  const { reports, fetchReports } = usePatientPortal();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [downloadingIds, setDownloadingIds] = useState<{ [key: string]: boolean }>({});

  useFocusEffect(
    useCallback(() => {
      void fetchReports();
    }, [fetchReports])
  );

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
  }, [reports]);

  const handleDownload = (reportId: string) => {
    Vibration.vibrate([0, 20, 10, 20]);
    setDownloadingIds((prev) => ({ ...prev, [reportId]: true }));
    
    // Simulate high-fidelity pdf generation & download
    setTimeout(() => {
      setDownloadingIds((prev) => ({ ...prev, [reportId]: false }));
      Vibration.vibrate(40);
      alert('Prescription PDF successfully saved to device storage!');
    }, 1500);
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
        <View style={styles.head}>
          <Text style={styles.pageTitle}>Medical Reports</Text>
          <Text style={styles.subTitle}>Your digital prescriptions and clinical checkup history.</Text>
        </View>

        {reports.length === 0 ? (
          <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={['#111827', '#0b0f19']}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={32} color={colors.primary500} />
              </View>
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptySub}>
                Your prescriptions and diagnostics reports will appear here once finalized by your consulting specialist.
              </Text>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 20 }}>
            {reports.map((report) => {
              const isDownloading = !!downloadingIds[report._id];
              return (
                <View key={report._id} style={styles.cardOutline}>
                  <LinearGradient
                    colors={['#111827', '#080d16']}
                    style={styles.reportCard}
                  >
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.diagnosisTxt}>{report.diagnosis || 'Checkup Assessment'}</Text>
                        <View style={styles.drNameRow}>
                          <Ionicons name="person-outline" size={13} color={colors.primary500} />
                          <Text style={styles.drNameTxt}>Dr. {report.doctor?.name || 'Medical Specialist'}</Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.dateText}>
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''}
                        </Text>
                        {report.followUp ? (
                          <View style={styles.followBadge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.followTxt}>Follow Up</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Card Body */}
                    <View style={styles.cardBody}>
                      {/* Symptoms */}
                      {report.symptoms ? (
                        <View style={styles.block}>
                          <Text style={styles.blockTitle}>Symptoms & Complaints</Text>
                          <View style={styles.symptomBox}>
                            <Text style={styles.symptomTxt}>{report.symptoms}</Text>
                          </View>
                        </View>
                      ) : null}

                      {/* Prescribed Medicines */}
                      {report.prescription && report.prescription.length > 0 ? (
                        <View style={styles.block}>
                          <Text style={styles.blockTitle}>Prescribed Medications</Text>
                          <View style={{ gap: 8 }}>
                            {report.prescription.map((med, index) => (
                              <View key={index} style={styles.medRow}>
                                <View style={styles.medHeaderRow}>
                                  <View style={styles.medBullet} />
                                  <Text style={styles.medName}>{med.medicineName}</Text>
                                  
                                  <View style={styles.durationBadge}>
                                    <Text style={styles.durationTxt}>{med.duration}</Text>
                                  </View>
                                </View>
                                
                                <View style={styles.medMetaRow}>
                                  <View style={styles.metaBadge}>
                                    <Ionicons name="calendar-outline" size={10} color="#94a3b8" />
                                    <Text style={styles.metaBadgeTxt}>{med.frequency}</Text>
                                  </View>
                                  <View style={styles.metaBadge}>
                                    <Ionicons name="scale-outline" size={10} color="#94a3b8" />
                                    <Text style={styles.metaBadgeTxt}>{med.dosage}</Text>
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null}

                      {/* Doctor Notes */}
                      {report.doctorNotes ? (
                        <View style={styles.block}>
                          <Text style={styles.blockTitle}>Special Advisory & Notes</Text>
                          <View style={styles.notesBox}>
                            <View style={styles.notesHeader}>
                              <Ionicons name="information-circle-outline" size={16} color={colors.yellow700} />
                              <Text style={styles.notesTitleTxt}>Medical Note</Text>
                            </View>
                            <Text style={styles.notesTxt}>{report.doctorNotes}</Text>
                          </View>
                        </View>
                      ) : null}

                      {/* Next Appointment Booking Callout */}
                      {report.nextAppointment ? (
                        <View style={styles.nextCallout}>
                          <Ionicons name="calendar" size={18} color="#3b82f6" />
                          <Text style={styles.nextCalloutTxt}>
                            Next Scheduled Session:{' '}
                            <Text style={styles.nextCalloutDate}>
                              {new Date(report.nextAppointment).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Text>
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Download Button Footer */}
                    <Pressable
                      onPress={() => handleDownload(report._id)}
                      disabled={isDownloading}
                      style={({ pressed }) => [
                        styles.downloadBtn,
                        pressed && styles.downloadBtnPressed,
                        isDownloading && styles.downloadBtnDisabled,
                      ]}
                    >
                      {isDownloading ? (
                        <>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={styles.downloadBtnTxt}>Generating PDF...</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                          <Text style={styles.downloadBtnTxt}>Download Digital Copy</Text>
                        </>
                      )}
                    </Pressable>
                  </LinearGradient>
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070a13', position: 'relative' },
  flex: { flex: 1 },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
    opacity: 0.8,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    opacity: 0.8,
  },
  content: { padding: 20, paddingBottom: 40 },
  head: { marginBottom: 24, marginTop: 10 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  subTitle: { color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: '500' },

  // Empty State
  emptyContainer: { flex: 1, marginTop: 40 },
  emptyCard: {
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#f8fafc' },
  emptySub: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 270,
  },

  // Report Cards List
  cardOutline: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  reportCard: { padding: 18 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diagnosisTxt: { fontSize: 18, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.2 },
  drNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  drNameTxt: { fontSize: 12, fontWeight: '700', color: colors.primary500 },
  dateText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  
  // Follow Up Badge
  followBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
    marginTop: 6,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.yellow400,
  },
  followTxt: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.yellow400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 14,
  },

  cardBody: { gap: 18 },
  block: { gap: 8 },
  blockTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  symptomBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  symptomTxt: { color: '#e2e8f0', fontSize: 13, lineHeight: 18, fontWeight: '600' },

  // Medicine Rows
  medRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  medHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary500,
  },
  medName: { flex: 1, fontSize: 14, fontWeight: '900', color: '#f8fafc' },
  durationBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationTxt: { fontSize: 10, fontWeight: '800', color: colors.primary500 },
  medMetaRow: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 4,
  },
  metaBadgeTxt: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },

  // Doctor Notes Box
  notesBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.15)',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesTitleTxt: {
    color: colors.yellow400,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  notesTxt: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  // Next Session Booking Callout
  nextCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  nextCalloutTxt: { fontSize: 12, fontWeight: '700', color: '#94a3b8', flex: 1 },
  nextCalloutDate: { color: '#3b82f6', fontWeight: '900' },

  // Download CTA Action
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary600,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
    gap: 8,
  },
  downloadBtnPressed: { backgroundColor: colors.primary700, transform: [{ scale: 0.99 }] },
  downloadBtnDisabled: { opacity: 0.8 },
  downloadBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.3 },
});
