import { globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

export default [
  globalIgnores(['dist/**', 'node_modules/**', '.expo/**', 'coverage/**', '**/.venv/**']),
  ...expoConfig,
];
