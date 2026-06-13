import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(resolve(__dirname, 'dist'), { recursive: true });

copyFileSync(
  resolve(__dirname, 'src/opengrid-light.css'),
  resolve(__dirname, 'dist/opengrid-light.css'),
);
copyFileSync(
  resolve(__dirname, 'src/opengrid-dark.css'),
  resolve(__dirname, 'dist/opengrid-dark.css'),
);

// Compile index.ts manually (simple re-export)
writeFileSync(
  resolve(__dirname, 'dist/index.js'),
  `export const themes = ['opengrid-light', 'opengrid-dark'];

export function applyTheme(name, element = document.documentElement) {
  element.setAttribute('data-og-theme', name);
}
`,
);

writeFileSync(
  resolve(__dirname, 'dist/index.d.ts'),
  `export declare const themes: string[];
export declare function applyTheme(name: string, element?: HTMLElement): void;
`,
);

console.log('Themes built successfully.');
