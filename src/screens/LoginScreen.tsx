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
  Vibration,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, logoScale]);

  const onSubmit = async () => {
    setError('');
    if (!isNonEmpty(email)) {
      setError(STRINGS.validation.emailRequired);
      Vibration.vibrate(80);
      return;
    }
    if (!isValidEmail(email)) {
      setError(STRINGS.validation.emailInvalid);
      Vibration.vibrate(80);
      return;
    }
    if (!isNonEmpty(password)) {
      setError(STRINGS.validation.passwordRequired);
      Vibration.vibrate(80);
      return;
    }
    setLoading(true);
    Vibration.vibrate(40);
    try {
      await login(email.trim(), password);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, STRINGS.auth.loginFailedFallback));
      Vibration.vibrate(120);
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
        colors={['#0a0f1d', '#111827']}
        style={styles.container}
      >
        {/* Background Ambient Glows */}
        <View style={styles.glowTop} pointerEvents="none" />
        <View style={styles.glowBottom} pointerEvents="none" />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          <Animated.View 
            style={[
              styles.card, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Custom Premium Header Panel */}
            <LinearGradient
              colors={[colors.primary600, '#0f766e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <Animated.View style={[styles.heroIconWrap, { transform: [{ scale: logoScale }] }]}>
                <Ionicons name="pulse" size={32} color="#fff" />
              </Animated.View>
              <Text style={styles.heroTitle}>{CLINIC_BRAND.fullName}</Text>
              <Text style={styles.heroSub}>{CLINIC_BRAND.queueTagline}</Text>
            </LinearGradient>

            <View style={styles.form}>
              <Text style={styles.h2}>{STRINGS.auth.loginWelcome}</Text>
              <Text style={styles.muted}>{STRINGS.auth.loginSubtitle}</Text>

              {error ? (
                <Animated.View style={styles.errBanner}>
                  <Ionicons name="alert-circle" size={20} color="#f43f5e" style={{ marginRight: 10 }} />
                  <Text style={styles.errTxt}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Email Input Field */}
              <Text style={styles.label}>{STRINGS.auth.emailLabel}</Text>
              <View 
                style={[
                  styles.inputRow, 
                  emailFocused && styles.inputRowActive
                ]}
              >
                <Ionicons 
                  name="mail-outline" 
                  size={18} 
                  color={emailFocused ? colors.primary500 : '#475569'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder={STRINGS.auth.placeholders.email}
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              {/* Password Input Field */}
              <Text style={styles.label}>{STRINGS.auth.passwordLabel}</Text>
              <View 
                style={[
                  styles.inputRow, 
                  passFocused && styles.inputRowActive
                ]}
              >
                <Ionicons 
                  name="lock-closed-outline" 
                  size={18} 
                  color={passFocused ? colors.primary500 : '#475569'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder={STRINGS.auth.placeholders.password}
                  placeholderTextColor="#475569"
                  secureTextEntry
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
              </View>

              {/* Action Button */}
              <Pressable
                onPress={onSubmit}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.a11y.submitLogin}
                style={({ pressed }) => [
                  styles.btnPressable,
                  pressed && styles.btnPressed
                ]}
              >
                <LinearGradient
                  colors={[colors.primary500, '#0d9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.btn, loading && styles.btnDis]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.btnTxt}>{STRINGS.auth.signInCta}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Navigation Link */}
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
  container: { flex: 1, position: 'relative' },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    opacity: 0.8,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    opacity: 0.8,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 60,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { color: '#ccfbf1', fontSize: 13, marginTop: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  form: { padding: 32, paddingTop: 28 },
  h2: { fontSize: 22, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  muted: { color: '#64748b', fontSize: 14, marginTop: 6, marginBottom: 26, lineHeight: 20, fontWeight: '500' },
  errBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#f43f5e',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.15)',
  },
  errTxt: { flex: 1, color: '#fda4af', fontSize: 13, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '900', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0f19',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  inputRowActive: {
    borderColor: colors.primary500,
    backgroundColor: '#0e1424',
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15, color: '#f1f5f9', fontWeight: '600' },
  btnPressable: { marginTop: 10 },
  btnPressed: { transform: [{ scale: 0.98 }] },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  btnDis: { opacity: 0.7 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' },
  link: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  linkBold: { color: colors.primary500, fontSize: 14, fontWeight: '800', marginLeft: 6 },
});
