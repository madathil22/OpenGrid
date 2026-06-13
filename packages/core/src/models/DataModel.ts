import type { RowNode, RowData } from '../types/index.js';

function generateId(index: number): string {
  return `row-${index}`;
}

export class DataModel<TData = RowData> {
  private rawData: TData[] = [];
  private rowNodes: RowNode<TData>[] = [];

  setData(data: TData[]): void {
    this.rawData = [...data];
    this.rowNodes = data.map((item, index) => ({
      id: generateId(index),
      data: item,
      rowIndex: index,
      level: 0,
      expanded: false,
      isGroup: false,
    }));
  }

  getData(): TData[] {
    return this.rawData;
  }

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
      // Update raw data too (for non-group rows)
      const rawIndex = this.rawData.indexOf(node.data);
      if (rawIndex !== -1) {
        this.rawData[rawIndex] = updated;
      }
    }
  }
}
