import type { RowNode, ColumnDef, RowData, ColumnAggFunc } from '../types/index.js';
import { aggregateWith } from './AggregationEngine.js';

function getFieldValue(data: unknown, field: string): unknown {
  if (data != null && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return undefined;
}

type AggMap<TData> = Partial<Record<string, ColumnAggFunc<TData>>>;

/** Collect all leaf (non-group) rows under a node list. */
function collectLeaves<TData>(rows: RowNode<TData>[]): RowNode<TData>[] {
  const out: RowNode<TData>[] = [];
  for (const r of rows) {
    if (r.isGroup && r.children) out.push(...collectLeaves(r.children));
    else if (!r.isGroup) out.push(r);
  }
  return out;
}

function computeAggData<TData>(
  leaves: RowNode<TData>[],
  aggFunctions: AggMap<TData>,
): Record<string, unknown> {
  const aggData: Record<string, unknown> = {};
  for (const [colId, func] of Object.entries(aggFunctions)) {
    if (!func) continue;
    const values = leaves.map((r) => getFieldValue(r.data, colId));
    aggData[colId] = aggregateWith(func, values, leaves, colId);
  }
  return aggData;
}

function buildGroupNodes<TData>(
  rows: RowNode<TData>[],
  groupFields: string[],
  aggFunctions: AggMap<TData>,
  level: number,
  parentId: string,
): RowNode<TData>[] {
  if (groupFields.length === 0) return rows;

  const field = groupFields[0]!;
  const remainingFields = groupFields.slice(1);

  const groupMap = new Map<string, RowNode<TData>[]>();
  for (const row of rows) {
    const key = String(getFieldValue(row.data, field) ?? '(blank)');
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(row);
  }

  const result: RowNode<TData>[] = [];
  let groupIndex = 0;

  for (const [key, groupRows] of groupMap) {
    const groupId = `${parentId}-${field}-${key}-${groupIndex}`;
    groupIndex++;

    const leaves = collectLeaves(groupRows);
    const aggData = computeAggData(leaves, aggFunctions);

    const children =
      remainingFields.length > 0
        ? buildGroupNodes(groupRows, remainingFields, aggFunctions, level + 1, groupId)
        : groupRows.map((r) => ({ ...r, level: level + 1 }));

    result.push({
      id: groupId,
      data: {} as TData,
      rowIndex: 0,
      level,
      expanded: true,
      isGroup: true,
      groupKey: `${field}: ${key}`,
      groupField: field,
      groupValue: getFieldValue(groupRows[0]?.data, field),
      childCount: leaves.length,
      aggData,
      children,
    });
  }

  return result;
}

export interface FlattenOptions {
  /** Group ids that are collapsed; their children (and footer) are hidden. */
  collapsedIds?: Set<string>;
  /** Emit a footer summary row at the bottom of each expanded group. */
  includeFooter?: boolean;
}

export class GroupingEngine<TData = RowData> {
  groupData(
    rows: RowNode<TData>[],
    groupFields: string[],
    aggFunctions: AggMap<TData>,
  ): RowNode<TData>[] {
    if (groupFields.length === 0) return rows;
    return buildGroupNodes(rows, groupFields, aggFunctions, 0, 'root');
  }

  toggleGroup(groupId: string, nodes: RowNode<TData>[]): RowNode<TData>[] {
    return nodes.map((node) => {
      if (node.id === groupId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return { ...node, children: this.toggleGroup(groupId, node.children) };
      }
      return node;
    });
  }

  /** Flatten the group tree into a display list, honoring collapse + footers. */
  flattenGroups(nodes: RowNode<TData>[], options: FlattenOptions = {}): RowNode<TData>[] {
    const { collapsedIds, includeFooter } = options;
    const result: RowNode<TData>[] = [];
    let index = 0;

    const flatten = (nodeList: RowNode<TData>[]): void => {
      for (const node of nodeList) {
        if (!node.isGroup) {
          result.push({ ...node, rowIndex: index++ });
          continue;
        }
        // When a collapsed-id set is supplied it is authoritative; otherwise
        // fall back to the node's own expanded flag.
        const expanded = collapsedIds ? !collapsedIds.has(node.id) : node.expanded;
        result.push({ ...node, expanded, rowIndex: index++ });
        if (expanded && node.children) {
          flatten(node.children);
          if (includeFooter) {
            result.push({
              ...node,
              id: `${node.id}-footer`,
              children: undefined,
              expanded: false,
              isFooter: true,
              footerForGroupId: node.id,
              rowIndex: index++,
            });
          }
        }
      }
    };

    flatten(nodes);
    return result;
  }

  /** Build a grand-total footer summarizing every leaf row. */
  computeGrandTotal(leaves: RowNode<TData>[], aggFunctions: AggMap<TData>): RowNode<TData> {
    return {
      id: '__grand_total__',
      data: {} as TData,
      rowIndex: 0,
      level: 0,
      expanded: false,
      isGroup: true,
      isFooter: true,
      isGrandTotal: true,
      groupKey: 'Total',
      childCount: leaves.length,
      aggData: computeAggData(leaves, aggFunctions),
    };
  }

  buildAggFunctionsFromColumns(columns: ColumnDef<TData>[]): AggMap<TData> {
    const agg: AggMap<TData> = {};
    for (const col of columns) {
      if (col.aggFunc) {
        agg[col.field] = col.aggFunc;
      }
    }
    return agg;
  }
}
