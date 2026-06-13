---
sidebar_position: 2
---

# Filtering

OpenGrid supports text, number, date, and set filters.

## Enabling the Filter Row

```tsx
<OpenGrid showFilterRow columnDefs={columns} rowData={data} />
```

The filter row renders below the header. Text-filterable columns get an input box.

## FilterCondition

```typescript
interface FilterCondition {
  type: 'text' | 'number' | 'date' | 'set';
  operator:
    | 'contains' | 'equals' | 'startsWith' | 'endsWith'  // text
    | 'greaterThan' | 'lessThan' | 'between' | 'inRange'  // number
    | 'before' | 'after'                                   // date
    | 'inSet';                                             // set
  value: unknown;
  valueTo?: unknown; // for between/inRange
}
```

## Programmatic API

```typescript
// Apply filters
api.setFilterModel({
  name: { type: 'text', operator: 'contains', value: 'alice' },
  age:  { type: 'number', operator: 'greaterThan', value: 25 },
});

// Clear all filters
api.setFilterModel({});

// Read current filters
const current = api.getFilterModel();
```

## Set Filter Example

```typescript
api.setFilterModel({
  department: {
    type: 'set',
    operator: 'inSet',
    value: ['Engineering', 'Design'],
  },
});
```

## onChange Callback

```tsx
<OpenGrid
  onFilterChanged={(model) => {
    // persist model, update URL, etc.
  }}
/>
```
