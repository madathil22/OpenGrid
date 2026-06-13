---
sidebar_position: 2
---

# Filtering

OpenGrid supports text, number, date, set, and custom filters, plus a global
quick filter. Column filters combine with **AND**.

## Try it out

Type in the filter inputs below the headers to narrow the rows.

```jsx live
<OpenGrid rowData={employees} columnDefs={columns} height={280} showFilterRow />
```

## Enabling the Filter Row

```tsx
<OpenGrid showFilterRow columnDefs={columns} rowData={data} />
```

The filter row renders below the header. Text-filterable columns get an input box.

## FilterCondition

```typescript
interface FilterCondition {
  type: 'text' | 'number' | 'date' | 'set' | 'custom';
  operator?:
    | 'contains' | 'notContains' | 'equals' | 'notEqual'
    | 'startsWith' | 'endsWith' | 'blank' | 'notBlank'      // text
    | 'greaterThan' | 'greaterThanOrEqual'
    | 'lessThan' | 'lessThanOrEqual' | 'between' | 'inRange' // number
    | 'before' | 'after'                                     // date
    | 'inSet';                                               // set
  value?: unknown;
  valueTo?: unknown;                  // for between/inRange
  predicate?: (params: { value: unknown; data: TData; condition: FilterCondition }) => boolean; // for type 'custom'
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

// Build the option list from the data:
const departments = api.filterModel.getUniqueValues(api.getVisibleRows(), 'department');
```

## Custom Filter

For logic the built-in operators don't cover, use `type: 'custom'` with a
`predicate`. Return `true` to keep the row.

```typescript
api.setFilterModel({
  email: {
    type: 'custom',
    predicate: ({ value }) => String(value).endsWith('@ubs.com'),
  },
});
```

## Quick Filter

A global, case-insensitive substring match across **all** columns. It combines
with column filters using AND.

```typescript
api.setQuickFilter('london');  // keep rows where any column contains "london"
api.setQuickFilter('');        // clear
const text = api.getQuickFilter();
```

## onChange Callback

```tsx
<OpenGrid
  onFilterChanged={(model) => {
    // persist model, update URL, etc.
  }}
/>
```
