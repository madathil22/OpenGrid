import type { RowNode, ColumnDef, FilterCondition, RowData } from '../types/index.js';

function getFieldValue(data: unknown, field: string): unknown {
  if (data != null && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return undefined;
}

function applyTextFilter(value: unknown, condition: FilterCondition): boolean {
  const strVal = String(value ?? '').toLowerCase();
  const filterVal = String(condition.value ?? '').toLowerCase();

  switch (condition.operator) {
    case 'contains':
      return strVal.includes(filterVal);
    case 'equals':
      return strVal === filterVal;
    case 'startsWith':
      return strVal.startsWith(filterVal);
    case 'endsWith':
      return strVal.endsWith(filterVal);
    default:
      return true;
  }
}

function applyNumberFilter(value: unknown, condition: FilterCondition): boolean {
  const numVal = Number(value);
  const filterVal = Number(condition.value);

  if (isNaN(numVal)) return false;

  switch (condition.operator) {
    case 'equals':
      return numVal === filterVal;
    case 'greaterThan':
      return numVal > filterVal;
    case 'lessThan':
      return numVal < filterVal;
    case 'between':
    case 'inRange': {
      const valTo = Number(condition.valueTo);
      return numVal >= filterVal && numVal <= valTo;
    }
    default:
      return true;
  }
}

function applyDateFilter(value: unknown, condition: FilterCondition): boolean {
  const dateVal = new Date(String(value ?? '')).getTime();
  const filterDate = new Date(String(condition.value ?? '')).getTime();

  if (isNaN(dateVal) || isNaN(filterDate)) return false;

  switch (condition.operator) {
    case 'equals':
      return dateVal === filterDate;
    case 'before':
      return dateVal < filterDate;
    case 'after':
      return dateVal > filterDate;
    case 'between': {
      const toDate = new Date(String(condition.valueTo ?? '')).getTime();
      return dateVal >= filterDate && dateVal <= toDate;
    }
    default:
      return true;
  }
}

function applySetFilter(value: unknown, condition: FilterCondition): boolean {
  if (!Array.isArray(condition.value)) return true;
  const set = condition.value as unknown[];
  return set.some((s) => String(s) === String(value));
}

export class FilterModel<TData = RowData> {
  private filters: Map<string, FilterCondition> = new Map();

  setFilter(colId: string, condition: FilterCondition): void {
    this.filters.set(colId, condition);
  }

  removeFilter(colId: string): void {
    this.filters.delete(colId);
  }

  clearFilters(): void {
    this.filters.clear();
  }

  getFilters(): Record<string, FilterCondition> {
    return Object.fromEntries(this.filters);
  }

  applyFilters(rows: RowNode<TData>[], columns: ColumnDef<TData>[]): RowNode<TData>[] {
    if (this.filters.size === 0) return rows;

    return rows.filter((node) => {
      if (node.isGroup) return true; // Group rows pass through

      for (const [colId, condition] of this.filters) {
        const col = columns.find((c) => c.field === colId);
        let cellValue: unknown;

        if (col?.valueGetter) {
          cellValue = col.valueGetter({ data: node.data, colDef: col });
        } else {
          cellValue = getFieldValue(node.data, colId);
        }

        let passes = true;
        switch (condition.type) {
          case 'text':
            passes = applyTextFilter(cellValue, condition);
            break;
          case 'number':
            passes = applyNumberFilter(cellValue, condition);
            break;
          case 'date':
            passes = applyDateFilter(cellValue, condition);
            break;
          case 'set':
            passes = applySetFilter(cellValue, condition);
            break;
        }

        if (!passes) return false;
      }
      return true;
    });
  }
}
