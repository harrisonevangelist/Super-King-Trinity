function evaluateFen(fen) {
  const pieceValues = { p: 1, n: 3, b: 3.01, r: 3.5, q: 9, s: 10000 };
  let white = 0, black = 0;
  const ranks = fen.split(" ")[0].split("/");

  for (const rank of ranks) {
    for (const char of rank) {
      if (isNaN(char)) {
        const lower = char.toLowerCase();
        const value = pieceValues[lower] || 0;
        if (char === char.toUpperCase()) white += value;
        else black += value;
      }
    }
  }

  return { white, black, net: white - black };
}

// Example usage:
const fen = process.argv[2];
console.log(evaluateFen(fen));
