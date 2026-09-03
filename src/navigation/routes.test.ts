import { getDefaultRoute, getRoleTabs } from './routes';
import { getNextPromptIndex, hidesPatientTabs } from './interaction';

describe('Mente role navigation', () => {
  it('starts each role at its primary experience', () => {
    expect(getDefaultRoute('caregiver')).toBe('home');
    expect(getDefaultRoute('patient')).toBe('play');
  });

  it('keeps the caregiver and patient tab sets distinct', () => {
    expect(getRoleTabs('caregiver').map((tab) => tab.route)).toEqual([
      'home',
      'history',
      'family',
      'settings',
    ]);
    expect(getRoleTabs('patient').map((tab) => tab.route)).toEqual([
      'play',
      'family',
      'help',
    ]);
  });

  it('makes the final patient prompt a calm completion point', () => {
    expect(getNextPromptIndex(0, 3)).toBe(1);
    expect(getNextPromptIndex(1, 3)).toBe(2);
    expect(getNextPromptIndex(2, 3)).toBeNull();
  });

  it('hides patient tabs while attention is on an active or completed moment', () => {
    expect(hidesPatientTabs('play')).toBe(false);
    expect(hidesPatientTabs('in-game')).toBe(true);
    expect(hidesPatientTabs('complete')).toBe(true);
  });
});
