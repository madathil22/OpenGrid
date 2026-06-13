import type { RowNode, ColumnDef, RowData } from '../types/index.js';

export interface SortModelEntry {
  colId: string;
  sort: 'asc' | 'desc';
  sortIndex: number;
}

function getFieldValue(data: unknown, field: string): unknown {
  if (data != null && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return undefined;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  return String(a).localeCompare(String(b));
}

export class SortModel<TData = RowData> {
  private sorts: SortModelEntry[] = [];

  addSort(colId: string, direction: 'asc' | 'desc'): void {
    const existing = this.sorts.findIndex((s) => s.colId === colId);
    if (existing !== -1) {
      this.sorts[existing] = { colId, sort: direction, sortIndex: this.sorts[existing]!.sortIndex };
    } else {
      this.sorts.push({ colId, sort: direction, sortIndex: this.sorts.length });
    }
  }

  removeSort(colId: string): void {
    this.sorts = this.sorts.filter((s) => s.colId !== colId);
    // Recalculate sortIndex
    this.sorts = this.sorts.map((s, i) => ({ ...s, sortIndex: i }));
  }

  clearSorts(): void {
    this.sorts = [];
  }

  getSorts(): SortModelEntry[] {
    return [...this.sorts].sort((a, b) => a.sortIndex - b.sortIndex);
  }

  setSorts(entries: SortModelEntry[]): void {
    this.sorts = [...entries];
  }

  applySorting(rows: RowNode<TData>[], columns: ColumnDef<TData>[]): RowNode<TData>[] {
    if (this.sorts.length === 0) return rows;

    const sortedEntries = this.getSorts();
    const colById = new Map(columns.map((c) => [c.field, c]));

    const sortLevel = (nodes: RowNode<TData>[]): RowNode<TData>[] => {
      const sorted = [...nodes].sort((a, b) => {
        for (const entry of sortedEntries) {
          const col = colById.get(entry.colId);
          if (!col) continue;

          let aVal: unknown;
          let bVal: unknown;

          if (col.valueGetter) {
            aVal = col.valueGetter({ data: a.data, colDef: col });
            bVal = col.valueGetter({ data: b.data, colDef: col });
          } else {
            aVal = getFieldValue(a.data, entry.colId);
            bVal = getFieldValue(b.data, entry.colId);
          }

          // Nulls/blanks always sort to the end, regardless of direction.
          const aNull = aVal == null || aVal === '';
          const bNull = bVal == null || bVal === '';
          if (aNull && bNull) continue;
          if (aNull) return 1;
          if (bNull) return -1;

          const cmp = col.comparator
            ? col.comparator(aVal, bVal, a, b)
            : compareValues(aVal, bVal);
          if (cmp !== 0) {
            return entry.sort === 'asc' ? cmp : -cmp;
          }
        }
        return 0;
      });

      // Recurse into group children so nested rows stay ordered too.
      return sorted.map((node) =>
        node.isGroup && node.children && node.children.length > 0
          ? { ...node, children: sortLevel(node.children) }
          : node,
      );
    };

    return sortLevel(rows);
  }
}
