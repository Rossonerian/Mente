export function getSafeCaregiverSignInMessage(providerMessage: string): string {
  const normalized = providerMessage.trim().toLowerCase();
  if (normalized.includes('invalid login credentials')) {
    return 'That email or password was not recognized. Please try again.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  return 'We could not sign you in. Please check your email and password, then try again.';
}
