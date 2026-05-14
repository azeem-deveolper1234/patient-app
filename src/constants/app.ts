/**
 * Single source of truth for clinic branding & user-facing copy.
 * Launch / rebrand: mostly edit this file only.
 */
export const CLINIC_BRAND = {
  shortName: 'City Medical',
  fullName: 'City Medical Clinic',
  portalLabel: 'Patient Portal',
  queueTagline: 'Queue & appointments',
  receiptSubheader: 'Virtual queue & appointments',
} as const;

export const STRINGS = {
  nav: {
    registerHeader: 'Create account',
  },
  auth: {
    loginWelcome: 'Welcome back',
    loginSubtitle: 'Sign in to book visits and track your queue.',
    registerHeroTitle: 'Create account',
    registerHeroSubtitle: `Join ${CLINIC_BRAND.fullName}`,
    registerHeading: 'Patient registration',
    registerSubtitle: 'Use the same account as the web patient portal.',
    signIn: 'Sign in',
    signInCta: 'Sign In',
    registerCta: 'Create account',
    noAccount: "Don't have an account? ",
    registerLink: 'Register',
    hasAccount: 'Already have an account? ',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    fullNameLabel: 'Full name',
    phoneLabel: 'Phone (optional)',
    passwordHint: 'Password (min 6 characters)',
    placeholders: {
      email: 'you@example.com',
      password: 'Enter password',
      name: 'Your full name',
      phone: '03XX…',
    },
    registerSuccessTitle: 'Account created',
    registerSuccessBody: 'You can now sign in with your email and password.',
    registerSuccessOk: 'Go to sign in',
    loginFailedFallback: 'Sign-in failed. Check your email and password.',
    registerFailedFallback: 'Registration could not be completed. Please try again.',
  },
  network: {
    timeout:
      'The server took too long to respond. Check that the API is running and EXPO_PUBLIC_API_URL is correct, then try again.',
    unreachable:
      'Cannot reach the server. On a physical device, set EXPO_PUBLIC_API_URL to http://YOUR_PC_IP:5000/api (same Wi‑Fi), restart Expo, and try again.',
  },
  validation: {
    nameRequired: 'Please enter your full name.',
    emailRequired: 'Please enter a valid email address.',
    emailInvalid: 'That email does not look valid.',
    passwordRequired: 'Please enter your password.',
    passwordShort: 'Password must be at least 6 characters.',
  },
  a11y: {
    submitLogin: 'Sign in',
    submitRegister: 'Create account',
    goRegister: 'Go to registration',
    goLogin: 'Back to sign in',
  },
} as const;
