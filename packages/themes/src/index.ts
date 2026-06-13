export const themes = ['opengrid-light', 'opengrid-dark'] as const;
export type ThemeName = (typeof themes)[number];

export function applyTheme(name: ThemeName, element: HTMLElement = document.documentElement): void {
  element.setAttribute('data-og-theme', name);
}
