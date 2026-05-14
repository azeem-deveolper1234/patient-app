import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePatientPortal } from '../context/PatientPortalContext';
import { colors } from '../theme/colors';

export default function PaymentGatewayModal() {
  const {
    joinForm,
    doctors,
    showGateway,
    gatewayStep,
    gatewayPhone,
    setGatewayPhone,
    gatewayOtp,
    setGatewayOtp,
    error,
    clearGateway,
    handleGatewayNext,
    gatewayBackToPhone,
  } = usePatientPortal();

  const fee =
    typeof joinForm.totalAmount === 'number' && joinForm.totalAmount > 0
      ? joinForm.totalAmount
      : doctors.find((d) => d.name === joinForm.serviceName)?.consultationFee || 1000;
  const half = Math.floor(fee / 2);

  const headerColors =
    joinForm.paymentMethod === 'easypaisa'
      ? (['#16a34a', '#15803d'] as const)
      : joinForm.paymentMethod === 'jazzcash'
        ? (['#ef4444', '#b91c1c'] as const)
        : ([colors.slate800, colors.slate900] as const);

  const spinColor =
    joinForm.paymentMethod === 'easypaisa'
      ? colors.green600
      : joinForm.paymentMethod === 'jazzcash'
        ? colors.red500
        : colors.slate800;

  const title =
    joinForm.paymentMethod === 'easypaisa'
      ? 'Easypaisa'
      : joinForm.paymentMethod === 'jazzcash'
        ? 'JazzCash'
        : 'Secure Card';
  const subtitle =
    joinForm.paymentMethod === 'card' ? 'Online Checkout' : 'Mobile Wallet Checkout';

  return (
    <Modal visible={showGateway} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient colors={[...headerColors]} style={styles.header}>
            <Ionicons
              name={joinForm.paymentMethod === 'card' ? 'card' : 'wallet'}
              size={28}
              color="#fff"
            />
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{subtitle}</Text>
          </LinearGradient>

          <View style={styles.body}>
            {gatewayStep === 'phone' && (
              <View>
                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>Amount to Pay</Text>
                  <Text style={styles.amountVal}>Rs. {half}</Text>
                </View>
                <Text style={styles.fieldLabel}>
                  {joinForm.paymentMethod === 'card' ? 'Card Number' : 'Mobile Number'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    joinForm.paymentMethod === 'card' ? '4111 1111 1111 1111' : '03XX XXXXXXX'
                  }
                  placeholderTextColor={colors.slate400}
                  keyboardType={joinForm.paymentMethod === 'card' ? 'default' : 'phone-pad'}
                  value={gatewayPhone}
                  onChangeText={setGatewayPhone}
                />
                {error ? <Text style={styles.err}>{error}</Text> : null}
                <Pressable
                  style={[styles.cta, { backgroundColor: headerColors[0] }]}
                  onPress={handleGatewayNext}
                >
                  <Text style={styles.ctaText}>Continue</Text>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </Pressable>
                <Pressable onPress={clearGateway} style={styles.cancelTextWrap}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            )}

            {gatewayStep === 'otp' && (
              <View style={styles.otpWrap}>
                <View style={styles.shieldBox}>
                  <Ionicons name="shield-checkmark" size={36} color={colors.primary600} />
                </View>
                <Text style={styles.otpHint}>
                  Enter 4-digit verification code sent to{'\n'}
                  <Text style={styles.otpPhone}>{gatewayPhone}</Text>
                </Text>
                <TextInput
                  style={styles.otpInput}
                  maxLength={4}
                  keyboardType="number-pad"
                  placeholder="1234"
                  placeholderTextColor={colors.slate300}
                  value={gatewayOtp}
                  onChangeText={setGatewayOtp}
                />
                {error ? <Text style={styles.err}>{error}</Text> : null}
                <Pressable
                  style={[styles.cta, { backgroundColor: colors.slate900 }]}
                  onPress={handleGatewayNext}
                >
                  <Text style={styles.ctaText}>Verify & Pay</Text>
                </Pressable>
                <Pressable onPress={gatewayBackToPhone} style={styles.cancelTextWrap}>
                  <Text style={styles.cancelText}>Go Back</Text>
                </Pressable>
              </View>
            )}

            {gatewayStep === 'processing' && (
              <View style={styles.centerBlock}>
                <ActivityIndicator size="large" color={spinColor} style={{ marginVertical: 24 }} />
                <Text style={styles.procTitle}>Processing Payment</Text>
                <Text style={styles.procSub}>Please do not close this window</Text>
              </View>
            )}

            {gatewayStep === 'success' && (
              <View style={styles.centerBlock}>
                <View
                  style={[
                    styles.successCircle,
                    joinForm.paymentMethod === 'easypaisa'
                      ? styles.successGreen
                      : joinForm.paymentMethod === 'jazzcash'
                        ? styles.successRed
                        : styles.successBlue,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={56}
                    color={
                      joinForm.paymentMethod === 'easypaisa'
                        ? '#16a34a'
                        : joinForm.paymentMethod === 'jazzcash'
                          ? '#dc2626'
                          : '#2563eb'
                    }
                  />
                </View>
                <Text style={styles.successTitle}>Successful!</Text>
                <Text style={styles.procSub}>Payment securely captured.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    overflow: 'hidden',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  header: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 8 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, fontWeight: '500' },
  body: { padding: 28 },
  amountBox: {
    backgroundColor: colors.slate50,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate100,
    marginBottom: 20,
  },
  amountLabel: {
    color: colors.slate500,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  amountVal: { fontSize: 28, fontWeight: '700', color: colors.slate800, marginTop: 4 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: undefined }),
  },
  err: { color: colors.red600, marginTop: 10, fontSize: 13 },
  cta: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelTextWrap: { marginTop: 14, alignItems: 'center' },
  cancelText: { color: colors.slate500, fontSize: 14, fontWeight: '500' },
  otpWrap: { alignItems: 'center' },
  shieldBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  otpHint: { textAlign: 'center', color: colors.slate600, fontSize: 14, lineHeight: 22 },
  otpPhone: { fontWeight: '700', color: colors.slate800, fontSize: 16 },
  otpInput: {
    marginTop: 16,
    width: 160,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: colors.slate50,
  },
  centerBlock: { alignItems: 'center', paddingVertical: 24 },
  procTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate800,
    marginTop: 16,
  },
  procSub: {
    color: colors.slate500,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successGreen: { backgroundColor: colors.green100 },
  successRed: { backgroundColor: colors.red100 },
  successBlue: { backgroundColor: colors.blue100 },
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.slate800, marginTop: 8 },
});
