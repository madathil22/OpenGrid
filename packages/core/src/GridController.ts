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

  constructor(options: GridOptions<TData> = {}) {
    this.options = options;
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
    let nodes = this.dataModel.getRowNodes();
    const columns = this.columnModel.getColumns();

    // Apply filters
    nodes = this.filterModel.applyFilters(nodes, columns);

    // Apply sorting
    nodes = this.sortModel.applySorting(nodes, columns);

    // Apply grouping
    if (this.options.grouping && this.options.groupFields && this.options.groupFields.length > 0) {
      const aggFunctions = this.groupingEngine.buildAggFunctionsFromColumns(columns);
      const grouped = this.groupingEngine.groupData(nodes, this.options.groupFields, aggFunctions);
      nodes = this.groupingEngine.flattenGroups(grouped);
    }

    this.dataModel.setRowNodes(nodes);
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

  setFilterModel(model: FilterModelType): void {
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

  getFilterModel(): FilterModelType {
    return this.filterModel.getFilters();
  }

  setSortModel(model: SortModelType[]): void {
    this.sortModel.clearSorts();
    model.forEach((entry, i) => {
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

  toggleGroupExpand(groupId: string): void {
    const updated = this.groupingEngine.toggleGroup(groupId, this.dataModel.getRowNodes());
    this.dataModel.setRowNodes(updated);
    this._notify();
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
