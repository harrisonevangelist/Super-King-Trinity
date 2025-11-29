function applyBestMove() {
  const moveText = document.getElementById("bestMoveDisplay").innerText.trim();
  if (!moveText || !moveText.includes("(")) {
    alert("No valid best move found.");
    return;
  }

  // Parse move path like (5,8) → (6,7) → (7,7)
  const regex = /\((\d),(\d)\)/g;
  const path = [];
  let match;
  while ((match = regex.exec(moveText)) !== null) {
    path.push([parseInt(match[1], 10), parseInt(match[2], 10)]);
  }

  if (path.length < 2) {
    alert("Move path too short to apply.");
    return;
  }

  const board = document.getElementById("board");
  const getCell = (x, y) => board.rows[8 - y].cells[x - 1];

  // Get the piece from the first square in the path
  const [fromX, fromY] = path[0];
  const sourceCell = getCell(fromX, fromY);
  const piece = sourceCell.innerText.trim();

  if (!piece) {
    alert("No piece found at source square.");
    return;
  }

  // Clear the source square
  sourceCell.innerText = "";

  // Clear intermediate squares along the path (captures)
  for (let i = 1; i < path.length - 1; i++) {
    const [x, y] = path[i];
    const cell = getCell(x, y);
    if (cell.innerText.trim() !== "") {
      cell.innerText = ""; // remove captured piece
    }
  }

  // Final destination
  const [toX, toY] = path[path.length - 1];
  let finalPiece = piece;

  // --- Pawn Promotion Logic inferred from score ---
  if (piece.toLowerCase() === "p" && (toY === 8 || toY === 1)) {
    const scoreMatch = moveText.match(/Score:\s*([\d.]+)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
    const isWhitePawn = piece === "P";

    if (score !== null) {
      const promoPiece = mapPromoFromScore(score);
      finalPiece = isWhitePawn ? promoPiece.toUpperCase() : promoPiece.toLowerCase();
    } else {
      // Fallback: default to queen
      finalPiece = isWhitePawn ? "Q" : "q";
    }
  }

  // Place the piece at the final destination
  getCell(toX, toY).innerText = finalPiece;

  // Update FEN turn
  const fenInput = document.getElementById("fenInput").value.trim();
  const fenParts = fenInput.split(" ");
  if (fenParts.length < 6) {
    alert("Invalid FEN format.");
    return;
  }

  const currentTurn = fenParts[1];
  const nextTurn = currentTurn === "w" ? "b" : "w";
  fenParts[1] = nextTurn;

  const newFEN = generateFENFromBoard() + " " + fenParts.slice(1).join(" ");
  document.getElementById("finalFENOutput").value = newFEN;
}

// Map a move score to a promotion piece, handling SKT base and normal capture sums
function mapPromoFromScore(score) {
  const SKT_BASE = 10000;

  // Promotion values (note bishop = 3.01)
  const promoMap = [
    { val: 9,   piece: "Q" },
    { val: 3.5, piece: "R" },
    { val: 3.01,piece: "B" },
    { val: 3,   piece: "N" },
    { val: 1,   piece: "P" },
  ];

  // Capture values (normal pieces)
  const captureVals = [9, 3.5, 3, 1];

  // If SKT captured, remove base and match exactly
  if (score >= SKT_BASE) {
    const val = +(score - SKT_BASE).toFixed(2);
    for (const { val: pv, piece } of promoMap) {
      if (pv === val) return piece;
    }
    return "Q"; // fallback
  }

  // Otherwise: score may be promoValue + capturedPieceValue
  for (const { val: pv, piece } of promoMap) {
    const remaining = +(score - pv).toFixed(2);
    if (captureVals.includes(remaining)) return piece;
  }

  // If no exact match, fallback to queen
  return "Q";
}

function generateFENFromBoard() {
  const board = document.getElementById("board");
  let fen = "";

  for (let row = 0; row < 8; row++) {
    let empty = 0;
    for (let col = 0; col < 8; col++) {
      const cell = board.rows[row].cells[col];
      const piece = cell.innerText.trim();
      if (!piece) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        fen += piece;
      }
    }
    if (empty > 0) fen += empty;
    if (row < 7) fen += "/";
  }

  return fen;
}


