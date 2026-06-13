import type { RowNode, RowData } from '../types/index.js';

function generateId(index: number): string {
  return `row-${index}`;
}

export class DataModel<TData = RowData> {
  private rawData: TData[] = [];
  /** Canonical, unfiltered/unsorted node list built from the source data. */
  private allNodes: RowNode<TData>[] = [];
  /** The currently displayed (filtered/sorted/grouped) view. */
  private rowNodes: RowNode<TData>[] = [];

  setData(data: TData[]): void {
    this.rawData = [...data];
    this.allNodes = data.map((item, index) => ({
      id: generateId(index),
      data: item,
      rowIndex: index,
      level: 0,
      expanded: false,
      isGroup: false,
    }));
    // Reset the view to the full set until a recompute narrows it.
    this.rowNodes = this.allNodes;
  }

  getData(): TData[] {
    return this.rawData;
  }

  /** The canonical, unfiltered node list — the source for every recompute. */
  getAllRowNodes(): RowNode<TData>[] {
    return this.allNodes;
  }

  /** The currently displayed view (post filter/sort/group). */
  getRowNodes(): RowNode<TData>[] {
    return this.rowNodes;
  }

  setRowNodes(nodes: RowNode<TData>[]): void {
    this.rowNodes = nodes.map((n, i) => ({ ...n, rowIndex: i }));
  }

  getRowCount(): number {
    return this.rowNodes.length;
  }

  getRowNode(index: number): RowNode<TData> | undefined {
    return this.rowNodes[index];
  }

  updateRow(index: number, data: Partial<TData>): void {
    const node = this.rowNodes[index];
    if (!node) return;
    const updated: TData = { ...node.data, ...data };
    this.rowNodes[index] = { ...node, data: updated };
    if (!node.isGroup) {
      // Keep raw data and the canonical node list in sync (match by reference).
      const rawIndex = this.rawData.indexOf(node.data);
      if (rawIndex !== -1) {
        this.rawData[rawIndex] = updated;
      }
      const canonical = this.allNodes.find((n) => n.data === node.data);
      if (canonical) {
        canonical.data = updated;
      }
    }
  }
}
