// ─── Column Definitions ──────────────────────────────────────────────────────

export type AggFunction = 'sum' | 'count' | 'min' | 'max' | 'avg';

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
  /** Aggregation function name */
  aggFunc?: AggFunction;
  groupable?: boolean;
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
  aggData?: Record<string, unknown>;
}

// ─── Sort / Filter ───────────────────────────────────────────────────────────

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export interface FilterCondition {
  type: 'text' | 'number' | 'date' | 'set';
  operator:
    | 'contains'
    | 'equals'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan'
    | 'between'
    | 'inRange'
    | 'before'
    | 'after'
    | 'inSet';
  value: unknown;
  valueTo?: unknown; // used for between/inRange
}

export type FilterModel = Record<string, FilterCondition>;

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
  setFilterModel(model: FilterModel): void;
  getFilterModel(): FilterModel;
  setSortModel(model: SortModel[]): void;
  getSortModel(): SortModel[];
  showColumn(colId: string): void;
  hideColumn(colId: string): void;
  getColumnState(): ColumnState[];
  setColumnState(states: ColumnState[]): void;
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
  selection?: 'single' | 'multiple' | 'range' | false;
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;
  onSortChanged?: (model: SortModel[]) => void;
  onFilterChanged?: (model: FilterModel) => void;
  onColumnResized?: (colId: string, width: number) => void;
  onColumnMoved?: (colId: string, toIndex: number) => void;
  onGridReady?: (event: GridReadyEvent<TData>) => void;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export interface GridReadyEvent<TData = RowData> {
  api: GridApi<TData>;
}

export interface SelectionChangedEvent<TData = RowData> {
  selectedRows: TData[];
}
