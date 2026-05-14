import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { STRINGS } from '../constants/app';
import { colors } from '../theme/colors';
import { getApiErrorMessage } from '../utils/apiError';
import { isNonEmpty, isValidEmail } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!isNonEmpty(name)) {
      setError(STRINGS.validation.nameRequired);
      return;
    }
    if (!isNonEmpty(email)) {
      setError(STRINGS.validation.emailRequired);
      return;
    }
    if (!isValidEmail(email)) {
      setError(STRINGS.validation.emailInvalid);
      return;
    }
    if (password.length < 6) {
      setError(STRINGS.validation.passwordShort);
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      Alert.alert(STRINGS.auth.registerSuccessTitle, STRINGS.auth.registerSuccessBody, [
        { text: STRINGS.auth.registerSuccessOk, onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, STRINGS.auth.registerFailedFallback));
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
            icon="person-add"
            iconSize={30}
            title={STRINGS.auth.registerHeroTitle}
            subtitle={STRINGS.auth.registerHeroSubtitle}
            compact
          />

          <View style={styles.form}>
            <Text style={styles.h2}>{STRINGS.auth.registerHeading}</Text>
            <Text style={styles.muted}>{STRINGS.auth.registerSubtitle}</Text>

            {error ? (
              <View style={styles.errBanner}>
                <Ionicons name="alert-circle" size={20} color={colors.red500} style={{ marginRight: 10 }} />
                <Text style={styles.errTxt}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>{STRINGS.auth.fullNameLabel}</Text>
            <TextInput
              style={styles.inputSolo}
              placeholder={STRINGS.auth.placeholders.name}
              placeholderTextColor={colors.slate400}
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{STRINGS.auth.emailLabel}</Text>
            <TextInput
              style={styles.inputSolo}
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

            <Text style={styles.label}>{STRINGS.auth.phoneLabel}</Text>
            <TextInput
              style={styles.inputSolo}
              placeholder={STRINGS.auth.placeholders.phone}
              placeholderTextColor={colors.slate400}
              autoCorrect={false}
              autoComplete="tel"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>{STRINGS.auth.passwordHint}</Text>
            <TextInput
              style={styles.inputSolo}
              placeholder={STRINGS.auth.placeholders.password}
              placeholderTextColor={colors.slate400}
              secureTextEntry
              autoCorrect={false}
              autoComplete="password-new"
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              style={[styles.btn, loading && styles.btnDis]}
              onPress={onSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.a11y.submitRegister}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnTxt}>{STRINGS.auth.registerCta}</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.linkRow}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.a11y.goLogin}
            >
              <Text style={styles.link}>{STRINGS.auth.hasAccount}</Text>
              <Text style={styles.linkBold}>{STRINGS.auth.signIn}</Text>
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
  scroll: { flexGrow: 1, padding: 20, paddingVertical: 32 },
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
  form: { padding: 24 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.slate800 },
  muted: { color: colors.slate500, fontSize: 13, marginTop: 6, marginBottom: 16 },
  errBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.red50,
    borderLeftWidth: 4,
    borderLeftColor: colors.red500,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  errTxt: { flex: 1, color: colors.red700, fontSize: 13, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600', color: colors.slate700, marginBottom: 6, marginTop: 4 },
  inputSolo: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.slate800,
    marginBottom: 4,
  },
  btn: {
    marginTop: 18,
    backgroundColor: colors.primary600,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDis: { opacity: 0.7 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' },
  link: { color: colors.slate500, fontSize: 14 },
  linkBold: { color: colors.primary600, fontSize: 14, fontWeight: '700' },
});
