function rookPaths(x, y) {
  const directions = [[1,0], [-1,0], [0,1], [0,-1]];
  return linearPaths(x, y, directions);
}
