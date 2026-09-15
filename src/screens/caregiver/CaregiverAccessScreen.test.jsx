import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, create } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { useCaregiverAuth } from '../../auth/CaregiverAuthContext';
import { createCaregiverClient } from '../../api/caregiverClient';
import { CaregiverProfileSetupScreen, CaregiverRegistrationScreen, CaregiverSignInScreen } from './CaregiverAccessScreen';

jest.mock('../../auth/CaregiverAuthContext', () => ({ useCaregiverAuth: jest.fn() }));
jest.mock('../../api/caregiverClient', () => ({ createCaregiverClient: jest.fn() }));
jest.mock('../../components/PageHeader', () => ({ PageHeader: 'PageHeader' }));
jest.mock('../../components/Screen', () => ({ ScreenScroll: 'ScreenScroll' }));
jest.mock('../../components/Card', () => ({ SurfaceCard: 'SurfaceCard' }));
jest.mock('../../components/Button', () => ({ MenteButton: 'MenteButton' }));

describe('caregiver access forms', () => {
  let screen;
  let auth;
  let createProfile;
  let originalActEnvironment;

  beforeEach(() => {
    originalActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    auth = { state: { kind: 'signed-out', configured: true }, signIn: jest.fn().mockResolvedValue(null), signUp: jest.fn().mockResolvedValue(null), signOut: jest.fn().mockResolvedValue(undefined) };
    useCaregiverAuth.mockReturnValue(auth);
    createProfile = jest.fn().mockResolvedValue({ id: 'caregiver-1' });
    createCaregiverClient.mockReturnValue({ createProfile });
  });

  afterEach(async () => {
    if (screen) await act(async () => screen.unmount());
    screen = undefined;
    global.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
    jest.clearAllMocks();
  });

  async function render(element) { await act(async () => { screen = create(element); }); }
  async function fill(label, value) { await act(async () => screen.root.findAllByType(TextInput).find((input) => input.props.accessibilityLabel === label).props.onChangeText(value)); }
  function button(label) { return screen.root.findAllByType('MenteButton').find((item) => item.props.label === label); }
  async function press(label) { await act(async () => button(label).props.onPress()); }
  function content() { return JSON.stringify(screen.toJSON()); }

  async function fillRegistration() {
    await fill('Your name', 'Test Caregiver');
    await fill('Email address', 'caregiver@example.test');
    await fill('Password', 'test-password-123');
    await fill('Confirm password', 'test-password-123');
  }

  it('validates sign-in before contacting the provider', async () => {
    await render(<CaregiverSignInScreen configured onRegister={jest.fn()} />);
    await press('Sign In');
    expect(auth.signIn).not.toHaveBeenCalled();
    expect(content()).toContain('Enter a valid email address and your password.');
  });

  it('submits sign-in credentials and displays provider feedback', async () => {
    auth.signIn.mockResolvedValue('That email or password was not recognized. Please try again.');
    await render(<CaregiverSignInScreen configured onRegister={jest.fn()} />);
    await fill('Email address', 'caregiver@example.test');
    await fill('Password', 'test-password-123');
    await press('Sign In');
    expect(auth.signIn).toHaveBeenCalledWith('caregiver@example.test', 'test-password-123');
    expect(content()).toContain('That email or password was not recognized. Please try again.');
    expect(screen.root.findAllByType(TextInput).find((input) => input.props.accessibilityLabel === 'Password').props.secureTextEntry).toBe(true);
  });

  it('shows configuration feedback and prevents unconfigured submission', async () => {
    await render(<CaregiverSignInScreen configured={false} onRegister={jest.fn()} />);
    expect(button('Sign In').props.disabled).toBe(true);
    await press('Sign In');
    expect(auth.signIn).not.toHaveBeenCalled();
    expect(content()).toContain('Caregiver access is not configured.');
  });

  it('shows loading state and blocks duplicate sign-in requests', async () => {
    let resolve;
    auth.signIn.mockImplementation(() => new Promise((done) => { resolve = done; }));
    await render(<CaregiverSignInScreen configured onRegister={jest.fn()} />);
    await fill('Email address', 'caregiver@example.test');
    await fill('Password', 'test-password-123');
    await press('Sign In');
    expect(button('Signing in…').props.disabled).toBe(true);
    await press('Signing in…');
    expect(auth.signIn).toHaveBeenCalledTimes(1);
    await act(async () => resolve(null));
    expect(button('Sign In').props.disabled).toBe(false);
  });

  it('shows network failure and permits a sign-in retry', async () => {
    auth.signIn.mockRejectedValue(new Error('network unavailable'));
    await render(<CaregiverSignInScreen configured onRegister={jest.fn()} />);
    await fill('Email address', 'caregiver@example.test');
    await fill('Password', 'test-password-123');
    await press('Sign In');
    expect(content()).toContain('Check your connection and try again.');
    expect(button('Sign In').props.disabled).toBe(false);
  });

  it('validates matching passwords before registration', async () => {
    await render(<CaregiverRegistrationScreen configured onBack={jest.fn()} />);
    await fillRegistration();
    await fill('Confirm password', 'different-password');
    await press('Register');
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(content()).toContain('Your passwords do not match.');
  });

  it('submits registration without requiring email confirmation', async () => {
    const onBack = jest.fn();
    auth.signUp.mockResolvedValue(null);
    await render(<CaregiverRegistrationScreen configured onBack={onBack} />);
    await fillRegistration();
    await press('Register');
    expect(auth.signUp).toHaveBeenCalledWith('caregiver@example.test', 'test-password-123', 'Test Caregiver');
    expect(content()).toContain('Account created. Preparing your caregiver profile');
    expect(button('Register').props.disabled).toBe(false);
    await press('Back to Sign In');
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('saves the signed-in caregiver profile before continuing', async () => {
    auth.state = { kind: 'signed-in', user: { user_metadata: { display_name: 'Test Caregiver' } } };
    const onComplete = jest.fn();
    await render(<CaregiverProfileSetupScreen accessToken="test-session-token" onComplete={onComplete} />);
    await press('Continue');
    expect(createCaregiverClient).toHaveBeenCalledWith('test-session-token');
    expect(createProfile).toHaveBeenCalledWith({ display_name: 'Test Caregiver' });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('keeps profile setup open when saving fails', async () => {
    createProfile.mockRejectedValue(new Error('backend unavailable'));
    const onComplete = jest.fn();
    await render(<CaregiverProfileSetupScreen accessToken="test-session-token" onComplete={onComplete} />);
    await fill('Your name', 'Test Caregiver');
    await press('Continue');
    expect(onComplete).not.toHaveBeenCalled();
    expect(content()).toContain('We could not finish your caregiver profile.');
    expect(button('Continue').props.disabled).toBe(false);
  });
});
