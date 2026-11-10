export interface Point {
  x: number;
  y: number;
}

/** Map an array of numbers to points inside a [0,width] x [0,height] box, with vertical padding so peaks are not clipped. */
export function toPoints(values: number[], width: number, height: number, pad = 4): Point[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const usable = height - pad * 2;
  return values.map((v, i) => ({
    x: i * stepX,
    y: pad + usable - ((v - min) / span) * usable,
  }));
}

/** A smooth cubic-bezier path through the points (Catmull-Rom -> bezier). */
export function smoothPath(points: Point[], tension = 0.5): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** A straight polyline path. */
export function linePath(points: Point[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
}

/** Close a line path into a filled area down to the baseline. */
export function areaPath(line: string, points: Point[], height: number): string {
  if (points.length === 0) return "";
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x},${height} L ${first.x},${height} Z`;
}
