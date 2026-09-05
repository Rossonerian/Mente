import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';

const config = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    menteCaregiver: {
      ...defaultConfig.themes.light,
      background: '#F7F8FF',
      color: '#18204B',
      borderColor: '#D9DDF4',
    },
    mentePatient: {
      ...defaultConfig.themes.light,
      background: '#FFF8ED',
      color: '#3D2D29',
      borderColor: '#EACFC0',
    },
  },
});

export type MenteTamaguiConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends MenteTamaguiConfig {}
}

export default config;
