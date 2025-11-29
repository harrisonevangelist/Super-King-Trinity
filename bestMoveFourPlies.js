async function bestMoveFourPlies() {
  const originalFen = document.getElementById("fenInput").value.trim();
  let bestNetScore = -Infinity;
  let bestMoves = [];

  // 1. Generate my candidate moves
  loadFEN();
  await wait(100);
  const myLines = getScoredLines(document.getElementById("output").value);

  for (const { moveText, score: myScore } of myLines) {
    // --- First ply: my move ---
    document.getElementById("bestMoveDisplay").innerText = moveText;
    applyBestMove();                  // APPLY
    await wait(50);
    transferFinalFEN();               // TRANSFER
    await wait(50);
    loadFEN();                        // LOAD
    await wait(100);

    const afterMyFen = document.getElementById("finalFENOutput").value.trim();

    // --- Second ply: opponent replies ---
    const oppLines = getScoredLines(document.getElementById("output").value);
    let worstReplyEval = Infinity;

    for (const { moveText: oppMoveText, score: oppScore } of oppLines) {
      document.getElementById("bestMoveDisplay").innerText = oppMoveText;
      applyBestMove();                // APPLY
      await wait(50);
      transferFinalFEN();             // TRANSFER
      await wait(50);
      loadFEN();                      // LOAD
      await wait(100);

      const afterOppFen = document.getElementById("finalFENOutput").value.trim();

      // --- Third ply: my second move ---
      const my2Lines = getScoredLines(document.getElementById("output").value);
      let bestSecondScore = -Infinity;
      for (const { score: my2Score } of my2Lines) {
        if (my2Score > bestSecondScore) bestSecondScore = my2Score;
      }

      // --- Fourth ply: opponent’s second reply (optional deeper check) ---
      // You can expand here if you want to simulate opp’s second move fully.
      const branchEval = myScore - oppScore + bestSecondScore;

      if (branchEval < worstReplyEval) worstReplyEval = branchEval;

      // RESTORE to afterMyFen before next opponent reply
      document.getElementById("fenInput").value = afterMyFen;
      loadFEN();
      await wait(100);
    }

    // RESTORE to originalFen before next candidate
    document.getElementById("fenInput").value = originalFen;
    loadFEN();
    await wait(100);

    // Update best move choice
    if (worstReplyEval > bestNetScore) {
      bestNetScore = worstReplyEval;
      bestMoves = [moveText];
    } else if (Math.abs(worstReplyEval - bestNetScore) < 0.01) {
      bestMoves.push(moveText);
    }
  }

  const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  document.getElementById("bestMoveDisplay").innerText = chosenMove;
}

// Helpers
function getScoredLines(output) {
  return output.trim().split('\n')
    .filter(l => l.includes('→') && l.includes('Score:'))
    .map(l => ({
      moveText: l.split(' | ')[0],
      score: parseFloat(l.match(/Score:\s*([\d.]+)/)[1])
    }))
    .filter(x => Number.isFinite(x.score));
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }


