
/**
 * Performs a two-ply (two-move lookahead) search based on existing path data 
 * in the 'output' field to determine the best move.
 */
async function bestMoveTwoPlies() {
  loadFEN();
  await new Promise(r => setTimeout(r, 100));

  const output = document.getElementById("output").value;
  const pathLines = output.trim().split('\n')
    .filter(l => l.includes('→') && l.includes('Score:'));

  if (pathLines.length === 0) {
    document.getElementById("bestMoveDisplay").innerText = "No moves found.";
    return;
  }

  const originalFen = document.getElementById("fenInput").value.trim();
  let bestNetScore = -Infinity;
  let bestMoves = [];

  for (let line of pathLines) {
    const moveText = line.split(' | ')[0];
    const myScore = parseFloat(line.match(/Score:\s*([\d.]+)/)[1]);

    // Simulate my move
    document.getElementById("bestMoveDisplay").innerText = moveText;
    applyBestMove();
    await new Promise(r => setTimeout(r, 50));

    const afterMyMoveFen = document.getElementById("finalFENOutput").value.split(' ')[0];
    const opponentTurn = currentTurn === 'w' ? 'b' : 'w';
    document.getElementById("fenInput").value = afterMyMoveFen + " " + opponentTurn;

    loadFEN();
    await new Promise(r => setTimeout(r, 100));

    const oppOutput = document.getElementById("output").value;
    const oppLines = oppOutput.trim().split('\n')
      .filter(l => l.includes('→') && l.includes('Score:'));
    const oppBestScore = oppLines.length > 0
      ? Math.max(...oppLines.map(l => parseFloat(l.match(/Score:\s*([\d.]+)/)[1]) || 0))
      : 0;

    // Restore board
    document.getElementById("fenInput").value = originalFen;
    loadFEN();

    const SKT_LOSS = 10000;
    const penalty = oppBestScore >= SKT_LOSS - 1 ? -1e9 : 0;
    const netScore = myScore - oppBestScore + penalty;

    if (netScore > bestNetScore) {
      bestNetScore = netScore;
      bestMoves = [moveText];
    } else if (Math.abs(netScore - bestNetScore) < 0.01) {
      bestMoves.push(moveText);
    }
  }

  const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  document.getElementById("bestMoveDisplay").innerText = chosenMove;
}
