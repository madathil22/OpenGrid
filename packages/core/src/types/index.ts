// ─── Column Definitions ──────────────────────────────────────────────────────

export type AggFunction = 'sum' | 'count' | 'min' | 'max' | 'avg';

/** Custom aggregation: receives the leaf values + nodes under a group. */
export type AggFuncCustom<TData = RowData> = (params: {
  values: unknown[];
  nodes: RowNode<TData>[];
  field: string;
}) => unknown;

export type ColumnAggFunc<TData = RowData> = AggFunction | AggFuncCustom<TData>;

export interface ColumnDef<TData = Record<string, unknown>> {
  /** Unique field key on TData */
  field: string;
  /** Display name in the header */
  headerName?: string;
  /** Fixed width in pixels */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  pinned?: 'left' | 'right';
  hide?: boolean;
  /** Custom cell renderer — receives the cell value + row data */
  cellRenderer?: (params: CellRendererParams<TData>) => string | HTMLElement;
  /** Override default field access */
  valueGetter?: (params: ValueGetterParams<TData>) => unknown;
  /** Format the displayed value */
  valueFormatter?: (params: ValueFormatterParams<TData>) => string;
  /** Aggregation function name, or a custom aggregation function. */
  aggFunc?: ColumnAggFunc<TData>;
  groupable?: boolean;
  /** Auto-compute width from content */
  autoSize?: boolean;
  /** Flex grow factor (like CSS flex) */
  flex?: number;
  /**
   * Custom sort comparator. Receives the resolved cell values (after
   * valueGetter) and the underlying row nodes. Return <0, 0, or >0 like
   * Array.prototype.sort. Direction (asc/desc) is applied by the engine on top
   * of the result, so always compare in ascending order here.
   */
  comparator?: (a: unknown, b: unknown, rowA: RowNode<TData>, rowB: RowNode<TData>) => number;
  /** Default filter type used by the inline filter row. Defaults to 'text'. */
  filterType?: 'text' | 'number' | 'date' | 'set';
  /** Render a selection checkbox in this column's cells. */
  checkboxSelection?: boolean;
}

export interface CellRendererParams<TData = Record<string, unknown>> {
  value: unknown;
  data: TData;
  colDef: ColumnDef<TData>;
  rowIndex: number;
}

export interface ValueGetterParams<TData = Record<string, unknown>> {
  data: TData;
  colDef: ColumnDef<TData>;
}

export interface ValueFormatterParams<TData = Record<string, unknown>> {
  value: unknown;
  data: TData;
  colDef: ColumnDef<TData>;
}

// ─── Row / Node ──────────────────────────────────────────────────────────────

export type RowData = Record<string, unknown>;

export interface RowNode<TData = RowData> {
  id: string;
  data: TData;
  rowIndex: number;
  level: number;
  expanded: boolean;
  children?: RowNode<TData>[];
  isGroup: boolean;
  groupKey?: string;
  /** The raw group value (before the "field: value" label is built). */
  groupValue?: unknown;
  /** Field this group node groups by. */
  groupField?: string;
  /** Number of leaf rows under this group. */
  childCount?: number;
  aggData?: Record<string, unknown>;
  /** True for a group footer row (summary at the bottom of a group). */
  isFooter?: boolean;
  /** True for the grand-total footer at the very bottom. */
  isGrandTotal?: boolean;
  /** For footer rows, the id of the group they summarize. */
  footerForGroupId?: string;
}

// ─── Sort / Filter ───────────────────────────────────────────────────────────

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export type FilterOperator =
  // text
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEqual'
  | 'startsWith'
  | 'endsWith'
  | 'blank'
  | 'notBlank'
  // number
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'inRange'
  // date
  | 'before'
  | 'after'
  // set
  | 'inSet';

export interface CustomFilterParams<TData = RowData> {
  value: unknown;
  data: TData;
  condition: FilterCondition<TData>;
}

export interface FilterCondition<TData = RowData> {
  type: 'text' | 'number' | 'date' | 'set' | 'custom';
  /** Required for all built-in filter types; ignored for type 'custom'. */
  operator?: FilterOperator;
  value?: unknown;
  valueTo?: unknown; // used for between/inRange
  /** Predicate for type 'custom'. Return true to keep the row. */
  predicate?: (params: CustomFilterParams<TData>) => boolean;
}

export type FilterModel<TData = RowData> = Record<string, FilterCondition<TData>>;

// ─── Column State ────────────────────────────────────────────────────────────

export interface ColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number | null;
}

// ─── Grid API ────────────────────────────────────────────────────────────────

export interface GridApi<TData = RowData> {
  getSelectedRows(): TData[];
  setRowData(data: TData[]): void;
  setColumnDefs(defs: ColumnDef<TData>[]): void;
  exportToCsv(params?: { fileName?: string; includeHeaders?: boolean }): string;
  sizeColumnsToFit(viewportWidth: number): void;
  setFilterModel(model: FilterModel<TData>): void;
  getFilterModel(): FilterModel<TData>;
  setSortModel(model: SortModel[]): void;
  getSortModel(): SortModel[];
  showColumn(colId: string): void;
  hideColumn(colId: string): void;
  getColumnState(): ColumnState[];
  setColumnState(states: ColumnState[]): void;
  autoSizeColumn(colId: string, measuredWidth: number): void;
  applyFlexWidths(viewportWidth: number): void;
  resizeColumn(colId: string, width: number): void;
  moveColumn(colId: string, toIndex: number): void;
  /** Set a global quick-filter string matched across all columns. Empty clears it. */
  setQuickFilter(text: string): void;
  getQuickFilter(): string;
  /** Select every currently visible (post-filter) non-group row. */
  selectAll(): void;
  /** Clear the entire selection. */
  deselectAll(): void;
  getSelectedCount(): number;
  /** Set the fields to group rows by (in order). Pass [] to clear grouping. */
  setGroupColumns(fields: string[]): void;
  getGroupColumns(): string[];
  /** Expand or collapse a single group by id. */
  setGroupExpanded(groupId: string, expanded: boolean): void;
  expandAll(): void;
  collapseAll(): void;
}

// ─── Grid Options ────────────────────────────────────────────────────────────

export interface GridOptions<TData = RowData> {
  rowData?: TData[];
  columnDefs?: ColumnDef<TData>[];
  rowHeight?: number;
  headerHeight?: number;
  pagination?: boolean;
  pageSize?: number;
  grouping?: boolean;
  groupFields?: string[];
  /** Render a summary footer row at the bottom of each group. */
  groupIncludeFooter?: boolean;
  /** Render a grand-total footer row at the very bottom. */
  groupIncludeTotalFooter?: boolean;
  /** Whether groups start expanded (default true). */
  groupDefaultExpanded?: boolean;
  onGroupExpandedChanged?: (groupId: string, expanded: boolean) => void;
  selection?: 'single' | 'multiple' | 'range' | false;
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;
  onSortChanged?: (model: SortModel[]) => void;
  onFilterChanged?: (model: FilterModel<TData>) => void;
  onColumnResized?: (colId: string, width: number) => void;
  onColumnMoved?: (colId: string, toIndex: number) => void;
  onGridReady?: (event: GridReadyEvent<TData>) => void;
  /** Return variable row height for a given row */
  getRowHeight?: (params: { data: TData; rowIndex: number }) => number;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export interface GridReadyEvent<TData = RowData> {
  api: GridApi<TData>;
}

export interface SelectionChangedEvent<TData = RowData> {
  selectedRows: TData[];
}
