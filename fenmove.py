#!/usr/bin/env python3
import re

def fen_to_board(fen):
    rows = fen.split()[0].split('/')
    board = []
    for row in rows:
        expanded = []
        for char in row:
            if char.isdigit():
                expanded.extend([None] * int(char))
            else:
                expanded.append(char)
        board.append(expanded)
    return board

def extract_fen_parts(fen):
    parts = fen.split()
    return {
        'board': parts[0],
        'turn': parts[1],
        'castling': parts[2] if len(parts) > 2 else '-',
        'en_passant': parts[3] if len(parts) > 3 else '-',
        'halfmove': parts[4] if len(parts) > 4 else '0',
        'fullmove': parts[5] if len(parts) > 5 else '1'
    }

def board_to_fen(board, turn, castling='-', en_passant='-', halfmove='0', fullmove='1'):
    fen_rows = []
    for row in board:
        fen_row = ''
        empty = 0
        for cell in row:
            if cell is None:
                empty += 1
            else:
                if empty:
                    fen_row += str(empty)
                    empty = 0
                fen_row += cell
        if empty:
            fen_row += str(empty)
        fen_rows.append(fen_row)
    return f"{'/'.join(fen_rows)} {turn} {castling} {en_passant} {halfmove} {fullmove}"

def parse_move_path(path_str):
    matches = re.findall(r'\((\d+),(\d+)\)', path_str)
    return [(8 - int(rank), int(file) - 1) for file, rank in matches]

def apply_move(fen, move_path_str):
    parts = extract_fen_parts(fen)
    board = fen_to_board(fen)
    coords = parse_move_path(move_path_str)

    if len(coords) < 2:
        return fen

    start = coords[0]
    piece = board[start[0]][start[1]]
    if piece is None:
        print("Invalid move: no piece at starting square.")
        return fen

    # Clear all intermediate squares (excluding start)
    for coord in coords[1:]:
        board[coord[0]][coord[1]] = None

    # Move piece to final destination
    board[start[0]][start[1]] = None
    end = coords[-1]
    board[end[0]][end[1]] = piece

    # Turn
    new_turn = 'w' if parts['turn'] == 'b' else 'b'

    # Half-move clock
    is_pawn = piece.lower() == 'p'
    new_halfmove = '0'

    # Full-move number
    new_fullmove = str(int(parts['fullmove']) + (1 if parts['turn'] == 'b' else 0))

    # Castling rights (simplified)
    new_castling = parts['castling']
    if piece.lower() == 'k':
        side = 'KQ' if piece.isupper() else 'kq'
        new_castling = ''.join(c for c in new_castling if c not in side)

    new_en_passant = '-'

    return board_to_fen(board, new_turn, new_castling, new_en_passant,
                        new_halfmove, new_fullmove)

# ------------------ MAIN ------------------
if __name__ == "__main__":
    fen = input("Enter FEN string: ").strip()
    move_path = input("Enter move path (e.g., (5,8)(6,7)(7,7)): ").strip()

    new_fen = apply_move(fen, move_path)
    print("\nUpdated FEN:")
    print(new_fen)

    output_path = "newfen.txt"
    try:
        with open(output_path, "w") as f:
            f.write(new_fen + "\n")
        print(f"\nSUCCESS: FEN written to {output_path}")
    except Exception as e:
        print(f"\nERROR: Failed to write to {output_path}")
        print(f"Reason: {e}")

