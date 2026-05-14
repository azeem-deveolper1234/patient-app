import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AuthHero from '../components/AuthHero';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { CLINIC_BRAND, STRINGS } from '../constants/app';
import { colors } from '../theme/colors';
import { getApiErrorMessage } from '../utils/apiError';
import { isNonEmpty, isValidEmail } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!isNonEmpty(email)) {
      setError(STRINGS.validation.emailRequired);
      return;
    }
    if (!isValidEmail(email)) {
      setError(STRINGS.validation.emailInvalid);
      return;
    }
    if (!isNonEmpty(password)) {
      setError(STRINGS.validation.passwordRequired);
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, STRINGS.auth.loginFailedFallback));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        style={styles.scrollBg}
      >
        <View style={styles.card}>
          <AuthHero
            icon="pulse"
            iconSize={32}
            title={CLINIC_BRAND.fullName}
            subtitle={CLINIC_BRAND.queueTagline}
          />

          <View style={styles.form}>
            <Text style={styles.h2}>{STRINGS.auth.loginWelcome}</Text>
            <Text style={styles.muted}>{STRINGS.auth.loginSubtitle}</Text>

            {error ? (
              <View style={styles.errBanner}>
                <Ionicons name="alert-circle" size={20} color={colors.red500} style={{ marginRight: 10 }} />
                <Text style={styles.errTxt}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>{STRINGS.auth.emailLabel}</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={colors.slate400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={STRINGS.auth.placeholders.email}
                placeholderTextColor={colors.slate400}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>{STRINGS.auth.passwordLabel}</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.slate400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={STRINGS.auth.placeholders.password}
                placeholderTextColor={colors.slate400}
                secureTextEntry
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable
              style={[styles.btn, loading && styles.btnDis]}
              onPress={onSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.a11y.submitLogin}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.btnTxt}>{STRINGS.auth.signInCta}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Register')}
              style={styles.linkRow}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.a11y.goRegister}
            >
              <Text style={styles.link}>{STRINGS.auth.noAccount}</Text>
              <Text style={styles.linkBold}>{STRINGS.auth.registerLink}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollBg: { backgroundColor: colors.slate50 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate100,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  form: { padding: 28 },
  h2: { fontSize: 22, fontWeight: '700', color: colors.slate800 },
  muted: { color: colors.slate500, fontSize: 13, marginTop: 6, marginBottom: 20 },
  errBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.red50,
    borderLeftWidth: 4,
    borderLeftColor: colors.red500,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errTxt: { flex: 1, color: colors.red700, fontSize: 13, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600', color: colors.slate700, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 4 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.slate800 },
  btn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary600,
    paddingVertical: 16,
    borderRadius: 14,
  },
  btnDis: { opacity: 0.7 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' },
  link: { color: colors.slate500, fontSize: 14 },
  linkBold: { color: colors.primary600, fontSize: 14, fontWeight: '700' },
});
