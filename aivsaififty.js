// aiVsAiFifty.js  (your original, improved with smart wait)

async function aiVsAiFifty(cycles = 50) {
  const moveLogs = document.getElementById("moveLogs");
  moveLogs.value = ""; 

  for (let i = 1; i <= cycles; i++) {
    // 1. Ensure current FEN is loaded
    loadFEN(); 
    await new Promise(resolve => setTimeout(resolve, 3000)); // UI render

    // 2. Generate best 2-ply move
    await bestMoveTwoPlies(); 
    
    // SMART WAIT: Wait for bestMoveDisplay to update — max 3 minutes
    const startTime = Date.now();
    const maxWait = 3 * 60 * 1000; // 3 minutes
    let lastMove = "";

    while (true) {
      const currentMove = document.getElementById("bestMoveDisplay").innerText.trim();
      if (currentMove && currentMove !== lastMove && currentMove !== "Calculating...") {
        break; // Move is ready!
      }
      if (Date.now() - startTime > maxWait) {
        console.warn(`Cycle ${i}: bestMoveTwoPlies took >3 min, proceeding anyway...`);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // check every 0.5s
      lastMove = currentMove;
    }

    // 3. Apply the move
    applyBestMove();
    
    // 4. Transfer FEN
    transferFinalFEN(); 
    
    // 5. Log
    const move = document.getElementById("bestMoveDisplay").innerText.trim();
    const newFen = document.getElementById("finalFENOutput").value.trim();
    moveLogs.value += `${i}. Move: ${move}\n    FEN: ${newFen}\n\n`;
    
    // Short pause for visibility
    await new Promise(resolve => setTimeout(resolve, 5000)); 
  }
}
