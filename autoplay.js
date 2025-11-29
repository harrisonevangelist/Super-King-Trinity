// autoplay.js - AutoPlay with SKT protection and stop button

let stopAutoPlay = false;

async function autoPlayCycles(cycles = 50) {
  stopAutoPlay = false;
  const moveLogs = document.getElementById("moveLogs");
  moveLogs.value = "";

  for (let i = 1; i <= cycles && !stopAutoPlay; i++) {
    loadFEN();  // Refresh board and state
    await new Promise(r => setTimeout(r, 300));

    // Check if SKT is still on board using synced state
    if (!latestStartPos || !latestTargets.has(latestStartPos)) {
      moveLogs.value += `\nGAME OVER: SKT captured at cycle ${i}\n`;
      break;
    }

    bestMove();  // Compute best move
    await new Promise(r => setTimeout(r, 300));
    applyBestMove();  // Apply it
    await new Promise(r => setTimeout(r, 300));

    const move = document.getElementById("bestMoveDisplay").innerText.trim();
    const newFen = document.getElementById("finalFENOutput").value.trim();
    document.getElementById("fenInput").value = newFen;

    moveLogs.value += `${i}. Move: ${move}\n   FEN: ${newFen}\n\n`;
    await new Promise(r => setTimeout(r, 500));
  }
}

function stopAutoPlayNow() {
  stopAutoPlay = true;  // Allows stopping mid-cycle
}

