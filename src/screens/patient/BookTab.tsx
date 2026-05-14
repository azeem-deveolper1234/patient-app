import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';
import type { PaymentMethod } from '../../types';
import { dateFromLocalInput, localDateInputValue } from '../../utils/dateInput';

export default function BookTab() {
  const { joinForm, setJoinForm, doctors, handleJoinQueue, loading, error } = usePatientPortal();
  const [docModal, setDocModal] = useState(false);
  const [showDate, setShowDate] = useState(false);

  const fee =
    typeof joinForm.totalAmount === 'number' && joinForm.totalAmount > 0
      ? joinForm.totalAmount
      : 0;

  const onDateChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (date) setJoinForm((f) => ({ ...f, appointmentDate: localDateInputValue(date) }));
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar" size={26} color={colors.primary600} />
          </View>
          <View>
            <Text style={styles.title}>Book Appointment</Text>
            <Text style={styles.sub}>Select a doctor and time to join the queue</Text>
          </View>
        </View>

        <Text style={styles.label}>Select Doctor</Text>
        <Pressable style={styles.select} onPress={() => setDocModal(true)}>
          <Text style={joinForm.serviceName ? styles.selectTxt : styles.selectPh}>
            {joinForm.serviceName
              ? `Dr. ${joinForm.serviceName} (${doctors.find((d) => d.name === joinForm.serviceName)?.specialization || ''})`
              : '-- Choose Specialist --'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.slate400} />
        </Pressable>

        <Text style={styles.label}>Appointment Date</Text>
        <Pressable style={styles.select} onPress={() => setShowDate(true)}>
          <Text style={styles.selectTxt}>{joinForm.appointmentDate}</Text>
          <Ionicons name="calendar-outline" size={20} color={colors.slate400} />
        </Pressable>
        {showDate && (
          <>
            <DateTimePicker
              value={dateFromLocalInput(joinForm.appointmentDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onDateChange}
            />
            {Platform.OS === 'ios' ? (
              <Pressable
                style={styles.dateDone}
                onPress={() => setShowDate(false)}
              >
                <Text style={styles.dateDoneTxt}>Done</Text>
              </Pressable>
            ) : null}
          </>
        )}

        <Text style={styles.label}>Priority Level</Text>
        <View style={styles.prioRow}>
          <Pressable
            style={[styles.prioBox, joinForm.priority === 'normal' && styles.prioOn]}
            onPress={() => setJoinForm((f) => ({ ...f, priority: 'normal' }))}
          >
            <View style={[styles.radio, joinForm.priority === 'normal' && styles.radioOn]}>
              {joinForm.priority === 'normal' ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={styles.prioLabel}>Normal Visit</Text>
          </Pressable>
          <Pressable
            style={[styles.prioBox, joinForm.priority === 'emergency' && styles.prioEmerOn]}
            onPress={() => setJoinForm((f) => ({ ...f, priority: 'emergency' }))}
          >
            <View style={[styles.radio, joinForm.priority === 'emergency' && styles.radioEmerOn]}>
              {joinForm.priority === 'emergency' ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={styles.prioEmerLabel}>Emergency</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Symptoms or Notes</Text>
        <TextInput
          style={styles.area}
          value={joinForm.notes}
          onChangeText={(notes) => setJoinForm((f) => ({ ...f, notes }))}
          placeholder="Briefly describe why you need to see the doctor..."
          placeholderTextColor={colors.slate400}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.payWrap}>
          <View style={styles.payHead}>
            <Ionicons name="card" size={20} color={colors.slate500} />
            <Text style={styles.payHeadTxt}>Payment Method</Text>
          </View>
          <View style={styles.payGrid}>
            {(
              [
                { id: 'card' as const, label: 'Online Card', icon: 'card' as const },
                { id: 'easypaisa' as const, label: 'Easypaisa', icon: 'phone-portrait' as const },
                { id: 'jazzcash' as const, label: 'JazzCash', icon: 'phone-portrait' as const },
              ] as const
            ).map((m) => (
              <Pressable
                key={m.id}
                style={[styles.payCell, joinForm.paymentMethod === m.id && styles.payCellOn]}
                onPress={() => setJoinForm((f) => ({ ...f, paymentMethod: m.id as PaymentMethod }))}
              >
                <Ionicons
                  name={m.icon}
                  size={22}
                  color={joinForm.paymentMethod === m.id ? colors.primary600 : colors.slate400}
                />
                <Text
                  style={[
                    styles.payCellTxt,
                    joinForm.paymentMethod === m.id && { color: colors.primary700 },
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {joinForm.serviceName && fee > 0 ? (
            <View style={styles.feeBox}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLbl}>Total Consultation Fee</Text>
                <Text style={styles.feeLbl}>Rs. {fee}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLbl}>Pay Now (50% Advance)</Text>
                <Text style={[styles.feeLbl, { color: colors.primary600, fontWeight: '700' }]}>
                  Rs. {fee / 2}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLbl}>Pay at Clinic</Text>
                <Text style={styles.feeLbl}>Rs. {fee / 2}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errBox}>
            <Ionicons name="alert-circle" size={18} color={colors.red600} />
            <Text style={styles.errTxt}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.submit, (!joinForm.serviceName || loading) && styles.submitDis]}
          onPress={() => void handleJoinQueue()}
          disabled={loading || !joinForm.serviceName}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitTxt}>Confirm & Book Appointment</Text>
          )}
        </Pressable>
      </View>

      <Modal visible={docModal} animationType="slide" transparent>
        <Pressable style={styles.modalBg} onPress={() => setDocModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {doctors.map((d) => (
                <Pressable
                  key={d._id}
                  style={styles.docPick}
                  onPress={() => {
                    setJoinForm((f) => ({
                      ...f,
                      serviceName: d.name,
                      totalAmount: Number(d.consultationFee) || 1000,
                    }));
                    setDocModal(false);
                  }}
                >
                  <Text style={styles.docPickName}>Dr. {d.name}</Text>
                  <Text style={styles.docPickSpec}>{d.specialization}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.slate50 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  cardHead: { flexDirection: 'row', gap: 14, marginBottom: 22 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.slate800 },
  sub: { color: colors.slate500, fontSize: 13, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: colors.slate700, marginBottom: 8, marginTop: 14 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectTxt: { fontSize: 15, fontWeight: '600', color: colors.slate700, flex: 1, paddingRight: 8 },
  selectPh: { fontSize: 15, color: colors.slate400, flex: 1 },
  dateDone: {
    marginTop: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary600,
  },
  dateDoneTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  prioRow: { flexDirection: 'row', gap: 12 },
  prioBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.white,
  },
  prioOn: { borderColor: colors.primary600, backgroundColor: colors.primary50 },
  prioEmerOn: { borderColor: colors.red500, backgroundColor: colors.red50 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.slate300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary600, backgroundColor: colors.primary600 },
  radioEmerOn: { borderColor: colors.red600, backgroundColor: colors.red600 },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  prioLabel: { fontSize: 13, fontWeight: '600', color: colors.slate700, flex: 1 },
  prioEmerLabel: { fontSize: 13, fontWeight: '600', color: colors.red700, flex: 1 },
  area: {
    minHeight: 96,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: colors.slate700,
  },
  payWrap: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  payHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.slate50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  payHeadTxt: { fontSize: 15, fontWeight: '700', color: colors.slate800 },
  payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  payCell: {
    width: '30%',
    minWidth: 100,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
  },
  payCellOn: {
    borderColor: colors.primary600,
    backgroundColor: colors.primary50,
  },
  payCellTxt: { fontSize: 11, fontWeight: '600', color: colors.slate600, textAlign: 'center' },
  feeBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.slate50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate100,
    gap: 8,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  feeLbl: { fontSize: 13, fontWeight: '600', color: colors.slate600 },
  errBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.red50,
    borderLeftWidth: 4,
    borderLeftColor: colors.red500,
    padding: 12,
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'flex-start',
  },
  errTxt: { flex: 1, color: colors.red700, fontSize: 13, fontWeight: '500' },
  submit: {
    marginTop: 18,
    backgroundColor: colors.primary600,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitDis: { opacity: 0.5 },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.slate800 },
  docPick: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.slate100 },
  docPickName: { fontSize: 16, fontWeight: '700', color: colors.slate800 },
  docPickSpec: { fontSize: 13, color: colors.slate500, marginTop: 2 },
});
