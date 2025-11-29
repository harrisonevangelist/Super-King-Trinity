function pawnPaths(x, y, isWhite = true) {
  const direction = isWhite ? 1 : -1;
  const startRank = isWhite ? 2 : 7;
  const promotionRank = isWhite ? 8 : 1;

  const fenInput = document.getElementById("fenInput");
  const enPassant = fenInput ? fenInput.value.split(" ")[3] : '-';

  const onBoard = ([a, b]) => a >= 1 && a <= 8 && b >= 1 && b <= 8;
  const isObstacle = ([a, b]) => obstacles.includes(`${a},${b}`);
  const getScore = ([a, b]) => targets.get(`${a},${b}`) || 0;

  const pieceValues = { Q: 9, R: 3.5, N: 3, B: 3.01, P: 1, S: 10000 };
  const paths = [];

  // Forward move (must be empty)
  const oneStep = [x, y + direction];
  if (onBoard(oneStep) && !isObstacle(oneStep) && !targets.has(`${oneStep[0]},${oneStep[1]}`)) {
    if (oneStep[1] === promotionRank) {
      for (let promo of ['Q', 'R', 'N', 'B', 'P']) {
        const score = pieceValues[promo];
        paths.push({ path: [[x, y], oneStep], promotion: promo, score });
      }
    } else {
      paths.push({ path: [[x, y], oneStep], score: 0 });
    }

    // Two-step move from starting rank
    const twoStep = [x, y + 2 * direction];
    if (y === startRank && onBoard(twoStep) && !isObstacle(twoStep) && !targets.has(`${twoStep[0]},${twoStep[1]}`)) {
      paths.push({ path: [[x, y], twoStep], score: 0 });
    }
  }

  // Captures
  for (let dx of [-1, 1]) {
    const diag = [x + dx, y + direction];
    if (onBoard(diag)) {
      const targetScore = getScore(diag);
      if (targetScore > 0) {
        if (diag[1] === promotionRank) {
          for (let promo of ['Q', 'R', 'N', 'B', 'P']) {
            const score = pieceValues[promo] + targetScore;
            paths.push({ path: [[x, y], diag], promotion: promo, score });
          }
        } else {
          paths.push({ path: [[x, y], diag], score: targetScore });
        }
      }
    }
  }

  // En passant
  if (/^[a-h][36]$/.test(enPassant)) {
    const epFile = enPassant.charCodeAt(0) - 96;
    const epRank = parseInt(enPassant[1]);
    if (Math.abs(epFile - x) === 1 && epRank === y + direction) {
      paths.push({ path: [[x, y], [epFile, epRank]], type: 'enPassant', score: 1 });
    }
  }

  paths.sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  return paths;
}


