import type { RowNode, RowData } from '../types/index.js';

export class SelectionModel<TData = RowData> {
  private selectedIds: Set<string> = new Set();
  private mode: 'single' | 'multiple' | 'range' | false;
  private lastSelectedId: string | null = null;

  constructor(mode: 'single' | 'multiple' | 'range' | false = 'multiple') {
    this.mode = mode;
  }

  setMode(mode: 'single' | 'multiple' | 'range' | false): void {
    this.mode = mode;
    this.clearSelection();
  }

  selectRow(id: string, multi = false): void {
    if (this.mode === false) return;
    if (this.mode === 'single' || !multi) {
      this.selectedIds.clear();
      this.selectedIds.add(id);
    } else {
      this.selectedIds.add(id);
    }
    this.lastSelectedId = id;
  }

  deselectRow(id: string): void {
    this.selectedIds.delete(id);
  }

  toggleRow(id: string, multi = false): void {
    if (this.isSelected(id)) {
      this.deselectRow(id);
    } else {
      this.selectRow(id, multi);
    }
  }

  selectRange(ids: string[], anchorId: string, targetId: string): void {
    if (this.mode !== 'range' && this.mode !== 'multiple') return;
    const anchorIdx = ids.indexOf(anchorId);
    const targetIdx = ids.indexOf(targetId);
    if (anchorIdx === -1 || targetIdx === -1) return;
    const start = Math.min(anchorIdx, targetIdx);
    const end = Math.max(anchorIdx, targetIdx);
    this.selectedIds.clear();
    for (let i = start; i <= end; i++) {
      const rowId = ids[i];
      if (rowId) this.selectedIds.add(rowId);
    }
  }

  selectAll(ids: string[]): void {
    if (this.mode === false || this.mode === 'single') return;
    for (const id of ids) {
      this.selectedIds.add(id);
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
    this.lastSelectedId = null;
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  getSelectedIds(): string[] {
    return [...this.selectedIds];
  }

  getLastSelectedId(): string | null {
    return this.lastSelectedId;
  }

  getSelectedRows(rowNodes: RowNode<TData>[]): TData[] {
    return rowNodes
      .filter((node) => this.selectedIds.has(node.id))
      .map((node) => node.data);
  }

  getSelectedCount(): number {
    return this.selectedIds.size;
  }

  /** Clear all selection. Alias of {@link clearSelection} for API symmetry. */
  deselectAll(): void {
    this.clearSelection();
  }

  /** True when every id in the given set is selected (and the set is non-empty). */
  isAllSelected(ids: string[]): boolean {
    if (ids.length === 0) return false;
    return ids.every((id) => this.selectedIds.has(id));
  }

  /** True when some, but not all, of the given ids are selected. */
  isIndeterminate(ids: string[]): boolean {
    if (ids.length === 0) return false;
    const selectedInSet = ids.filter((id) => this.selectedIds.has(id)).length;
    return selectedInSet > 0 && selectedInSet < ids.length;
  }

  /**
   * Toggle the whole set: if all are currently selected, deselect them;
   * otherwise select them all. No-op in 'single' or disabled modes.
   */
  toggleAll(ids: string[]): void {
    if (this.mode === false || this.mode === 'single') return;
    if (this.isAllSelected(ids)) {
      for (const id of ids) this.selectedIds.delete(id);
    } else {
      for (const id of ids) this.selectedIds.add(id);
    }
  }
}
