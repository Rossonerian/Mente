import { QueryClient } from '@tanstack/react-query';
import type { CaregiverSettingsFormValues } from '../../../api/adapters/caregiverSettings';
import { applySettingsSaveSuccess, mergeSavedFormValues } from './useCaregiverSettings';
import { caregiverSettingsKeys } from './queryKeys';

const formValues: CaregiverSettingsFormValues = {
  localTime: '09:00', timezone: 'Asia/Kolkata', daysOfWeek: [0, 1], quietStart: '', quietEnd: '', languageCode: 'en-IN',
  active: false, allowOneRetry: false, sameDayEnabled: true, routineEnabled: false, caregiverPhoneE164: '+919999999999', remindersPaused: false,
};

describe('caregiver settings save behavior', () => {
  it('uses the server response and invalidates only the saved caregiver-patient settings key', async () => {
    const queryClient = new QueryClient();
    const key = caregiverSettingsKeys.detail('caregiver-1', 'patient-1');
    queryClient.setQueryData(key, { schedule: null, notificationPreference: null });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    applySettingsSaveSuccess(queryClient, 'caregiver-1', 'patient-1', {
      schedule: { id: 'schedule-1', patient_id: 'patient-1', local_time: '10:00', timezone: 'Asia/Kolkata', days_of_week: [1], quiet_start: null, quiet_end: null, language_code: 'en-IN', active: true, allow_one_retry: false, updated_at: '2026-09-05T00:00:00Z' },
    });

    expect(queryClient.getQueryData(key)).toMatchObject({ schedule: { local_time: '10:00', active: true } });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
    queryClient.clear();
  });

  it('keeps values that did not receive a server response so a recoverable failed save does not wipe the form', () => {
    expect(mergeSavedFormValues(formValues, {
      schedule: { id: 'schedule-1', patient_id: 'patient-1', local_time: '10:00', timezone: 'Asia/Kolkata', days_of_week: [1], quiet_start: null, quiet_end: null, language_code: 'en-IN', active: true, allow_one_retry: false, updated_at: '2026-09-05T00:00:00Z' },
    })).toMatchObject({ localTime: '10:00', caregiverPhoneE164: '+919999999999', sameDayEnabled: true });
  });

  it('isolates settings keys between caregiver accounts and patients', () => {
    expect(caregiverSettingsKeys.detail('caregiver-1', 'patient-1')).not.toEqual(caregiverSettingsKeys.detail('caregiver-2', 'patient-1'));
    expect(caregiverSettingsKeys.detail('caregiver-1', 'patient-1')).not.toEqual(caregiverSettingsKeys.detail('caregiver-1', 'patient-2'));
  });
});
