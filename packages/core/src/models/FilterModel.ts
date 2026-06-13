import type { RowNode, ColumnDef, FilterCondition, FilterOperator, RowData } from '../types/index.js';

/** The data-independent fields the built-in filters read. */
type BuiltinCondition = { operator?: FilterOperator; value?: unknown; valueTo?: unknown };

function getFieldValue(data: unknown, field: string): unknown {
  if (data != null && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return undefined;
}

function isBlank(value: unknown): boolean {
  return value == null || String(value).trim() === '';
}

function applyTextFilter(value: unknown, condition: BuiltinCondition): boolean {
  const strVal = String(value ?? '').toLowerCase();
  const filterVal = String(condition.value ?? '').toLowerCase();

  switch (condition.operator) {
    case 'contains':
      return strVal.includes(filterVal);
    case 'notContains':
      return !strVal.includes(filterVal);
    case 'equals':
      return strVal === filterVal;
    case 'notEqual':
      return strVal !== filterVal;
    case 'startsWith':
      return strVal.startsWith(filterVal);
    case 'endsWith':
      return strVal.endsWith(filterVal);
    case 'blank':
      return isBlank(value);
    case 'notBlank':
      return !isBlank(value);
    default:
      return true;
  }
}

function applyNumberFilter(value: unknown, condition: BuiltinCondition): boolean {
  const numVal = Number(value);
  const filterVal = Number(condition.value);

  if (Number.isNaN(numVal)) return condition.operator === 'blank' ? isBlank(value) : false;

  switch (condition.operator) {
    case 'equals':
      return numVal === filterVal;
    case 'notEqual':
      return numVal !== filterVal;
    case 'greaterThan':
      return numVal > filterVal;
    case 'greaterThanOrEqual':
      return numVal >= filterVal;
    case 'lessThan':
      return numVal < filterVal;
    case 'lessThanOrEqual':
      return numVal <= filterVal;
    case 'between':
    case 'inRange': {
      const valTo = Number(condition.valueTo);
      return numVal >= filterVal && numVal <= valTo;
    }
    case 'blank':
      return isBlank(value);
    case 'notBlank':
      return !isBlank(value);
    default:
      return true;
  }
}

function applyDateFilter(value: unknown, condition: BuiltinCondition): boolean {
  const dateVal = new Date(String(value ?? '')).getTime();
  const filterDate = new Date(String(condition.value ?? '')).getTime();

  if (Number.isNaN(dateVal) || Number.isNaN(filterDate)) return false;

  switch (condition.operator) {
    case 'equals':
      return dateVal === filterDate;
    case 'notEqual':
      return dateVal !== filterDate;
    case 'before':
    case 'lessThan':
      return dateVal < filterDate;
    case 'after':
    case 'greaterThan':
      return dateVal > filterDate;
    case 'between':
    case 'inRange': {
      const toDate = new Date(String(condition.valueTo ?? '')).getTime();
      return dateVal >= filterDate && dateVal <= toDate;
    }
    default:
      return true;
  }
}

function applySetFilter(value: unknown, condition: BuiltinCondition): boolean {
  if (!Array.isArray(condition.value)) return true;
  const set = condition.value as unknown[];
  return set.some((s) => String(s) === String(value));
}

function matchesCondition<TData>(
  cellValue: unknown,
  condition: FilterCondition<TData>,
  data: TData,
): boolean {
  switch (condition.type) {
    case 'text':
      return applyTextFilter(cellValue, condition);
    case 'number':
      return applyNumberFilter(cellValue, condition);
    case 'date':
      return applyDateFilter(cellValue, condition);
    case 'set':
      return applySetFilter(cellValue, condition);
    case 'custom':
      return condition.predicate
        ? condition.predicate({ value: cellValue, data, condition })
        : true;
    default:
      return true;
  }
}

export class FilterModel<TData = RowData> {
  private filters: Map<string, FilterCondition<TData>> = new Map();
  private quickFilter = '';

  setFilter(colId: string, condition: FilterCondition<TData>): void {
    this.filters.set(colId, condition);
  }

  removeFilter(colId: string): void {
    this.filters.delete(colId);
  }

  clearFilters(): void {
    this.filters.clear();
  }

  getFilters(): Record<string, FilterCondition<TData>> {
    return Object.fromEntries(this.filters);
  }

  /** Global quick filter — matched (case-insensitive substring) across all columns. */
  setQuickFilter(text: string): void {
    this.quickFilter = text.trim().toLowerCase();
  }

  getQuickFilter(): string {
    return this.quickFilter;
  }

  /** True when no column filters and no quick filter are active. */
  isEmpty(): boolean {
    return this.filters.size === 0 && this.quickFilter === '';
  }

  /** Distinct cell values for a column, for building set-filter option lists. */
  getUniqueValues(rows: RowNode<TData>[], colId: string, column?: ColumnDef<TData>): unknown[] {
    const seen = new Set<string>();
    const out: unknown[] = [];
    for (const node of rows) {
      if (node.isGroup) continue;
      const value =
        column?.valueGetter != null
          ? column.valueGetter({ data: node.data, colDef: column })
          : getFieldValue(node.data, colId);
      const key = String(value);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(value);
      }
    }
    return out;
  }

  applyFilters(rows: RowNode<TData>[], columns: ColumnDef<TData>[]): RowNode<TData>[] {
    if (this.isEmpty()) return rows;

    const colById = new Map(columns.map((c) => [c.field, c]));

    const resolveValue = (node: RowNode<TData>, colId: string): unknown => {
      const col = colById.get(colId);
      return col?.valueGetter ? col.valueGetter({ data: node.data, colDef: col }) : getFieldValue(node.data, colId);
    };

    return rows.filter((node) => {
      if (node.isGroup) return true; // Group rows pass through

      // Column filters (AND across columns).
      for (const [colId, condition] of this.filters) {
        if (!matchesCondition(resolveValue(node, colId), condition, node.data)) {
          return false;
        }
      }

      // Quick filter: row passes if ANY column contains the text.
      if (this.quickFilter !== '') {
        const hit = columns.some((col) => {
          const v = resolveValue(node, col.field);
          return String(v ?? '').toLowerCase().includes(this.quickFilter);
        });
        if (!hit) return false;
      }

      return true;
    });
  }
}
