export interface SeriesStats {
  current: number | undefined;
  min: number | undefined;
  max: number | undefined;
  avg: number | undefined;
}

export function computeStats(values: (number | undefined)[]): SeriesStats {
  const nums = values.filter((v): v is number => v !== undefined && !Number.isNaN(v));
  if (nums.length === 0) {
    return { current: undefined, min: undefined, max: undefined, avg: undefined };
  }
  const sum = nums.reduce((a, b) => a + b, 0);
  return {
    current: nums[nums.length - 1],
    min: Math.min(...nums),
    max: Math.max(...nums),
    avg: sum / nums.length,
  };
}

export function fmtStat(n: number | undefined, digits = 1): string {
  return n === undefined ? "—" : n.toFixed(digits);
}
