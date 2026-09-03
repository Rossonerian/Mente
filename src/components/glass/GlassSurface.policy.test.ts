import { getAndroidGlassBehavior, getIosGlassStyle } from './GlassSurface.policy';
import { getGlassVisualTokens } from './GlassSurface.tokens';

describe('getAndroidGlassBehavior', () => {
  it('uses the SDK 31+ blur method when an Android 12 target is available', () => {
    expect(getAndroidGlassBehavior(31, true)).toEqual({
      blurMethod: 'dimezisBlurViewSdk31Plus',
      shouldRenderBlur: true,
    });
  });

  it('uses the translucent fallback below Android 12', () => {
    expect(getAndroidGlassBehavior(30, true)).toEqual({
      blurMethod: 'dimezisBlurViewSdk31Plus',
      shouldRenderBlur: false,
    });
  });

  it('uses the translucent fallback when no shared blur target is available', () => {
    expect(getAndroidGlassBehavior(35, false)).toEqual({
      blurMethod: 'dimezisBlurViewSdk31Plus',
      shouldRenderBlur: false,
    });
  });
});

describe('getIosGlassStyle', () => {
  it('uses regular glass for elevated caregiver surfaces', () => {
    expect(getIosGlassStyle('caregiver', 'elevated')).toBe('regular');
  });

  it('uses clear glass for calm patient focus surfaces', () => {
    expect(getIosGlassStyle('patient', 'focus')).toBe('clear');
  });
});

describe('getGlassVisualTokens', () => {
  it('keeps chrome restrained while making elevated surfaces more dimensional', () => {
    const chrome = getGlassVisualTokens('caregiver', 'chrome');
    const elevated = getGlassVisualTokens('caregiver', 'elevated');

    expect(elevated.blurIntensity).toBeGreaterThan(chrome.blurIntensity);
    expect(elevated.shadowDepth).toBeGreaterThan(chrome.shadowDepth);
    expect(elevated.tintColor).not.toBe(chrome.tintColor);
  });

  it('gives patient focus glass a warmer treatment than subtle patient glass', () => {
    const focus = getGlassVisualTokens('patient', 'focus');
    const subtle = getGlassVisualTokens('patient', 'subtle');

    expect(focus.blurIntensity).toBeGreaterThan(subtle.blurIntensity);
    expect(focus.tintColor).not.toBe(subtle.tintColor);
    expect(focus.iosTintColor).not.toBe(subtle.iosTintColor);
  });

  it('provides a readable opaque fallback for every theme and variant', () => {
    for (const theme of ['caregiver', 'patient'] as const) {
      for (const variant of ['chrome', 'elevated', 'focus', 'subtle'] as const) {
        expect(getGlassVisualTokens(theme, variant).fallbackColor).toMatch(/^#/);
      }
    }
  });
});
