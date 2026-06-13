import type { ColumnDef, ColumnState } from '../types/index.js';

export class ColumnModel<TData = Record<string, unknown>> {
  private columns: ColumnDef<TData>[] = [];
  private columnState: Map<string, ColumnState> = new Map();

  setColumns(defs: ColumnDef<TData>[]): void {
    this.columns = [...defs];
    // Merge existing state; initialize missing entries
    const next = new Map<string, ColumnState>();
    for (const col of defs) {
      const existing = this.columnState.get(col.field);
      next.set(col.field, {
        colId: col.field,
        width: existing?.width ?? col.width,
        hide: existing?.hide ?? col.hide ?? false,
        pinned: existing?.pinned ?? col.pinned ?? null,
        sort: existing?.sort ?? null,
        sortIndex: existing?.sortIndex ?? null,
      });
    }
    this.columnState = next;
  }

  getColumns(): ColumnDef<TData>[] {
    return this.columns;
  }

  getVisibleColumns(): ColumnDef<TData>[] {
    return this.columns.filter((col) => {
      const state = this.columnState.get(col.field);
      return !(state?.hide ?? col.hide ?? false);
    });
  }

  getColumnById(colId: string): ColumnDef<TData> | undefined {
    return this.columns.find((c) => c.field === colId);
  }

  setColumnState(states: ColumnState[]): void {
    for (const state of states) {
      this.columnState.set(state.colId, { ...state });
    }
    // Reorder columns array to match state order if all colIds provided
    const stateIds = states.map((s) => s.colId);
    if (stateIds.length === this.columns.length) {
      const colMap = new Map(this.columns.map((c) => [c.field, c]));
      const reordered: ColumnDef<TData>[] = [];
      for (const id of stateIds) {
        const col = colMap.get(id);
        if (col) reordered.push(col);
      }
      if (reordered.length === this.columns.length) {
        this.columns = reordered;
      }
    }
  }

  getColumnState(): ColumnState[] {
    return this.columns.map((col) => {
      const state = this.columnState.get(col.field);
      return {
        colId: col.field,
        width: state?.width ?? col.width,
        hide: state?.hide ?? col.hide ?? false,
        pinned: state?.pinned ?? col.pinned ?? null,
        sort: state?.sort ?? null,
        sortIndex: state?.sortIndex ?? null,
      };
    });
  }

  showColumn(colId: string): void {
    const state = this.columnState.get(colId);
    if (state) {
      this.columnState.set(colId, { ...state, hide: false });
    } else {
      this.columnState.set(colId, { colId, hide: false });
    }
  }

  hideColumn(colId: string): void {
    const state = this.columnState.get(colId);
    if (state) {
      this.columnState.set(colId, { ...state, hide: true });
    } else {
      this.columnState.set(colId, { colId, hide: true });
    }
  }

  setPinned(colId: string, pinned: 'left' | 'right' | null): void {
    const state = this.columnState.get(colId);
    if (state) {
      this.columnState.set(colId, { ...state, pinned });
    } else {
      this.columnState.set(colId, { colId, pinned });
    }
  }

  moveColumn(colId: string, toIndex: number): void {
    const fromIndex = this.columns.findIndex((c) => c.field === colId);
    if (fromIndex === -1) return;
    const [col] = this.columns.splice(fromIndex, 1) as [ColumnDef<TData>];
    const clampedIndex = Math.max(0, Math.min(toIndex, this.columns.length));
    this.columns.splice(clampedIndex, 0, col);
  }

  resizeColumn(colId: string, width: number): void {
    const col = this.getColumnById(colId);
    const minW = col?.minWidth ?? 40;
    const maxW = col?.maxWidth ?? Infinity;
    const clampedWidth = Math.max(minW, Math.min(maxW, width));
    const state = this.columnState.get(colId);
    if (state) {
      this.columnState.set(colId, { ...state, width: clampedWidth });
    } else {
      this.columnState.set(colId, { colId, width: clampedWidth });
    }
  }

  getSortState(): { colId: string; sort: 'asc' | 'desc'; sortIndex: number }[] {
    const entries: { colId: string; sort: 'asc' | 'desc'; sortIndex: number }[] = [];
    for (const [colId, state] of this.columnState) {
      if (state.sort && state.sortIndex != null) {
        entries.push({ colId, sort: state.sort, sortIndex: state.sortIndex });
      }
    }
    return entries.sort((a, b) => a.sortIndex - b.sortIndex);
  }

  setSortState(colId: string, sort: 'asc' | 'desc' | null, sortIndex: number | null): void {
    const state = this.columnState.get(colId);
    if (state) {
      this.columnState.set(colId, { ...state, sort, sortIndex });
    } else {
      this.columnState.set(colId, { colId, sort, sortIndex });
    }
  }

  getEffectiveWidth(colId: string): number {
    const state = this.columnState.get(colId);
    if (state?.width != null) return state.width;
    const col = this.getColumnById(colId);
    return col?.width ?? 150;
  }
}
