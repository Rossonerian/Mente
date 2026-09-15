import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, create } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createCaregiverClient } from '../../api/caregiverClient';
import { ApiError } from '../../api/errors';
import { CaregiverSetupScreen } from './CaregiverSetupScreen';

jest.mock('../../api/caregiverClient', () => ({ createCaregiverClient: jest.fn() }));
jest.mock('../../api/config', () => ({ isDevelopmentMockMode: false }));
jest.mock('tamagui', () => ({ Input: 'Input' }));
jest.mock('../../components/PageHeader', () => ({ PageHeader: 'PageHeader' }));
jest.mock('../../components/Screen', () => ({ ScreenScroll: 'ScreenScroll' }));
jest.mock('../../components/Card', () => ({ SurfaceCard: 'SurfaceCard', SoftPanel: 'SoftPanel' }));
jest.mock('../../components/Button', () => ({ MenteButton: 'MenteButton', TextButton: 'TextButton' }));
jest.mock('../../components/Icon', () => ({ MenteIcon: 'MenteIcon' }));

describe('family and patient setup saves', () => {
  let screen;
  let queryClient;
  let client;
  let onBack;
  let onSaved;
  let actEnvironment;
  const family = { id: 'family-new', name: 'New Family', mode: 'SOLO', created_at: '2026-09-13T00:00:00Z' };
  const patient = { id: 'patient-new', family_id: 'family-new', preferred_name: 'New Patient', timezone: 'Asia/Kolkata', preferred_language: 'en-IN', active: true, created_at: '2026-09-13T00:00:00Z' };

  beforeEach(() => {
    actEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
    client = { createFamily: jest.fn().mockResolvedValue(family), createPatient: jest.fn().mockResolvedValue(patient) };
    createCaregiverClient.mockReturnValue(client);
    onBack = jest.fn();
    onSaved = jest.fn();
  });
  afterEach(async () => {
    if (screen) await act(async () => screen.unmount());
    queryClient.clear();
    global.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    jest.clearAllMocks();
  });
  async function render() {
    await act(async () => { screen = create(<QueryClientProvider client={queryClient}><CaregiverSetupScreen caregiverId="caregiver-test" accessToken="test-token" onBack={onBack} onSaved={onSaved} /></QueryClientProvider>); });
  }
  async function fill(label, value) { await act(async () => screen.root.findAllByType('Input').find((field) => field.props.accessibilityLabel === label).props.onChangeText(value)); }
  async function save(label = 'Save setup') { await act(async () => screen.root.findAllByType('MenteButton').find((button) => button.props.label === label).props.onPress()); }
  async function details() { await fill('Family name', 'New Family'); await fill('Preferred name', 'New Patient'); }

  it('persists both records and immediately selects the server-returned profile', async () => {
    queryClient.setQueryData(['caregiver', 'caregiver-test', 'context'], { family: { id: 'old-family' }, patient: { id: 'old-patient' } });
    await render();
    await details();
    await fill('Patient phone', '+919876543210');
    await save();
    expect(client.createFamily).toHaveBeenCalledWith({ name: 'New Family', mode: 'SOLO' });
    expect(client.createPatient).toHaveBeenCalledWith('family-new', expect.objectContaining({ preferred_name: 'New Patient', phone_e164: '+919876543210' }));
    expect(queryClient.getQueryData(['caregiver', 'caregiver-test', 'context'])).toEqual({ family, patient });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
  });

  it('retries a failed patient save without creating a duplicate family', async () => {
    client.createPatient.mockRejectedValueOnce(new ApiError({ kind: 'offline', message: 'Check your connection.' }));
    await render();
    await details();
    await save();
    expect(onBack).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(JSON.stringify(screen.toJSON())).toContain('The family profile was saved.');
    expect(screen.root.findAllByType('Input').find((field) => field.props.accessibilityLabel === 'Family name').props.disabled).toBe(true);
    await save('Retry adding person');
    expect(client.createFamily).toHaveBeenCalledTimes(1);
    expect(client.createPatient).toHaveBeenCalledTimes(2);
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it('keeps the form open and displays API field errors on patient failure', async () => {
    client.createPatient.mockRejectedValue(new ApiError({ kind: 'validation', message: 'Review the details.', fieldErrors: { preferredName: 'Enter a preferred name.' } }));
    await render();
    await details();
    await save();
    expect(onBack).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(JSON.stringify(screen.toJSON())).toContain('Enter a preferred name.');
    expect(screen.root.findAllByType('Input').find((field) => field.props.accessibilityLabel === 'Preferred name').props.value).toBe('New Patient');
  });

  it('blocks incomplete form submission before any records are created', async () => {
    await render();
    await save();
    expect(client.createFamily).not.toHaveBeenCalled();
    expect(client.createPatient).not.toHaveBeenCalled();
    expect(JSON.stringify(screen.toJSON())).toContain('Enter a family name.');
  });

  it('uses the original Settings back callback for cancel and header back without saving', async () => {
    const navigate = jest.fn();
    onBack.mockImplementation(() => navigate('settings'));
    await render();
    await act(async () => screen.root.findByType('TextButton').props.onPress());
    await act(async () => screen.root.findByType('PageHeader').props.onBack());
    expect(navigate.mock.calls).toEqual([['settings'], ['settings']]);
    expect(onSaved).not.toHaveBeenCalled();
    expect(client.createFamily).not.toHaveBeenCalled();
  });
});
