import { getResponsiveLayout } from './responsive';

describe('responsive layout', () => {
  it('keeps a compact mobile web layout below the tablet breakpoint', () => {
    expect(getResponsiveLayout(320, 'web')).toMatchObject({
      isWideWeb: false,
      isDesktopWeb: false,
      contentMaxWidth: undefined,
    });
  });

  it('uses the wider caregiver canvas from tablet width onward', () => {
    expect(getResponsiveLayout(768, 'web')).toMatchObject({
      isWideWeb: true,
      isDesktopWeb: false,
      contentMaxWidth: 1180,
    });
    expect(getResponsiveLayout(1440, 'web')).toMatchObject({
      isWideWeb: true,
      isDesktopWeb: true,
      contentMaxWidth: 1180,
    });
  });

  it('does not apply browser-only expansion to native layouts', () => {
    expect(getResponsiveLayout(1024, 'native')).toMatchObject({
      isWideWeb: false,
      isDesktopWeb: false,
      contentMaxWidth: undefined,
    });
  });
});
