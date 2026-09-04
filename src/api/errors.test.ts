import { createApiError } from './errors';

describe('createApiError', () => {
  it('maps FastAPI validation details to safe form errors without exposing server messages', () => {
    const error = createApiError(422, {
      detail: [{ loc: ['body', 'caregiver_phone_e164'], msg: 'Value error, unsupported number' }],
    });

    expect(error.message).toBe('Please review the highlighted details.');
    expect(error.fieldErrors).toEqual({ caregiverPhoneE164: 'Enter a phone number with country code, such as +919999999999.' });
    expect(error.message).not.toContain('unsupported number');
  });

  it('maps the documented activation constraint to the active field', () => {
    const error = createApiError(422, { detail: 'A patient phone number is required before activating the call schedule' });
    expect(error.fieldErrors).toEqual({ active: 'Add a patient phone number before turning on the daily companion call.' });
  });
});
