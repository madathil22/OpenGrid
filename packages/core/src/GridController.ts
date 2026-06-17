import type {
  GridApi,
  GridOptions,
  ColumnDef,
  ColumnState,
  FilterModel as FilterModelType,
  SortModel as SortModelType,
  RowNode,
  RowData,
} from './types/index.js';
import { ColumnModel } from './models/ColumnModel.js';
import { DataModel } from './models/DataModel.js';
import { SortModel } from './models/SortModel.js';
import { FilterModel } from './models/FilterModel.js';
import { SelectionModel } from './models/SelectionModel.js';
import { RenderEngine } from './engines/RenderEngine.js';
import { GroupingEngine } from './engines/GroupingEngine.js';
import { ExportEngine } from './engines/ExportEngine.js';

export class GridController<TData = RowData> implements GridApi<TData> {
  private options: GridOptions<TData>;
  readonly columnModel: ColumnModel<TData>;
  readonly dataModel: DataModel<TData>;
  readonly sortModel: SortModel<TData>;
  readonly filterModel: FilterModel<TData>;
  readonly selectionModel: SelectionModel<TData>;
  readonly renderEngine: RenderEngine;
  readonly groupingEngine: GroupingEngine<TData>;
  readonly exportEngine: ExportEngine<TData>;

  private changeListeners: Set<() => void> = new Set();

  // ── Grouping state ──────────────────────────────────────────────────────────
  private groupFields: string[] = [];
  private groupTree: RowNode<TData>[] | null = null;
  private collapsedGroupIds: Set<string> = new Set();

  constructor(options: GridOptions<TData> = {}) {
    this.options = options;
    if (options.groupFields && (options.grouping ?? true)) {
      this.groupFields = [...options.groupFields];
    }
    this.columnModel = new ColumnModel<TData>();
    this.dataModel = new DataModel<TData>();
    this.sortModel = new SortModel<TData>();
    this.filterModel = new FilterModel<TData>();
    this.selectionModel = new SelectionModel<TData>(options.selection ?? 'multiple');
    this.renderEngine = new RenderEngine();
    this.groupingEngine = new GroupingEngine<TData>();
    this.exportEngine = new ExportEngine<TData>();

    if (options.columnDefs) {
      this.columnModel.setColumns(options.columnDefs);
    }
    if (options.rowData) {
      this.dataModel.setData(options.rowData);
      this._recompute();
    }

    // Fire onGridReady
    if (options.onGridReady) {
      options.onGridReady({ api: this });
    }
  }

  // ── Change notification ─────────────────────────────────────────────────────

  onChanged(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  private _notify(): void {
    for (const listener of this.changeListeners) {
      listener();
    }
  }

  // ── Internal recompute ──────────────────────────────────────────────────────

  private _recompute(): void {
    // Always start from the canonical, unfiltered node list so that relaxing a
    // filter restores previously hidden rows.
    let nodes = this.dataModel.getAllRowNodes();
    const columns = this.columnModel.getColumns();

    // Apply filters
    nodes = this.filterModel.applyFilters(nodes, columns);

    // Apply sorting
    nodes = this.sortModel.applySorting(nodes, columns);

    const leaves = nodes;
    const aggFunctions = this.groupingEngine.buildAggFunctionsFromColumns(columns);

    // Apply grouping
    if (this.groupFields.length > 0) {
      const grouped = this.groupingEngine.groupData(leaves, this.groupFields, aggFunctions);
      this.groupTree = grouped;
      nodes = this.groupingEngine.flattenGroups(grouped, {
        collapsedIds: this.collapsedGroupIds,
        includeFooter: this.options.groupIncludeFooter ?? false,
      });
    } else {
      this.groupTree = null;
    }

    // Grand-total footer (works with or without grouping, when aggregations exist).
    if (this.options.groupIncludeTotalFooter && Object.keys(aggFunctions).length > 0) {
      nodes = [...nodes, this.groupingEngine.computeGrandTotal(leaves, aggFunctions)];
    }

    this.dataModel.setRowNodes(nodes);
  }

  /** Re-flatten the stored group tree after a collapse/expand change. */
  private _reflattenGroups(): void {
    if (!this.groupTree) return;
    const columns = this.columnModel.getColumns();
    const aggFunctions = this.groupingEngine.buildAggFunctionsFromColumns(columns);
    let nodes = this.groupingEngine.flattenGroups(this.groupTree, {
      collapsedIds: this.collapsedGroupIds,
      includeFooter: this.options.groupIncludeFooter ?? false,
    });
    if (this.options.groupIncludeTotalFooter && Object.keys(aggFunctions).length > 0) {
      const leaves = this.dataModel
        .getAllRowNodes()
        .filter((n) => !n.isGroup);
      nodes = [...nodes, this.groupingEngine.computeGrandTotal(leaves, aggFunctions)];
    }
    this.dataModel.setRowNodes(nodes);
  }

  /** Every group id in the current tree (for expand/collapse all). */
  private _allGroupIds(): string[] {
    const ids: string[] = [];
    const walk = (nodes: RowNode<TData>[]): void => {
      for (const n of nodes) {
        if (n.isGroup) {
          ids.push(n.id);
          if (n.children) walk(n.children);
        }
      }
    };
    if (this.groupTree) walk(this.groupTree);
    return ids;
  }

  getVisibleRows(): RowNode<TData>[] {
    return this.dataModel.getRowNodes();
  }

  // ── GridApi implementation ──────────────────────────────────────────────────

  getSelectedRows(): TData[] {
    return this.selectionModel.getSelectedRows(this.dataModel.getRowNodes());
  }

  setRowData(data: TData[]): void {
    this.dataModel.setData(data);
    this._recompute();
    this._notify();
  }

  setColumnDefs(defs: ColumnDef<TData>[]): void {
    this.columnModel.setColumns(defs);
    this._recompute();
    this._notify();
  }

  exportToCsv(params: { fileName?: string; includeHeaders?: boolean } = {}): string {
    const { includeHeaders = true } = params;
    const columns = this.columnModel.getVisibleColumns();
    const rows = this.dataModel.getRowNodes();
    return this.exportEngine.toCsv({ columns, rows, includeHeaders });
  }

  sizeColumnsToFit(viewportWidth: number): void {
    const columns = this.columnModel.getVisibleColumns();
    if (columns.length === 0) return;
    const widthEach = Math.floor(viewportWidth / columns.length);
    for (const col of columns) {
      this.columnModel.resizeColumn(col.field, widthEach);
    }
    this._notify();
  }

  setFilterModel(model: FilterModelType<TData>): void {
    this.filterModel.clearFilters();
    for (const [colId, condition] of Object.entries(model)) {
      this.filterModel.setFilter(colId, condition);
    }
    this._recompute();
    this._notify();
    if (this.options.onFilterChanged) {
      this.options.onFilterChanged(model);
    }
  }

  getFilterModel(): FilterModelType<TData> {
    return this.filterModel.getFilters();
  }

  setSortModel(model: SortModelType[]): void {
    this.sortModel.clearSorts();
    model.forEach((entry) => {
      this.sortModel.addSort(entry.colId, entry.sort);
    });
    this._recompute();
    this._notify();
    if (this.options.onSortChanged) {
      this.options.onSortChanged(model);
    }
  }

  getSortModel(): SortModelType[] {
    return this.sortModel.getSorts().map((s) => ({ colId: s.colId, sort: s.sort }));
  }

  showColumn(colId: string): void {
    this.columnModel.showColumn(colId);
    this._notify();
  }

  hideColumn(colId: string): void {
    this.columnModel.hideColumn(colId);
    this._notify();
  }

  getColumnState(): ColumnState[] {
    return this.columnModel.getColumnState();
  }

  setColumnState(states: ColumnState[]): void {
    this.columnModel.setColumnState(states);
    this._notify();
  }

  // ── Additional helpers exposed for React ────────────────────────────────────

  selectRow(id: string, multi = false): void {
    this.selectionModel.selectRow(id, multi);
    this._notify();
    if (this.options.onSelectionChanged) {
      this.options.onSelectionChanged({ selectedRows: this.getSelectedRows() });
    }
  }

  toggleRow(id: string, multi = false): void {
    this.selectionModel.toggleRow(id, multi);
    this._notify();
    if (this.options.onSelectionChanged) {
      this.options.onSelectionChanged({ selectedRows: this.getSelectedRows() });
    }
  }

  /** Ids of all currently visible (post-filter) non-group rows. */
  private _visibleSelectableIds(): string[] {
    return this.dataModel
      .getRowNodes()
      .filter((node) => !node.isGroup)
      .map((node) => node.id);
  }

  private _emitSelectionChanged(): void {
    if (this.options.onSelectionChanged) {
      this.options.onSelectionChanged({ selectedRows: this.getSelectedRows() });
    }
  }

  /** Select a contiguous range from the last-selected anchor to the target row. */
  selectRange(targetId: string): void {
    const ids = this._visibleSelectableIds();
    const anchor = this.selectionModel.getLastSelectedId();
    if (anchor == null) {
      this.selectionModel.selectRow(targetId, false);
    } else {
      this.selectionModel.selectRange(ids, anchor, targetId);
    }
    this._notify();
    this._emitSelectionChanged();
  }

  selectAll(): void {
    this.selectionModel.selectAll(this._visibleSelectableIds());
    this._notify();
    this._emitSelectionChanged();
  }

  deselectAll(): void {
    this.selectionModel.deselectAll();
    this._notify();
    this._emitSelectionChanged();
  }

  /** Toggle select-all over the currently visible rows (for header checkbox). */
  toggleSelectAll(): void {
    this.selectionModel.toggleAll(this._visibleSelectableIds());
    this._notify();
    this._emitSelectionChanged();
  }

  isAllSelected(): boolean {
    return this.selectionModel.isAllSelected(this._visibleSelectableIds());
  }

  isSelectionIndeterminate(): boolean {
    return this.selectionModel.isIndeterminate(this._visibleSelectableIds());
  }

  getSelectedCount(): number {
    return this.selectionModel.getSelectedCount();
  }

  setQuickFilter(text: string): void {
    this.filterModel.setQuickFilter(text);
    this._recompute();
    this._notify();
    if (this.options.onFilterChanged) {
      this.options.onFilterChanged(this.getFilterModel());
    }
  }

  getQuickFilter(): string {
    return this.filterModel.getQuickFilter();
  }

  toggleGroupExpand(groupId: string): void {
    this.setGroupExpanded(groupId, this.collapsedGroupIds.has(groupId));
  }

  setGroupExpanded(groupId: string, expanded: boolean): void {
    if (expanded) {
      this.collapsedGroupIds.delete(groupId);
    } else {
      this.collapsedGroupIds.add(groupId);
    }
    this._reflattenGroups();
    this._notify();
    this.options.onGroupExpandedChanged?.(groupId, expanded);
  }

  expandAll(): void {
    this.collapsedGroupIds.clear();
    this._reflattenGroups();
    this._notify();
  }

  collapseAll(): void {
    this.collapsedGroupIds = new Set(this._allGroupIds());
    this._reflattenGroups();
    this._notify();
  }

  setGroupColumns(fields: string[]): void {
    this.groupFields = [...fields];
    // Group ids depend on the grouping fields, so prior collapse state is stale.
    this.collapsedGroupIds.clear();
    this._recompute();
    this._notify();
  }

  getGroupColumns(): string[] {
    return [...this.groupFields];
  }

  resizeColumn(colId: string, width: number): void {
    this.columnModel.resizeColumn(colId, width);
    this._notify();
    if (this.options.onColumnResized) {
      this.options.onColumnResized(colId, width);
    }
  }

  moveColumn(colId: string, toIndex: number): void {
    this.columnModel.moveColumn(colId, toIndex);
    this._notify();
    if (this.options.onColumnMoved) {
      this.options.onColumnMoved(colId, toIndex);
    }
  }

  autoSizeColumn(colId: string, measuredWidth: number): void {
    this.columnModel.autoSizeColumn(colId, measuredWidth);
    this._notify();
  }

  applyFlexWidths(viewportWidth: number): void {
    this.columnModel.applyFlexWidths(viewportWidth);
    this._notify();
  }

  getRowHeight(rowIndex: number): number {
    if (this.options.getRowHeight) {
      const nodes = this.dataModel.getRowNodes();
      const node = nodes[rowIndex];
      if (node) {
        return this.options.getRowHeight({ data: node.data, rowIndex });
      }
    }
    return this.options.rowHeight ?? 40;
  }
}
