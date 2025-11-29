function bishopPaths(x, y) {
  const directions = [[1,1], [1,-1], [-1,1], [-1,-1]];
  return linearPaths(x, y, directions);
}
