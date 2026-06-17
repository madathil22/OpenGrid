import { describe, it, expect } from 'vitest';
import { GroupingEngine } from '../engines/GroupingEngine.js';
import type { RowNode } from '../types/index.js';

type Row = { dept: string; role: string; salary: number };

function makeNodes(rows: Row[]): RowNode<Row>[] {
  return rows.map((data, i) => ({
    id: `row-${i}`,
    data,
    rowIndex: i,
    level: 0,
    expanded: false,
    isGroup: false,
  }));
}

const data: Row[] = [
  { dept: 'Engineering', role: 'Backend', salary: 100000 },
  { dept: 'Engineering', role: 'Frontend', salary: 90000 },
  { dept: 'Marketing', role: 'SEO', salary: 70000 },
  { dept: 'Marketing', role: 'Content', salary: 65000 },
];

describe('GroupingEngine', () => {
  const engine = new GroupingEngine<Row>();

  it('groups by single field', () => {
    const nodes = makeNodes(data);
    const grouped = engine.groupData(nodes, ['dept'], {});
    expect(grouped).toHaveLength(2);
    expect(grouped[0]?.isGroup).toBe(true);
    expect(grouped[0]?.groupKey).toContain('Engineering');
  });

  it('each group has correct children', () => {
    const nodes = makeNodes(data);
    const grouped = engine.groupData(nodes, ['dept'], {});
    const eng = grouped.find((g) => g.groupKey?.includes('Engineering'));
    expect(eng?.children).toHaveLength(2);
  });

  it('computes aggregations', () => {
    const nodes = makeNodes(data);
    const grouped = engine.groupData(nodes, ['dept'], { salary: 'sum' });
    const eng = grouped.find((g) => g.groupKey?.includes('Engineering'));
    expect(eng?.aggData?.['salary']).toBe(190000);
  });

  it('flattenGroups includes group nodes and children when expanded', () => {
    const nodes = makeNodes(data);
    const grouped = engine.groupData(nodes, ['dept'], {});
    const flat = engine.flattenGroups(grouped);
    // 2 groups + 4 leaf rows
    expect(flat.length).toBe(6);
  });

  it('flattenGroups excludes children when collapsed', () => {
    const nodes = makeNodes(data);
    const grouped = engine.groupData(nodes, ['dept'], {});
    // Collapse first group
    const collapsed = grouped.map((g, i) => (i === 0 ? { ...g, expanded: false } : g));
    const flat = engine.flattenGroups(collapsed);
    // 2 groups + 2 children from second group
    expect(flat.length).toBe(4);
  });

  it('toggleGroup flips expanded state', () => {
    const nodes = makeNodes(data);
    const grouped = engine.groupData(nodes, ['dept'], {});
    const groupId = grouped[0]!.id;
    const toggled = engine.toggleGroup(groupId, grouped);
    expect(toggled[0]?.expanded).toBe(false);
    const toggled2 = engine.toggleGroup(groupId, toggled);
    expect(toggled2[0]?.expanded).toBe(true);
  });

  it('records group metadata (field, value, childCount)', () => {
    const grouped = engine.groupData(makeNodes(data), ['dept'], {});
    const eng = grouped.find((g) => g.groupKey?.includes('Engineering'))!;
    expect(eng.groupField).toBe('dept');
    expect(eng.groupValue).toBe('Engineering');
    expect(eng.childCount).toBe(2);
  });

  it('collapsedIds option hides children and is authoritative', () => {
    const grouped = engine.groupData(makeNodes(data), ['dept'], {});
    const firstId = grouped[0]!.id;
    const flat = engine.flattenGroups(grouped, { collapsedIds: new Set([firstId]) });
    // first group collapsed (1) + second group (1) + its 2 children = 4
    expect(flat.length).toBe(4);
    expect(flat.find((n) => n.id === firstId)?.expanded).toBe(false);
  });

  it('includeFooter emits a footer per expanded group with aggData', () => {
    const grouped = engine.groupData(makeNodes(data), ['dept'], { salary: 'sum' });
    const flat = engine.flattenGroups(grouped, { includeFooter: true });
    // 2 groups + 4 leaves + 2 footers
    expect(flat.length).toBe(8);
    const footers = flat.filter((n) => n.isFooter);
    expect(footers).toHaveLength(2);
    const engFooter = footers.find((f) => f.footerForGroupId?.includes('Engineering'));
    expect(engFooter?.aggData?.['salary']).toBe(190000);
  });

  it('nested grouping rolls aggregations up correctly', () => {
    const grouped = engine.groupData(makeNodes(data), ['dept', 'role'], { salary: 'sum' });
    const eng = grouped.find((g) => g.groupKey?.includes('Engineering'))!;
    expect(eng.aggData?.['salary']).toBe(190000); // parent = sum across roles
    expect(eng.children?.[0]?.isGroup).toBe(true); // nested role groups
  });

  it('supports a custom aggregation function', () => {
    const grouped = engine.groupData(makeNodes(data), ['dept'], {
      salary: ({ values }) => (values as number[]).filter((v) => v > 80000).length,
    });
    const eng = grouped.find((g) => g.groupKey?.includes('Engineering'))!;
    expect(eng.aggData?.['salary']).toBe(2); // both Eng salaries > 80k
  });

  it('computeGrandTotal aggregates across every leaf', () => {
    const total = engine.computeGrandTotal(makeNodes(data), { salary: 'sum' });
    expect(total.isGrandTotal).toBe(true);
    expect(total.aggData?.['salary']).toBe(325000);
    expect(total.childCount).toBe(4);
  });
});
