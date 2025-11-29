
/**
 * Generates the FULL FEN string and updates BOTH the top display 
 * AND the bottom AI's primary FEN input (id="fenInput").
 * Also triggers the AI pipeline for one move automatically.
 */
function top_showPosition(nextMoveColor) { 
  // 1. Calculate FEN Ranks 
  let fenRanks = board.map(row => {
    let line = '';
    let empty = 0;
    for (let cell of row) {
      if (cell === '') {
        empty++;
      } else {
        if (empty > 0) {
          line += empty;
          empty = 0;
        }
        line += top_pieceToFEN(cell);
      }
    }
    if (empty > 0) line += empty;
    return line;
  }).join('/');
  
  // 2. Construct the full FEN string using the provided color and fixed defaults
  const color = (nextMoveColor === 'b' ? 'b' : 'w');
  const fullFEN = `${fenRanks} ${color} - - 0 1`;
  
  // 3. Update the top board's display
  document.getElementById("position").textContent = "Board Position:\n" + fullFEN;
  
  // 4. TRANSFER COMPLETE FEN TO AI's PRIMARY INPUT (id="fenInput")
  const bottomFenInput = document.getElementById("fenInput");
  if (bottomFenInput && bottomFenInput.tagName === 'TEXTAREA') {
    bottomFenInput.value = fullFEN;
  }
  
  // 5. Trigger AI one‑move pipeline automatically
  aiOneMove(fullFEN);

  return fullFEN;
}

// Guard flag
let aiPipelineRunning = false;

// AI makes one 2‑ply move, then stops
async function aiOneMove(fen) {
  if (!fen) {
    alert("No FEN generated!");
    return;
  }
  if (aiPipelineRunning) return;
  aiPipelineRunning = true;

  const moveLogs = document.getElementById("moveLogs");
  if (moveLogs) moveLogs.value = "";

  try {
    // 1. Load the FEN
    loadFEN();
    await wait(3000);

    // 2. Best 2‑ply move
    await bestMoveTwoPlies();

    // 3. Wait for bestMoveDisplay
    await waitForElement('#bestMoveDisplay', 180000);

    // 4. Apply move
    applyBestMove();
    await wait(500);

    // 5. Transfer final FEN
    transferFinalFEN();
    await wait(200);

    // 6. Log and update human board
    const move = document.getElementById("bestMoveDisplay").innerText.trim();
    const newFen = document.getElementById("finalFENOutput").value.trim();
    if (moveLogs) moveLogs.value += `AI Move: ${move}\nFEN: ${newFen}\n\n`;

    const humanInput = document.getElementById('topFenInput');
    humanInput.value = newFen;
    top_loadPosition(); // redraw top board
  } catch (e) {
    alert('AI pipeline error: ' + e.message);
  } finally {
    aiPipelineRunning = false;
  }
}

/* ---------- tiny helpers ---------- */
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function waitForElement(selector, timeoutMs) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) return resolve();
      if (Date.now() - start > timeoutMs) return reject(new Error('timeout'));
      requestAnimationFrame(check);
    };
    check();
  });
}




