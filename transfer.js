// transfer.js
function transferFinalFEN() {
  const finalFen = document.getElementById("finalFENOutput").value.trim();
  const fenInput = document.getElementById("fenInput");
  const moveLogs = document.getElementById("moveLogs");
  const bestMove = document.getElementById("bestMoveDisplay").innerText.trim();

  if (!finalFen) {
    alert("No Final FEN available to transfer.");
    return;
  }

  // Copy Final FEN into FEN Input field
  fenInput.value = finalFen;

  // Append move + FEN into game log
  const logEntry = `Transferred Move: ${bestMove || "(unknown move)"}\nFEN: ${finalFen}\n\n`;
  moveLogs.value += logEntry;

  // Optional: scroll to bottom of logs
  moveLogs.scrollTop = moveLogs.scrollHeight;
}


