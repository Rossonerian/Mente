import { browserSupportsBackdropFilter, clearBackdropFilterSupportCache } from './GlassSurface.web';

describe('GlassSurface.web backdrop filter support caching', () => {
  const originalCss = window.CSS;

  beforeEach(() => {
    clearBackdropFilterSupportCache();
  });

  afterEach(() => {
    window.CSS = originalCss;
  });

  it('caches the result of window.CSS.supports to avoid redundant queries', () => {
    const mockSupports = jest.fn((property: string, _value: string) => property === 'backdrop-filter');

    // @ts-expect-error Mocking window.CSS for test environment
    window.CSS = {
      supports: mockSupports,
    };

    const filterString = 'blur(10px)';

    // First check should invoke window.CSS.supports
    const result1 = browserSupportsBackdropFilter(filterString);
    expect(result1).toBe(true);
    expect(mockSupports).toHaveBeenCalledTimes(1);

    // Second check with same filter string should use cached value
    const result2 = browserSupportsBackdropFilter(filterString);
    expect(result2).toBe(true);
    expect(mockSupports).toHaveBeenCalledTimes(1); // Call count remains 1 due to cache
  });

  it('clears cache when clearBackdropFilterSupportCache is called', () => {
    const mockSupports = jest.fn(() => true);

    // @ts-expect-error Mocking window.CSS for test environment
    window.CSS = {
      supports: mockSupports,
    };

    const filterString = 'blur(20px)';

    browserSupportsBackdropFilter(filterString);
    expect(mockSupports).toHaveBeenCalledTimes(1);

    clearBackdropFilterSupportCache();

    browserSupportsBackdropFilter(filterString);
    expect(mockSupports).toHaveBeenCalledTimes(2);
  });
});
