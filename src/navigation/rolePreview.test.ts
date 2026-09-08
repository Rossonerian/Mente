import { shouldShowRoleSwitcher } from './rolePreview';

describe('development role switching', () => {
  it('shows the role switcher for live API testing in development builds', () => {
    expect(shouldShowRoleSwitcher({ isDevelopmentBuild: true, showTabs: true })).toBe(true);
  });

  it('keeps the role switcher out of production builds', () => {
    expect(shouldShowRoleSwitcher({ isDevelopmentBuild: false, showTabs: true })).toBe(false);
  });

  it('does not add the switcher to focused patient flows', () => {
    expect(shouldShowRoleSwitcher({ isDevelopmentBuild: true, showTabs: false })).toBe(false);
  });
});
