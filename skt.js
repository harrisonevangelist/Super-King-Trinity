/* -------------------------------------------------------------
   skt.js  –  SKT path generator with the exact deduplication
   you asked for (clockwise loops kept, anticlockwise dropped,
   abab → ab, etc.)
   ------------------------------------------------------------- */
function SktScoreObstacles(x, y) {
  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  const onBoard = ([a, b]) => a >= 1 && a <= 8 && b >= 1 && b <= 8;
  const isFriendly = ([a, b]) => obstacles.includes(`${a},${b}`);
  const getScore   = ([a, b]) => targets.get(`${a},${b}`) || 0;

  const startKey = `${x},${y}`;
  const allPaths = [];

  // ---------- 1. Generate every legal 1-3-move path ----------
  for (const d1 of dirs) {
    const p1 = [x + d1[0], y + d1[1]];
    if (!onBoard(p1) || isFriendly(p1)) continue;

    allPaths.push({ path: [[x, y], p1], score: calcScore([[x, y], p1]) });

    for (const d2 of dirs) {
      const p2 = [p1[0] + d2[0], p1[1] + d2[1]];
      if (!onBoard(p2) || isFriendly(p2)) continue;

      allPaths.push({ path: [[x, y], p1, p2], score: calcScore([[x, y], p1, p2]) });

      for (const d3 of dirs) {
        const p3 = [p2[0] + d3[0], p2[1] + d3[1]];
        if (!onBoard(p3) || isFriendly(p3)) continue;

        allPaths.push({ path: [[x, y], p1, p2, p3], score: calcScore([[x, y], p1, p2, p3]) });
      }
    }
  }

  // ---------- 2. Helper: score (unique captures) ----------
  function calcScore(path) {
    const seen = new Set();
    let s = 0;
    for (const pos of path) {
      const k = `${pos[0]},${pos[1]}`;
      if (!seen.has(k)) { seen.add(k); s += getScore(pos); }
    }
    return s;
  }

  // ---------- 3. Helper: clockwise test ----------
  // For a 4-step loop a→b→c→a we look at the three vectors.
  // If the cross-product chain is positive → clockwise.
  function isClockwiseLoop(path) {
    if (path.length !== 4) return false;
    const [a, b, c, d] = path;
    if (`${d[0]},${d[1]}` !== startKey) return false; // must end at start

    const v1 = [b[0] - a[0], b[1] - a[1]];
    const v2 = [c[0] - b[0], c[1] - b[1]];
    const v3 = [d[0] - c[0], d[1] - c[1]];

    // cross products v1×v2 and v2×v3
    const cross1 = v1[0] * v2[1] - v1[1] * v2[0];
    const cross2 = v2[0] * v3[1] - v2[1] * v3[0];
    return cross1 > 0 && cross2 > 0;
  }

  // ---------- 4. Deduplication ----------
  const keep = new Map(); // key → best path object

  for (const item of allPaths) {
    const path = item.path;
    const endKey = `${path[path.length - 1][0]},${path[path.length - 1][1]}`;

    // 4-a)  abab  → keep only ab
    if (path.length === 4 && endKey === `${path[1][0]},${path[1][1]}`) {
      // this is a→b→a→b  → ignore, the 2-step a→b will be kept later
      continue;
    }

    // 4-b)  Clockwise 4-step loop (abca) – keep it
    if (path.length === 4 && endKey === startKey && isClockwiseLoop(path)) {
      const sig = `loop_cw_${path.map(p => `${p[0]},${p[1]}`).join('|')}`;
      keep.set(sig, item);
      continue;
    }

    // 4-c)  Anything that returns to start **without** being a clockwise loop → drop
    if (endKey === startKey) continue;

    // 4-d)  Normal paths – group by *captured squares* (ignore order)
    const captured = new Set();
    for (let i = 1; i < path.length; i++) captured.add(`${path[i][0]},${path[i][1]}`);
    const captureKey = Array.from(captured).sort().join('|');

    const existing = keyExists(captureKey);
    if (!existing) {
      keep.set(captureKey, item);
      continue;
    }

    // same captures → keep the **shortest** (or highest score if lengths equal)
    if (item.score > existing.score ||
        (item.score === existing.score && path.length < existing.path.length)) {
      keep.set(captureKey, item);
    }
  }

  // Helper for the map lookup
  function keyExists(k) {
    return keep.has(k) ? keep.get(k) : null;
  }

  // ---------- 5. Final sort ----------
  const result = Array.from(keep.values());
  result.sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  return result;
}

