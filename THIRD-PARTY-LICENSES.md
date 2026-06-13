# Third-Party Licenses

OpenGrid is licensed under the [MIT License](./LICENSE). This document lists the
third-party packages that OpenGrid's **published** packages depend on at runtime,
together with their licenses, so that downstream consumers (including enterprise
compliance reviewers) can audit obligations without inspecting `node_modules`.

Build-time and development-only tooling (Vite, Vitest, TypeScript, ESLint,
Docusaurus, etc.) is **not** distributed in the published packages and is
therefore excluded from this list.

## Runtime dependencies

| Package | Used by | Relationship | License | Obligation |
|---|---|---|---|---|
| _none_ | `@opengrid/core` | — | — | Zero runtime dependencies. |
| _none_ | `@opengrid/themes` | — | — | Zero runtime dependencies. |
| `react`, `react-dom` | `@opengrid/react` | peer dependency (not bundled) | MIT | Supplied by the host application; OpenGrid bundles no copy. |
| `xlsx` (SheetJS Community Edition) | `@opengrid/export` | **optional** peer dependency, lazily imported | Apache-2.0 | Preserve the SheetJS license/NOTICE when redistributing. Only relevant if you opt into the built-in Excel writer. |

### Notes

- **`@opengrid/core` and `@opengrid/themes` have no runtime dependencies.** They
  are safe to adopt with zero transitive license obligations.

- **`@opengrid/react`** declares `react` / `react-dom` as *peer* dependencies.
  The host application provides them; OpenGrid neither bundles nor redistributes
  React, so no additional obligation flows from this package.

- **`@opengrid/export`** treats `xlsx` as an **optional** peer dependency:
  - CSV export (`CsvExporter`) has **no dependencies** whatsoever.
  - Excel export only loads `xlsx` (via dynamic `import("xlsx")`) the first time
    you actually export to `.xlsx` **and** only when you have not supplied your
    own writer.
  - You may avoid `xlsx` entirely by passing a custom `ExcelWriter` to
    `new ExcelExporter(writer)` (e.g. backed by ExcelJS or a maintained SheetJS
    build). In that case no Apache-2.0 code is involved.

## SheetJS (`xlsx`) — Apache-2.0 attribution

If you redistribute software that bundles the SheetJS Community Edition, include
the following attribution (per Apache-2.0 §4):

```
This product includes software developed by SheetJS LLC (https://sheetjs.com/).
Licensed under the Apache License, Version 2.0.
```

The full Apache-2.0 text is available at
https://www.apache.org/licenses/LICENSE-2.0 and in the `xlsx` package's own
`LICENSE` file under `node_modules/xlsx/`.

## Security note

The npm distribution of `xlsx@0.18.5` is not actively maintained on npm (SheetJS
publishes newer releases from their own CDN) and has known advisories. If your
organization's security policy flags it, prefer supplying a custom `ExcelWriter`
backed by a maintained library rather than relying on the default SheetJS path.
