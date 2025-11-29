/**
 * Automates the game cycle: load FEN, find best move, apply best move,
 * update FEN, and log the results for a specified number of cycles.
 * @param {number} cycles - The number of turns/moves to play automatically.
 */
async function autoPlayCycles(cycles = 50) {
  const moveLogs = document.getElementById("moveLogs");
  moveLogs.value = "";

  for (let i = 1; i <= cycles; i++) {
    loadFEN();
    await new Promise(resolve => setTimeout(resolve, 300));
    bestMove();
    await new Promise(resolve => setTimeout(resolve, 300));
    applyBestMove();
    await new Promise(resolve => setTimeout(resolve, 300));

    const move = document.getElementById("bestMoveDisplay").innerText.trim() ||
                 document.getElementById("captureMoveOutput").value.trim();
    const newFen = document.getElementById("finalFENOutput").value.trim();
    document.getElementById("fenInput").value = newFen;

    moveLogs.value += `${i}. Move: ${move}\n    FEN: ${newFen}\n\n`;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

