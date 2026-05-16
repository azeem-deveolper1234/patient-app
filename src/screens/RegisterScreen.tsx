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
import { shadows } from '../theme/shadows';
import { getApiErrorMessage } from '../utils/apiError';
import { isNonEmpty, isValidEmail } from '../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';

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
      >
        <LinearGradient
          colors={[colors.slate50, colors.slate100]}
          style={styles.scrollBg}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === 'android'}
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
              onPress={onSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.a11y.submitRegister}
            >
              <LinearGradient
                colors={[colors.primary500, colors.primary600]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.btn, loading && styles.btnDis]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnTxt}>{STRINGS.auth.registerCta}</Text>
                )}
              </LinearGradient>
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
        </LinearGradient>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollBg: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingVertical: 40, justifyContent: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    ...shadows.soft,
  },
  form: { padding: 32, paddingTop: 20 },
  h2: { fontSize: 24, fontWeight: '800', color: colors.slate800, letterSpacing: -0.5 },
  muted: { color: colors.slate500, fontSize: 14, marginTop: 6, marginBottom: 24, lineHeight: 20 },
  errBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.red50,
    borderLeftWidth: 4,
    borderLeftColor: colors.red500,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    ...shadows.soft,
  },
  errTxt: { flex: 1, color: colors.red700, fontSize: 13, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: colors.slate700, marginBottom: 8, marginTop: 4, letterSpacing: 0.3 },
  inputSolo: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.slate800,
    fontWeight: '500',
    marginBottom: 8,
  },
  btn: {
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.glow,
  },
  btnDis: { opacity: 0.7 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' },
  link: { color: colors.slate500, fontSize: 14, fontWeight: '500' },
  linkBold: { color: colors.primary600, fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
