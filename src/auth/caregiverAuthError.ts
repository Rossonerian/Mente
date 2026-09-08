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

export function getSafeCaregiverSignUpMessage(providerMessage: string): string {
  const normalized = providerMessage.trim().toLowerCase();
  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'An account with that email already exists. Try signing in instead.';
  }
  if (normalized.includes('password')) {
    return 'Choose a stronger password and try again.';
  }
  return 'We could not create your caregiver account. Please review your details and try again.';
}
