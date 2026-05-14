import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CLINIC_BRAND } from '../constants/app';
import { usePatientPortal } from '../context/PatientPortalContext';
import { colors } from '../theme/colors';
import type { ReceiptData } from '../types';

function formatApptDate(raw: string | undefined) {
  if (raw == null || raw === '') return '—';
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T12:00:00`).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

function receiptShareText(data: ReceiptData) {
  return [
    `${CLINIC_BRAND.fullName} — Token #${String(data.tokenNumber).padStart(2, '0')}`,
    `Patient: ${data.patientName}`,
    `Doctor: ${data.doctorName}`,
    `Date: ${formatApptDate(data.appointmentDate)}`,
    `Booked: ${data.bookingTime}`,
  ].join('\n');
}

export default function AppointmentReceiptModal() {
  const { showReceipt, receiptData, setShowReceipt } = usePatientPortal();

  if (!receiptData) return null;

  const data = receiptData;
  const advance = Math.floor(data.totalAmount / 2);
  const remaining = Math.ceil(data.totalAmount / 2);

  const onShare = async () => {
    try {
      await Share.share({
        message: receiptShareText(data),
        title: `${CLINIC_BRAND.shortName} — receipt`,
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal visible={showReceipt} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <LinearGradient
              colors={[colors.receiptHeader1, colors.receiptHeader2]}
              style={styles.header}
            >
              <Text style={styles.emoji}>🏥</Text>
              <Text style={styles.clinic}>{CLINIC_BRAND.fullName}</Text>
              <Text style={styles.sub}>{CLINIC_BRAND.receiptSubheader}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>APPOINTMENT RECEIPT</Text>
              </View>
            </LinearGradient>

            <View style={styles.tokenBlock}>
              <Text style={styles.tokenLabel}>Your Token Number</Text>
              <Text style={styles.tokenNum}>{String(data.tokenNumber).padStart(2, '0')}</Text>
              <View style={styles.confirmed}>
                <Text style={styles.confirmedText}>✓ Confirmed</Text>
              </View>
            </View>

            <Section title="Patient Information">
              <Row label="Patient Name" value={data.patientName} bold />
              <Row label="Email" value={data.email} />
              <Row label="Phone" value={data.phone || 'N/A'} last />
            </Section>

            <View style={styles.hr} />

            <Section title="Appointment Details">
              <Row label="Doctor" value={data.doctorName} bold />
              <Row label="Appointment Date" value={formatApptDate(data.appointmentDate)} />
              <Row label="Time Slot" value="09:00 AM — 05:00 PM" />
              <Row
                label="Priority"
                value={data.priority === 'emergency' ? '🚨 Emergency' : '✅ Normal'}
                valueColor={data.priority === 'emergency' ? colors.red600 : colors.green600}
              />
              <Row label="Reason" value={data.notes || 'General Checkup'} />
              <Row label="Booked On" value={data.bookingTime} last />
            </Section>

            {data.totalAmount ? (
              <View style={styles.payBox}>
                <Text style={styles.sectionLabel}>Payment Summary</Text>
                {data.paymentMethodLabel ? (
                  <Row
                    label="Paid via"
                    value={
                      data.paidViaLastDigits
                        ? `${data.paymentMethodLabel} • ****${data.paidViaLastDigits}`
                        : data.paymentMethodLabel
                    }
                  />
                ) : null}
                <Row label="Consultation Fee" value={`Rs. ${data.totalAmount}`} />
                <Row label="Advance Paid (50%)" value={`Rs. ${advance} ✓`} valueColor={colors.green600} />
                <Row
                  label="Remaining (Pay at Clinic)"
                  value={`Rs. ${remaining}`}
                  valueColor={colors.orange500}
                />
                <View style={styles.payTotalRow}>
                  <Text style={styles.payTotalL}>Total Amount</Text>
                  <Text style={styles.payTotalV}>Rs. {data.totalAmount}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                ⚠️ <Text style={styles.noteBold}>Important:</Text> Please arrive 10 minutes before
                your appointment. Cancellation will result in advance payment forfeiture. Remaining
                amount to be paid at the clinic.
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerMuted}>
                Receipt ID: VQ-{new Date().getFullYear()}-
                {String(data.tokenNumber).padStart(4, '0')}
              </Text>
              <Text style={styles.footerThanks}>
                Thank you for choosing {CLINIC_BRAND.fullName}!
              </Text>
              <Text style={styles.footerMuted}>www.citymedicalclinic.com | 042-1234567</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.btnPrimary} onPress={onShare}>
              <Text style={styles.btnPrimaryText}>Share receipt</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setShowReceipt(false)}>
              <Text style={styles.btnGhostText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  bold,
  valueColor,
  last,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowVal, bold && styles.rowValBold, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 16,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  header: { paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  emoji: { fontSize: 36, marginBottom: 6 },
  clinic: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  badge: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: '#fff', fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  tokenBlock: {
    backgroundColor: '#eff6ff',
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.blue100,
    paddingVertical: 20,
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 10,
    color: colors.slate500,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tokenNum: { fontSize: 52, fontWeight: '700', color: colors.blue800, marginTop: 4 },
  confirmed: {
    marginTop: 10,
    backgroundColor: colors.green500,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
  },
  confirmedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel: {
    fontSize: 10,
    color: colors.slate400,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eff6ff',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  rowLabel: { fontSize: 13, color: colors.slate500 },
  rowVal: { fontSize: 13, color: colors.slate700, fontWeight: '600', maxWidth: '58%', textAlign: 'right' },
  rowValBold: { color: colors.blue800, fontWeight: '700' },
  hr: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.slate200,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  payBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.green50,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.green500,
  },
  payTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bbf7d0',
  },
  payTotalL: { fontSize: 13, fontWeight: '700', color: colors.slate700 },
  payTotalV: { fontSize: 13, fontWeight: '700', color: colors.green700 },
  noteBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fefce8',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.yellow400,
  },
  noteText: { fontSize: 11, color: colors.yellow700, lineHeight: 17 },
  noteBold: { fontWeight: '700' },
  footer: {
    backgroundColor: colors.receiptHeader1,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  footerMuted: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'center' },
  footerThanks: { color: '#fff', fontSize: 14, fontWeight: '700', marginVertical: 8, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: colors.slate100 },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
  btnGhost: {
    flex: 1,
    backgroundColor: colors.slate100,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnGhostText: { color: colors.slate700, fontWeight: '600' },
});
