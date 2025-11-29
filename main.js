let targets = new Map();
let obstacles = [];
let friendlies = [];
let startPos = null;
let currentTurn = 'w';

function loadFEN() {
  const fen = document.getElementById("fenInput").value.trim();
  if (fen.length === 0) {
    alert("Please enter a valid FEN string.");
    return;
  }
  parseFEN(fen);
}

function parseFEN(fen) {
  targets.clear();
  obstacles = [];
  friendlies = [];
  startPos = null;

  const pieceScores = { 'Q': 9, 'R': 3.5, 'N': 3, 'B': 3, 'P': 1, 'S': 10000 };
  const rows = fen.split(' ')[0].split('/');
  const turn = fen.split(' ')[1];
  currentTurn = turn;
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let y = 0; y < 8; y++) {
    // FIX: Use insertRow() on the table element
    const row = board.insertRow(); 
    let x = 0;
    for (let char of rows[y]) {
      if (/\d/.test(char)) {
        for (let i = 0; i < parseInt(char); i++) {
          const cell = row.insertCell();
          cell.className = (x + y) % 2 === 0 ? "white" : "black";
          x++;
        }
      } else {
        const pos = `${x + 1},${8 - y}`;
        const cell = row.insertCell();
        const isBlackSquare = (x + y) % 2 !== 0;
        cell.className = isBlackSquare ? "black" : "white";
        cell.textContent = char;

        const isWhitePiece = /[A-Z]/.test(char);
        const isBlackPiece = /[a-z]/.test(char);
        const pieceType = char.toUpperCase();

        if ((turn === 'b' && isWhitePiece) || (turn === 'w' && isBlackPiece)) {
          const score = pieceScores[pieceType] || 0;
          targets.set(pos, score);
          cell.classList.add("target");
          cell.title = `Target ${pos} → ${score}`;
        } else if ((turn === 'b' && isBlackPiece) || (turn === 'w' && isWhitePiece)) {
          friendlies.push({ pos, piece: pieceType });
          obstacles.push(pos);
          cell.classList.add("friendly");
          cell.title = `Friendly ${pieceType} at ${pos}`;
          if (pieceType === 'S') startPos = pos;
        }

        if ((turn === 'b' && char === 'S') || (turn === 'w' && char === 's')) {
          targets.set(pos, pieceScores['S']);
          cell.classList.add("target");
          cell.title = `🎯 Main Target SKT at ${pos} → ${pieceScores['S']}`;
        }

        x++;
      }
    }
  }

  const lines = [];
  for (let [pos, score] of targets.entries()) {
    lines.push(`🎯 Target (${pos}) → ${score}`);
  }
  for (let { pos } of friendlies) {
    lines.push(`🤝 Friendly (${pos})`);
  }
  for (let pos of obstacles) {
    lines.push(`⛔ Obstacle (${pos})`);
  }
  document.getElementById("targets").textContent = lines.join("\n");

  const output = document.getElementById("output");
  output.value = "";

  if (startPos) {
    const [sx, sy] = startPos.split(',').map(Number);
    // FIX: This call is commented out to prevent duplicate SKT path generation.
    // generatePaths(sx, sy, 'S'); 
  }

  // This loop now correctly handles ALL friendly pieces, including 'S', exactly once.
  for (let { pos, piece } of friendlies) {
    const [x, y] = pos.split(',').map(Number);
    generatePaths(x, y, piece);
  }
}

function linearPaths(x, y, directions) {
  const onBoard = ([a, b]) => a >= 1 && a <= 8 && b >= 1 && b <= 8;
  const isObstacle = ([a, b]) => obstacles.includes(`${a},${b}`);
  const getScore = ([a, b]) => targets.get(`${a},${b}`) || 0;

  const paths = [];

  function calculateScore(path) {
    const visited = new Set();
    let score = 0;
    for (let pos of path) {
      const key = `${pos[0]},${pos[1]}`;
      if (!visited.has(key)) {
        visited.add(key);
        score += getScore(pos);
      }
    }
    return score;
  }

  for (let [dx, dy] of directions) {
    let path = [[x, y]];
    let cx = x + dx, cy = y + dy;
    while (onBoard([cx, cy]) && !isObstacle([cx, cy])) {
      path.push([cx, cy]);
      paths.push({ path: [...path], score: calculateScore(path) });
      if (targets.has(`${cx},${cy}`)) break;
      cx += dx;
      cy += dy;
    }
  }

  paths.sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  return paths;
}

function generatePaths(x, y, piece) {
  const output = document.getElementById("output");
  output.value += `\nPaths for ${piece} at (${x},${y}):\n`;

  const isWhite = currentTurn === 'w';
  let paths = [];

  switch (piece) {
    case 'S': 
      paths = SktScoreObstacles(x, y);
      break;
    case 'R':
      paths = rookPaths(x, y);
      break;
    case 'B':
      paths = bishopPaths(x, y);
      break;
    case 'Q':
      paths = queenPaths(x, y);
      break;
    case 'N':
      paths = knightPaths(x, y);
      break;
    case 'P':
      paths = pawnPaths(x, y, isWhite);
      break;
    default:
      return;
  }

  if (paths.length === 0) {
    output.value += "No valid paths found.\n";
    return;
  }

  for (let item of paths) {
    const pathStr = item.path.map(p => `(${p[0]},${p[1]})`).join(" → ");
    output.value += `${pathStr} | Score: ${item.score}\n`;
  }
}
