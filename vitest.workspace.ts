import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/core/vite.config.ts',
  'packages/react/vite.config.ts',
  'packages/export/vite.config.ts',
]);
