function queenPaths(x, y) {
  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];
  return linearPaths(x, y, directions);
}
