/**
 * Generic N-ply search. Call bestMovePlies(2) or bestMovePlies(4).
 */
async function bestMovePlies(depth = 2) {
  loadFEN();
  await wait(100);

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

    // Apply candidate move
    document.getElementById("bestMoveDisplay").innerText = moveText;
    applyBestMove();
    await wait(50);

    const afterMoveFen = document.getElementById("finalFENOutput").value.trim();

    let netScore = myScore;
    if (depth > 2) {
      // Switch turn in FEN
      const opponentTurn = currentTurn === 'w' ? 'b' : 'w';
      document.getElementById("fenInput").value = afterMoveFen.replace(/\s[wb]\s/, " " + opponentTurn + " ");
      loadFEN();
      await wait(100);

      // Evaluate opponent replies recursively
      const oppScore = await evaluateReplies(depth - 1);
      netScore -= oppScore;
    }

    // Restore board
    document.getElementById("fenInput").value = originalFen;
    loadFEN();

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

async function evaluateReplies(depth) {
  const oppOutput = document.getElementById("output").value;
  const oppLines = oppOutput.trim().split('\n')
    .filter(l => l.includes('→') && l.includes('Score:'));

  if (oppLines.length === 0) return 0;

  let bestScore = -Infinity;
  for (let oppLine of oppLines) {
    const oppMoveText = oppLine.split(' | ')[0];
    const oppScore = parseFloat(oppLine.match(/Score:\s*([\d.]+)/)[1]);

    // Apply opponent move
    document.getElementById("bestMoveDisplay").innerText = oppMoveText;
    applyBestMove();
    await wait(50);

    const afterOppFen = document.getElementById("finalFENOutput").value.trim();

    let score = oppScore;
    if (depth > 1) {
      const myTurn = currentTurn === 'w' ? 'b' : 'w';
      document.getElementById("fenInput").value = afterOppFen.replace(/\s[wb]\s/, " " + myTurn + " ");
      loadFEN();
      await wait(100);

      score += await evaluateReplies(depth - 1);
    }

    if (score > bestScore) bestScore = score;
  }
  return bestScore;
}

// tiny helper
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

