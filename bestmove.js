function bestMove() {
  const output = document.getElementById("output").value;
  const lines = output.split("\n");
  const moveLines = lines.filter(line => line.includes("→") && line.includes("Score:"));

  if (moveLines.length === 0) {
    document.getElementById("bestMoveDisplay").textContent = "No valid scored paths found.";
    return;
  }

  // Find the highest score and return the full line
  let topScore = -Infinity;
  let bestLine = "";

  moveLines.forEach(line => {
    const scoreMatch = line.match(/Score:\s*(\d+)/);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      if (score > topScore) {
        topScore = score;
        bestLine = line;
      }
    }
  });

  document.getElementById("bestMoveDisplay").textContent = `Best Move: ${bestLine}`;
}


