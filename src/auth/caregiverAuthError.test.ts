import { getSafeCaregiverSignInMessage } from './caregiverAuthError';

describe('caregiver sign-in feedback', () => {
  it('does not reveal a provider error message to the caregiver', () => {
    expect(getSafeCaregiverSignInMessage('JWT verification failed at internal host')).toBe(
      'We could not sign you in. Please check your email and password, then try again.',
    );
  });

  it('provides a clear safe message for invalid credentials', () => {
    expect(getSafeCaregiverSignInMessage('Invalid login credentials')).toBe(
      'That email or password was not recognized. Please try again.',
    );
  });
});
