/* capture.js – capture the best move + show FEN after applying it */
function captureMove() {
  // 1. Grab UI values
  const bestMoveText = document.getElementById("bestMoveDisplay").textContent.trim();
  const currentFEN    = document.getElementById("fenInput").value.trim();

  // 2. Parse move & score
  const moveMatch = bestMoveText.match(/Best Move:\s*(.*?)\s*\|/);
  const scoreMatch = bestMoveText.match(/\|\s*Score:\s*(\d+)/);

  const cleanedMove = moveMatch ? moveMatch[1].replace(/â†’|→|->/g, "").trim() : "Unavailable";
  const score       = scoreMatch ? scoreMatch[1] : "Unknown";

  // 3. Show captured move & original FEN
  document.getElementById("captureMoveOutput").value = `${cleanedMove} | Score: ${score}`;
  document.getElementById("captureFENOutput").value  = currentFEN;

  // 4. Apply the move and show the new FEN
  const newFEN = applyMoveToFEN(currentFEN, cleanedMove);
  document.getElementById("appliedFENOutput").value = newFEN;
}

/* ------------------------------------------------------------------
   Helper: apply a path move (exactly like your Python script)
   ------------------------------------------------------------------ */
function applyMoveToFEN(fen, pathStr) {
  if (!pathStr || pathStr === "Unavailable") return fen;

  // ---- parse FEN parts ------------------------------------------------
  const parts = fen.split(/\s+/);
  const boardRows = parts[0].split('/');
  const turn = parts[1] || 'w';
  const castling = parts[2] || '-';
  const enPassant = parts[3] || '-';
  const halfmove = parts[4] || '0';
  const fullmove = parts[5] || '1';

  // ---- build 8x8 board ------------------------------------------------
  const board = [];
  for (let r of boardRows) {
    const row = [];
    for (let ch of r) {
      if (/\d/.test(ch)) {
        row.push(...Array(+ch).fill(null));
      } else {
        row.push(ch);
      }
    }
    board.push(row);
  }

  // ---- parse path: "(file,rank) (file,rank) ..." ----------------------
  const coordRE = /\((\d+),(\d+)\)/g;
  const matches = [...pathStr.matchAll(coordRE)];
  if (matches.length < 2) return fen;               // need at least start+end

  const coords = matches.map(m => {
    const file = +m[1];      // 1-8 (a-h)
    const rank = +m[2];      // 1-8 (bottom-top)
    return { r: 8 - rank, c: file - 1 };   // 0-based row/col
  });

  const start = coords[0];
  const end   = coords[coords.length - 1];

  const piece = board[start.r][start.c];
  if (!piece) return fen;                    // nothing to move

  // ---- perform the move -----------------------------------------------
  board[start.r][start.c] = null;
  const captured = board[end.r][end.c];
  board[end.r][end.c] = piece;

  // ---- update FEN metadata --------------------------------------------
  const newTurn = turn === 'w' ? 'b' : 'w';

  const isPawn = piece.toLowerCase() === 'p';
  const isCapture = captured !== null;
  const newHalf = (isPawn || isCapture) ? '0' : String(+halfmove + 1);

  const newFull = turn === 'b' ? String(+fullmove + 1) : fullmove;

  // castling – strip rights for the side that moved a king
  let newCast = castling;
  if (piece.toLowerCase() === 'k') {
    const side = piece === 'k' ? 'kq' : 'KQ';
    newCast = newCast.replace(new RegExp(`[${side}]`, 'g'), '');
  }

  const newEP = '-';   // simplified – real engine would compute it

  // ---- rebuild FEN string ---------------------------------------------
  const fenRows = board.map(row => {
    let str = '';
    let empty = 0;
    for (let cell of row) {
      if (cell === null) { empty++; }
      else {
        if (empty) { str += empty; empty = 0; }
        str += cell;
      }
    }
    if (empty) str += empty;
    return str;
  });

  return `${fenRows.join('/')} ${newTurn} ${newCast} ${newEP} ${newHalf} ${newFull}`;
}


