function knightPaths(x, y) {
  const moves = [
    [1, 2], [2, 1], [-1, 2], [-2, 1],
    [1, -2], [2, -1], [-1, -2], [-2, -1]
  ];

  const onBoard = ([a, b]) => a >= 1 && a <= 8 && b >= 1 && b <= 8;
  const isObstacle = ([a, b]) => obstacles.includes(`${a},${b}`);
  const getScore = ([a, b]) => targets.get(`${a},${b}`) || 0;

  const paths = [];

  for (let [dx, dy] of moves) {
    const nx = x + dx;
    const ny = y + dy;
    if (onBoard([nx, ny]) && !isObstacle([nx, ny])) {
      const path = [[x, y], [nx, ny]];
      const score = getScore([nx, ny]);
      paths.push({ path, score });
    }
  }

  paths.sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  return paths;
}
