---
sidebar_position: 6
---

# Theming

OpenGrid uses CSS custom properties (variables) for all visual styling.

## Using a Built-in Theme

```ts
// Light theme
import '@opengrid/themes/dist/opengrid-light.css';

// Dark theme
import '@opengrid/themes/dist/opengrid-dark.css';
```

Activate a theme by setting `data-og-theme` on a parent element:

```html
<div data-og-theme="opengrid-light">
  <!-- grid goes here -->
</div>
```

Or apply it to `:root` for a global theme.

## applyTheme Helper

```typescript
import { applyTheme } from '@opengrid/themes';

applyTheme('opengrid-dark'); // applies to document.documentElement
applyTheme('opengrid-light', myContainer);
```

## CSS Variables Reference

| Variable | Purpose |
|---|---|
| `--og-background` | Grid background |
| `--og-header-bg` | Header row background |
| `--og-row-bg` | Default row background |
| `--og-row-alt-bg` | Alternating row background |
| `--og-row-hover-bg` | Row hover background |
| `--og-border-color` | Cell/header borders |
| `--og-text-color` | Cell text |
| `--og-header-text-color` | Header text |
| `--og-selected-row-bg` | Selected row background |
| `--og-font-family` | Font |
| `--og-font-size` | Base font size |
| `--og-row-height` | Row height (CSS reference) |
| `--og-header-height` | Header height |
| `--og-focus-ring` | Keyboard focus ring |

## Custom Theme

Override any variable after importing a base theme:

```css
[data-og-theme="my-brand"] {
  --og-background: #fff7ed;
  --og-header-bg: #fff;
  --og-selected-row-bg: #fde68a;
  --og-border-color: #e5e7eb;
  --og-text-color: #111827;
  --og-font-family: 'Inter', sans-serif;
}
```
