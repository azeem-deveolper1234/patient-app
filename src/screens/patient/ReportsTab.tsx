import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { usePatientPortal } from '../../context/PatientPortalContext';
import MedicalReportReceiptModal from '../../components/MedicalReportReceiptModal';
import { colors } from '../../theme/colors';
import type { MedicalReportItem } from '../../types';

export default function ReportsTab() {
  const { user } = useAuth();
  const { reports, fetchReports } = usePatientPortal();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [selectedReport, setSelectedReport] = useState<MedicalReportItem | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

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

  const openReport = (report: MedicalReportItem) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReport = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  return (
    <View style={styles.root}>
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Text style={styles.pageTitle}>Medical Reports</Text>
          <Text style={styles.subTitle}>
            View and download diagnostic reports — same as web portal.
          </Text>
        </View>

        {reports.length === 0 ? (
          <Animated.View
            style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <LinearGradient colors={['#111827', '#0b0f19']} style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={32} color={colors.primary500} />
              </View>
              <Text style={styles.emptyTitle}>No medical reports yet</Text>
              <Text style={styles.emptySub}>
                Reports appear here after your doctor finalizes your checkup.
              </Text>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              gap: 16,
            }}
          >
            {reports.map((report) => (
              <View key={report._id} style={styles.cardOutline}>
                <LinearGradient colors={['#111827', '#080d16']} style={styles.reportCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconWrap}>
                      <Ionicons name="document-text" size={22} color={colors.primary500} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.diagnosisTxt}>
                        {report.diagnosis || 'Diagnostic Report'}
                      </Text>
                      <Text style={styles.metaLine}>
                        Doctor: Dr. {report.doctor?.name || 'Specialist'}
                      </Text>
                      <Text style={styles.metaLine}>
                        Date:{' '}
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString('en-US', {
                              dateStyle: 'medium',
                            })
                          : '—'}
                      </Text>
                      {user?.phone || report.patient?.phone ? (
                        <Text style={styles.metaLine}>
                          Phone: {report.patient?.phone || user?.phone}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [styles.viewBtn, pressed && styles.viewBtnPressed]}
                    onPress={() => openReport(report)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#fff" />
                    <Text style={styles.viewBtnTxt}>View & Print Report</Text>
                  </Pressable>
                </LinearGradient>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      <MedicalReportReceiptModal
        visible={showReportModal}
        report={selectedReport}
        patientName={user?.name}
        patientEmail={user?.email}
        patientPhone={user?.phone}
        onClose={closeReport}
      />
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
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  content: { padding: 20, paddingBottom: 40 },
  head: { marginBottom: 20, marginTop: 10 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  subTitle: { color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: '500' },
  emptyContainer: { marginTop: 40 },
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
    maxWidth: 280,
  },
  cardOutline: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  reportCard: { padding: 16 },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  diagnosisTxt: { fontSize: 16, fontWeight: '900', color: '#f8fafc' },
  metaLine: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary600,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewBtnPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  viewBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
});
