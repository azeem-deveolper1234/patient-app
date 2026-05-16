import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import { shadows } from '../theme/shadows';
import { getApiErrorMessage } from '../utils/apiError';
import { isNonEmpty, isValidEmail } from '../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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
            <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
              onPress={onSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.a11y.submitLogin}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.btnTxt}>{STRINGS.auth.signInCta}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </LinearGradient>
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
        </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollBg: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
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
  label: { fontSize: 13, fontWeight: '700', color: colors.slate700, marginBottom: 8, letterSpacing: 0.3 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: colors.slate800, fontWeight: '500' },
  btn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    ...shadows.glow,
  },
  btnDis: { opacity: 0.7 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' },
  link: { color: colors.slate500, fontSize: 14, fontWeight: '500' },
  linkBold: { color: colors.primary600, fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
