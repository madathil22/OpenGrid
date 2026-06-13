import type { RowNode, ColumnDef, RowData, AggFunction } from '../types/index.js';
import { aggregate } from './AggregationEngine.js';

function getFieldValue(data: unknown, field: string): unknown {
  if (data != null && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return undefined;
}

function buildGroupNodes<TData>(
  rows: RowNode<TData>[],
  groupFields: string[],
  aggFunctions: Partial<Record<string, AggFunction>>,
  level: number,
  parentId: string,
): RowNode<TData>[] {
  if (groupFields.length === 0) return rows;

  const field = groupFields[0]!;
  const remainingFields = groupFields.slice(1);

  // Group rows by field value
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

    // Compute aggregations
    const aggData: Record<string, unknown> = {};
    for (const [colId, funcName] of Object.entries(aggFunctions)) {
      if (!funcName) continue;
      const values = groupRows.map((r) => getFieldValue(r.data, colId));
      aggData[colId] = aggregate(funcName, values);
    }

    const children =
      remainingFields.length > 0
        ? buildGroupNodes(groupRows, remainingFields, aggFunctions, level + 1, groupId)
        : groupRows.map((r) => ({ ...r, level: level + 1 }));

    const groupNode: RowNode<TData> = {
      id: groupId,
      data: {} as TData,
      rowIndex: 0, // will be recalculated
      level,
      expanded: true,
      isGroup: true,
      groupKey: `${field}: ${key}`,
      aggData,
      children,
    };

    result.push(groupNode);
  }

  return result;
}

export class GroupingEngine<TData = RowData> {
  groupData(
    rows: RowNode<TData>[],
    groupFields: string[],
    aggFunctions: Partial<Record<string, AggFunction>>,
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

  flattenGroups(nodes: RowNode<TData>[]): RowNode<TData>[] {
    const result: RowNode<TData>[] = [];
    let index = 0;

    const flatten = (nodeList: RowNode<TData>[]): void => {
      for (const node of nodeList) {
        result.push({ ...node, rowIndex: index++ });
        if (node.isGroup && node.expanded && node.children) {
          flatten(node.children);
        }
      }
    };

    flatten(nodes);
    return result;
  }

  buildAggFunctionsFromColumns<T>(columns: ColumnDef<T>[]): Partial<Record<string, AggFunction>> {
    const agg: Partial<Record<string, AggFunction>> = {};
    for (const col of columns) {
      if (col.aggFunc) {
        agg[col.field] = col.aggFunc;
      }
    }
    return agg;
  }
}
