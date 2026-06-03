import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CLINIC_BRAND } from '../constants/app';
import { colors } from '../theme/colors';
import type { MedicalReportItem } from '../types';
import { saveMedicalReportToPhone, shareMedicalReportPdf } from '../utils/medicalReportPdf';

function formatDate(raw: string | undefined) {
  if (!raw) return '—';
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

type Props = {
  visible: boolean;
  report: MedicalReportItem | null;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  onClose: () => void;
};

export default function MedicalReportReceiptModal({
  visible,
  report,
  patientName,
  patientEmail,
  patientPhone,
  onClose,
}: Props) {
  const [busy, setBusy] = useState<'share' | 'save' | null>(null);

  if (!report) return null;

  const name = report.patient?.name || patientName || 'Patient';
  const email = report.patient?.email || patientEmail || '—';
  const phone = report.patient?.phone || patientPhone || '—';
  const reportId = report._id ? `MR-${report._id.slice(-8).toUpperCase()}` : 'MR-LOCAL';

  const onShare = async () => {
    setBusy('share');
    try {
      await shareMedicalReportPdf(report, patientName, patientEmail, patientPhone);
    } catch {
      Alert.alert('Share failed', 'Could not share the report PDF. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const onSave = async () => {
    setBusy('save');
    try {
      const path = await saveMedicalReportToPhone(report, patientName, patientEmail, patientPhone);
      Alert.alert('Saved to phone', `Report saved in app storage:\n${path}`);
    } catch {
      Alert.alert('Save failed', 'Could not save PDF to your device. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <LinearGradient
              colors={[colors.receiptHeader1, colors.receiptHeader2]}
              style={styles.header}
            >
              <Text style={styles.emoji}>🏥</Text>
              <Text style={styles.clinic}>{CLINIC_BRAND.fullName}</Text>
              <Text style={styles.sub}>Smart Health Center & Virtual Queue</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Official Diagnostic Report</Text>
              </View>
            </LinearGradient>

            <View style={styles.body}>
              <View style={styles.metaRow}>
                <View>
                  <Text style={styles.metaLabel}>Report ID</Text>
                  <Text style={styles.metaValue}>{reportId}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.metaLabel}>Date of Issue</Text>
                  <Text style={styles.metaValue}>{formatDate(report.createdAt)}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Patient Details</Text>
              <View style={styles.infoBox}>
                <InfoRow label="Full Name" value={name} />
                <InfoRow label="Email" value={email} />
                <InfoRow label="Phone" value={phone} />
              </View>

              <Text style={styles.sectionTitle}>Attending Consultant</Text>
              <View style={styles.infoBox}>
                <InfoRow label="Doctor" value={`Dr. ${report.doctor?.name || 'Specialist'}`} />
                <InfoRow
                  label="Specialization"
                  value={report.doctor?.specialization || 'Consultant'}
                />
                {report.queue?.tokenNumber ? (
                  <InfoRow label="Token" value={`#${report.queue.tokenNumber}`} />
                ) : null}
              </View>

              <Text style={styles.sectionTitle}>Patient Vitals</Text>
              <View style={styles.vitalsRow}>
                <VitalBox label="Blood Pressure" value={report.bloodPressure || '—'} />
                <VitalBox label="Temperature" value={report.temperature || '—'} />
                <VitalBox label="Weight" value={report.weight || '—'} />
              </View>

              {report.symptoms ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Symptoms / Complaints</Text>
                  <Text style={styles.blockText}>{report.symptoms}</Text>
                </View>
              ) : null}

              <View style={styles.diagnosisBox}>
                <Text style={styles.diagnosisLabel}>Clinical Diagnosis</Text>
                <Text style={styles.diagnosisText}>{report.diagnosis}</Text>
              </View>

              {report.prescription && report.prescription.length > 0 ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Prescription (Rx)</Text>
                  {report.prescription.map((med, index) => (
                    <View key={index} style={styles.medRow}>
                      <Text style={styles.medName}>{med.medicineName}</Text>
                      <Text style={styles.medMeta}>
                        {med.dosage || '—'} • {med.frequency || '—'} • {med.duration || '—'}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {report.doctorNotes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Advice & Directives</Text>
                  <Text style={styles.notesText}>{report.doctorNotes}</Text>
                </View>
              ) : null}

              {report.followUp && report.nextAppointment ? (
                <View style={styles.followBox}>
                  <Ionicons name="calendar-outline" size={18} color="#4338ca" />
                  <Text style={styles.followText}>
                    Follow-up on {formatDate(report.nextAppointment)}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.footer}>
                Electronically verified by {CLINIC_BRAND.fullName} Smart Queue System.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={onShare}
              disabled={!!busy}
            >
              {busy === 'share' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                  <Text style={styles.primaryBtnTxt}>Share / Print PDF</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={onSave}
              disabled={!!busy}
            >
              {busy === 'save' ? (
                <ActivityIndicator color={colors.primary600} size="small" />
              ) : (
                <>
                  <Ionicons name="phone-portrait-outline" size={18} color={colors.primary600} />
                  <Text style={styles.saveBtnTxt}>Save to Phone</Text>
                </>
              )}
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.closeBtn]} onPress={onClose}>
              <Ionicons name="close" size={18} color="#64748b" />
              <Text style={styles.closeBtnTxt}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function VitalBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.vitalBox}>
      <Text style={styles.vitalLabel}>{label}</Text>
      <Text style={styles.vitalValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: { padding: 24, alignItems: 'center' },
  emoji: { fontSize: 36, marginBottom: 4 },
  clinic: { fontSize: 20, fontWeight: '900', color: '#fff' },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  badge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  body: { padding: 20, paddingBottom: 8 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  metaLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
  metaValue: { fontSize: 13, fontWeight: '800', color: '#334155', marginTop: 2 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#312e81',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: { marginBottom: 8 },
  infoLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  vitalsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  vitalBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vitalLabel: { fontSize: 8, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
  vitalValue: { fontSize: 13, fontWeight: '900', color: '#1e293b', marginTop: 4 },
  block: { marginBottom: 12 },
  blockLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 },
  blockText: { fontSize: 13, color: '#334155', lineHeight: 20, fontWeight: '600' },
  diagnosisBox: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  diagnosisLabel: { fontSize: 9, color: '#4338ca', fontWeight: '800', textTransform: 'uppercase' },
  diagnosisText: { fontSize: 16, fontWeight: '900', color: '#312e81', marginTop: 6 },
  medRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  medName: { fontSize: 14, fontWeight: '900', color: '#1e293b' },
  medMeta: { fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '600' },
  notesBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 12,
  },
  notesTitle: { fontSize: 10, fontWeight: '900', color: '#b45309', textTransform: 'uppercase' },
  notesText: { fontSize: 13, color: '#78350f', marginTop: 6, lineHeight: 18, fontWeight: '600' },
  followBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  followText: { fontSize: 12, fontWeight: '700', color: '#4338ca', flex: 1 },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 4,
  },
  actions: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtn: { backgroundColor: '#312e81' },
  primaryBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '900' },
  saveBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary500,
  },
  saveBtnTxt: { color: colors.primary600, fontSize: 13, fontWeight: '900' },
  closeBtn: { backgroundColor: '#e2e8f0' },
  closeBtnTxt: { color: '#64748b', fontSize: 13, fontWeight: '800' },
});
