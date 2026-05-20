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
  Vibration,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import type { PaymentMethod } from '../../types';
import { dateFromLocalInput, localDateInputValue } from '../../utils/dateInput';
import { LinearGradient } from 'expo-linear-gradient';

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

  const selectDoctor = (name: string, consultationFee?: number) => {
    Vibration.vibrate(40);
    setJoinForm((f) => ({
      ...f,
      serviceName: name,
      totalAmount: Number(consultationFee) || 1000,
    }));
    setDocModal(false);
  };

  const onBook = () => {
    Vibration.vibrate([0, 80, 50, 80]);
    handleJoinQueue();
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
          <View style={styles.cardHead}>
            <LinearGradient
              colors={[colors.primary900, '#115e59']}
              style={styles.iconCircle}
            >
              <Ionicons name="calendar-sharp" size={22} color={colors.primary500} />
            </LinearGradient>
            <View>
              <Text style={styles.title}>Book Consultation</Text>
              <Text style={styles.sub}>Fill in the details below to generate a new queue token</Text>
            </View>
          </View>

          {/* Doctor Selection Field */}
          <Text style={styles.label}>Select Specialist Doctor</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.select,
              pressed && styles.selectPressed
            ]} 
            onPress={() => {
              Vibration.vibrate(30);
              setDocModal(true);
            }}
          >
            <Text style={joinForm.serviceName ? styles.selectTxt : styles.selectPh}>
              {joinForm.serviceName
                ? `Dr. ${joinForm.serviceName} (${doctors.find((d) => d.name === joinForm.serviceName)?.specialization || ''})`
                : '-- Choose a Specialist --'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.primary500} />
          </Pressable>

          {/* Date Picker Field */}
          <Text style={styles.label}>Choose Appointment Date</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.select,
              pressed && styles.selectPressed
            ]} 
            onPress={() => {
              Vibration.vibrate(30);
              setShowDate(true);
            }}
          >
            <Text style={styles.selectTxt}>{joinForm.appointmentDate}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary500} />
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
                  <Text style={styles.dateDoneTxt}>Select Date</Text>
                </Pressable>
              ) : null}
            </>
          )}

          {/* Priority Toggles */}
          <Text style={styles.label}>Visit Type / Priority</Text>
          <View style={styles.prioRow}>
            <Pressable
              style={[
                styles.prioBox, 
                joinForm.priority === 'normal' && styles.prioOn
              ]}
              onPress={() => {
                Vibration.vibrate(35);
                setJoinForm((f) => ({ ...f, priority: 'normal' }));
              }}
            >
              <View style={[styles.radio, joinForm.priority === 'normal' && styles.radioOn]}>
                {joinForm.priority === 'normal' ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.prioLabel}>Normal Visit</Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.prioBox, 
                joinForm.priority === 'emergency' && styles.prioEmerOn
              ]}
              onPress={() => {
                Vibration.vibrate(45);
                setJoinForm((f) => ({ ...f, priority: 'emergency' }));
              }}
            >
              <View style={[styles.radio, joinForm.priority === 'emergency' && styles.radioEmerOn]}>
                {joinForm.priority === 'emergency' ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.prioEmerLabel}>Emergency 🚨</Text>
            </Pressable>
          </View>

          {/* Note Input */}
          <Text style={styles.label}>Symptoms or Medical Notes</Text>
          <TextInput
            style={styles.area}
            value={joinForm.notes}
            onChangeText={(notes) => setJoinForm((f) => ({ ...f, notes }))}
            placeholder="Describe your symptoms or complaints here... (Optional)"
            placeholderTextColor="#475569"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Payment Sections */}
          <View style={styles.payWrap}>
            <View style={styles.payHead}>
              <Ionicons name="card-outline" size={18} color={colors.primary500} />
              <Text style={styles.payHeadTxt}>Select Payment Method</Text>
            </View>
            
            <View style={styles.payGrid}>
              {(
                [
                  { id: 'card' as const, label: 'Credit Card', icon: 'card-sharp' as const },
                  { id: 'easypaisa' as const, label: 'Easypaisa', icon: 'wallet-sharp' as const },
                  { id: 'jazzcash' as const, label: 'JazzCash', icon: 'phone-portrait-sharp' as const },
                ] as const
              ).map((m) => (
                <Pressable
                  key={m.id}
                  style={[
                    styles.payCell, 
                    joinForm.paymentMethod === m.id && styles.payCellOn
                  ]}
                  onPress={() => {
                    Vibration.vibrate(30);
                    setJoinForm((f) => ({ ...f, paymentMethod: m.id as PaymentMethod }));
                  }}
                >
                  <Ionicons
                    name={m.icon}
                    size={20}
                    color={joinForm.paymentMethod === m.id ? '#14b8a6' : '#475569'}
                  />
                  <Text
                    style={[
                      styles.payCellTxt,
                      joinForm.paymentMethod === m.id && { color: '#f8fafc' },
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            {/* Conditional Fee Breakups */}
            {joinForm.serviceName && fee > 0 ? (
              <View style={styles.feeBox}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLbl}>Total Consultation Fee</Text>
                  <Text style={styles.feeVal}>PKR {fee}</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLbl}>Pay Now (50% Advance)</Text>
                  <Text style={[styles.feeVal, { color: '#14b8a6' }]}>
                    PKR {fee / 2}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLbl}>Pay at Reception Desk</Text>
                  <Text style={styles.feeVal}>PKR {fee / 2}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Validation Banner Errors */}
          {error ? (
            <View style={styles.errBox}>
              <Ionicons name="alert-circle" size={18} color="#f43f5e" />
              <Text style={styles.errTxt}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Action CTA */}
          <Pressable
            onPress={onBook}
            disabled={loading || !joinForm.serviceName}
            style={({ pressed }) => [
              styles.submitPressable,
              pressed && styles.submitPressed
            ]}
          >
            <LinearGradient
              colors={[colors.primary500, '#0d9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.submit, 
                (!joinForm.serviceName || loading) && styles.submitDis
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.submitTxt}>Confirm & Join Queue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      {/* Doctor Selection Slide Sheet Modal */}
      <Modal visible={docModal} animationType="slide" transparent>
        <Pressable 
          style={styles.modalBg} 
          onPress={() => {
            Vibration.vibrate(30);
            setDocModal(false);
          }}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Available Specialists</Text>
              <Pressable 
                onPress={() => setDocModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color="#94a3b8" />
              </Pressable>
            </View>
            
            <ScrollView 
              style={{ maxHeight: 380 }} 
              showsVerticalScrollIndicator={false}
            >
              {doctors.map((d) => (
                <Pressable
                  key={d._id}
                  style={({ pressed }) => [
                    styles.docPick,
                    pressed && styles.docPickPressed
                  ]}
                  onPress={() => selectDoctor(d.name, d.consultationFee)}
                >
                  <View style={styles.docModalAvatarWrap}>
                    <Ionicons name="pulse" size={20} color={colors.primary500} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docPickName}>Dr. {d.name}</Text>
                    <Text style={styles.docPickSpec}>{d.specialization.toUpperCase()}</Text>
                  </View>
                  <View style={styles.docPickRight}>
                    <Text style={styles.docFeeVal}>PKR {d.consultationFee}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#475569" style={{ marginLeft: 4 }} />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  cardHead: { flexDirection: 'row', gap: 14, marginBottom: 22 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  title: { fontSize: 20, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  sub: { color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '900', color: '#94a3b8', marginBottom: 8, marginTop: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#070a13',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectPressed: { backgroundColor: '#0e1424' },
  selectTxt: { fontSize: 15, fontWeight: '600', color: '#f1f5f9', flex: 1, paddingRight: 8 },
  selectPh: { fontSize: 15, color: '#475569', flex: 1, fontWeight: '600' },
  dateDone: {
    marginTop: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.primary600,
  },
  dateDoneTxt: { color: '#fff', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  prioRow: { flexDirection: 'row', gap: 12 },
  prioBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#070a13',
  },
  prioOn: { borderColor: colors.primary500, backgroundColor: 'rgba(20, 184, 166, 0.05)' },
  prioEmerOn: { borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary500, backgroundColor: colors.primary500 },
  radioEmerOn: { borderColor: '#f43f5e', backgroundColor: '#f43f5e' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  prioLabel: { fontSize: 13, fontWeight: '800', color: '#f8fafc', flex: 1 },
  prioEmerLabel: { fontSize: 13, fontWeight: '800', color: '#fca5a5', flex: 1 },
  area: {
    minHeight: 96,
    backgroundColor: '#070a13',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  payWrap: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#070a13',
  },
  payHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0b0f19',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  payHeadTxt: { fontSize: 14, fontWeight: '800', color: '#f8fafc', letterSpacing: 0.3 },
  payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  payCell: {
    width: '30%',
    minWidth: 100,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
  },
  payCellOn: {
    borderColor: colors.primary500,
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
  },
  payCellTxt: { fontSize: 11, fontWeight: '800', color: '#64748b', textAlign: 'center' },
  feeBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLbl: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  feeVal: { fontSize: 13, fontWeight: '900', color: '#f8fafc' },
  errBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#f43f5e',
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.15)',
  },
  errTxt: { flex: 1, color: '#fda4af', fontSize: 13, fontWeight: '700' },
  submitPressable: { marginTop: 22 },
  submitPressed: { transform: [{ scale: 0.98 }] },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
  },
  submitDis: { opacity: 0.5 },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(7,10,19,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '72%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  modalClose: {
    padding: 6,
    backgroundColor: '#070a13',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  docPick: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1e293b' 
  },
  docPickPressed: { opacity: 0.7 },
  docModalAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#070a13',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  docPickName: { fontSize: 15, fontWeight: '900', color: '#f8fafc' },
  docPickSpec: { fontSize: 11, color: colors.primary500, marginTop: 2, fontWeight: '800', letterSpacing: 0.3 },
  docPickRight: { flexDirection: 'row', alignItems: 'center' },
  docFeeVal: { fontSize: 13, fontWeight: '900', color: '#f8fafc' },
});
