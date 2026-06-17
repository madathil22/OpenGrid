export type AggFunctionName = 'sum' | 'count' | 'min' | 'max' | 'avg';

export const aggregations: Record<AggFunctionName, (values: unknown[]) => unknown> = {
  sum: (values: unknown[]) => {
    const nums = values.filter((v) => typeof v === 'number') as number[];
    return nums.reduce((a, b) => a + b, 0);
  },
  count: (values: unknown[]) => values.length,
  min: (values: unknown[]) => {
    const nums = values.filter((v) => typeof v === 'number') as number[];
    return nums.length > 0 ? Math.min(...nums) : null;
  },
  max: (values: unknown[]) => {
    const nums = values.filter((v) => typeof v === 'number') as number[];
    return nums.length > 0 ? Math.max(...nums) : null;
  },
  avg: (values: unknown[]) => {
    const nums = values.filter((v) => typeof v === 'number') as number[];
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  },
};

export function aggregate(
  funcName: AggFunctionName,
  values: unknown[],
): unknown {
  const fn = aggregations[funcName];
  return fn(values);
}

/**
 * Apply either a named aggregation or a custom aggregation function.
 * Custom functions receive the leaf values, the leaf nodes, and the field id.
 */
export function aggregateWith<TNode>(
  func: AggFunctionName | ((params: { values: unknown[]; nodes: TNode[]; field: string }) => unknown),
  values: unknown[],
  nodes: TNode[],
  field: string,
): unknown {
  if (typeof func === 'function') {
    return func({ values, nodes, field });
  }
  return aggregate(func, values);
}
