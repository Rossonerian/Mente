import { z } from 'zod';
import type { CaregiverSettingsFormValues } from '../../../api/adapters/caregiverSettings';

const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
const e164 = /^\+[1-9]\d{7,31}$/;

const optionalTime = z.string().trim().refine((value) => value === '' || hhmm.test(value), {
  message: 'Enter a time in HH:MM format.',
});

export const caregiverSettingsSchema = z.object({
  localTime: z.string().trim().regex(hhmm, 'Enter a time in HH:MM format.'),
  timezone: z.string().trim().min(1, 'Enter a time zone.').max(64, 'Time zone must be 64 characters or fewer.'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, 'Choose at least one day.').max(7),
  quietStart: optionalTime,
  quietEnd: optionalTime,
  languageCode: z.string().trim().min(1, 'Enter a language code.').max(32, 'Language code must be 32 characters or fewer.'),
  active: z.boolean(),
  allowOneRetry: z.boolean(),
  sameDayEnabled: z.boolean(),
  routineEnabled: z.boolean(),
  caregiverPhoneE164: z.string().trim().refine((value) => value === '' || e164.test(value), {
    message: 'Enter a phone number with country code, such as +919999999999.',
  }),
  remindersPaused: z.boolean(),
}).superRefine((values, context) => {
  if ((values.quietStart === '') !== (values.quietEnd === '')) {
    context.addIssue({ code: 'custom', path: [values.quietStart === '' ? 'quietStart' : 'quietEnd'], message: 'Provide both quiet-hour times or leave both blank.' });
  }
  if (values.quietStart && values.quietEnd && values.quietStart === values.quietEnd) {
    context.addIssue({ code: 'custom', path: ['quietEnd'], message: 'Quiet-hour start and end must be different.' });
  }
}) satisfies z.ZodType<CaregiverSettingsFormValues>;
