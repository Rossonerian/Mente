/** @jest-environment node */

const { transformFileSync } = require('@babel/core');
const { describe, expect, it } = require('@jest/globals');
const { dirname, resolve } = require('node:path');
const { createRequire } = require('node:module');
const { runInNewContext } = require('node:vm');
const sourceDirectory = dirname(require.resolve('./config.ts'));
const loadRuntimeHelper = createRequire(require.resolve('./config.production.test.js'));

const publicValues = {
  EXPO_PUBLIC_API_BASE_URL: 'https://api.example.test/v1/',
  EXPO_PUBLIC_SUPABASE_URL: 'https://identity.example.test/',
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'synthetic-publishable-key',
  EXPO_PUBLIC_MENTE_MOCK_MODE: 'true',
};

// Use the installed Expo production transformer, not Jest's development environment.
// The evaluated bundle deliberately has neither `process` nor runtime env injection.
function productionConfig(platform, values = publicValues) {
  const previous = Object.fromEntries(Object.keys(publicValues).map((key) => [key, process.env[key]]));
  try {
    for (const key of Object.keys(publicValues)) {
      if (values[key] === undefined) delete process.env[key];
      else process.env[key] = values[key];
    }
    const transform = (name) => transformFileSync(resolve(sourceDirectory, name), {
      babelrc: false,
      configFile: false,
      caller: { name: 'metro', platform, isDev: false, bundler: 'metro', isServer: false, preserveEnvVars: false },
      presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
    });
    const evaluate = (result, dependencies = {}) => {
      const exports = {};
      runInNewContext(result.code, {
        exports, URL, __DEV__: false,
        require: (name) => {
          if (name.startsWith('@babel/runtime/helpers/')) return loadRuntimeHelper(name);
          if (!(name in dependencies)) throw new Error(`Unexpected runtime import: ${name}`);
          return dependencies[name];
        },
      });
      return exports;
    };
    const errors = evaluate(transform('errors.ts'));
    return evaluate(transform('config.ts'), { './errors': errors });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

describe.each(['web', 'android', 'ios'])('production public configuration (%s)', (platform) => {
  it('uses build-time public values without a runtime process object', () => {
    const config = productionConfig(platform);
    expect(config.getApiBaseUrl()).toBe('https://api.example.test/v1');
    expect(config.getSupabasePublicConfig()).toEqual({
      url: 'https://identity.example.test', publishableKey: 'synthetic-publishable-key',
    });
  });

  it('never enables development mocks in a production bundle', () => {
    expect(productionConfig(platform).isDevelopmentMockMode).toBe(false);
  });

  it('fails closed when build configuration is absent', () => {
    const config = productionConfig(platform, {});
    expect(() => config.getApiBaseUrl()).toThrow('EXPO_PUBLIC_API_BASE_URL is required');
    expect(config.getSupabasePublicConfig()).toBeNull();
  });

  it('normalizes whitespace and retains the existing localhost allowance', () => {
    const config = productionConfig(platform, {
      ...publicValues,
      EXPO_PUBLIC_API_BASE_URL: '  http://localhost:8000/v1/  ',
      EXPO_PUBLIC_SUPABASE_URL: '  https://identity.example.test/  ',
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '  synthetic-publishable-key  ',
    });
    expect(config.getApiBaseUrl()).toBe('http://localhost:8000/v1');
    expect(config.getSupabasePublicConfig()).toEqual({
      url: 'https://identity.example.test', publishableKey: 'synthetic-publishable-key',
    });
  });

  it('fails closed for blank public configuration', () => {
    const config = productionConfig(platform, Object.fromEntries(Object.keys(publicValues).map((key) => [key, '  '])));
    expect(() => config.getApiBaseUrl()).toThrow('EXPO_PUBLIC_API_BASE_URL is required');
    expect(config.getSupabasePublicConfig()).toBeNull();
  });

  it('rejects a partially configured Supabase client', () => {
    const config = productionConfig(platform, {
      ...publicValues,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
    });
    expect(() => config.getSupabasePublicConfig()).toThrow('must be configured together');
  });

  it('preserves HTTPS validation instead of hiding invalid configuration', () => {
    const config = productionConfig(platform, {
      ...publicValues,
      EXPO_PUBLIC_API_BASE_URL: 'http://api.example.test/v1',
      EXPO_PUBLIC_SUPABASE_URL: 'http://identity.example.test',
    });
    expect(() => config.getApiBaseUrl()).toThrow('must be an HTTPS URL');
    expect(() => config.getSupabasePublicConfig()).toThrow('must be an HTTPS URL');
  });
});
