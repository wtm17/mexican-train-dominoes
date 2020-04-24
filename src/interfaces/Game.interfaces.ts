export interface Game {
  board: Board;
  players: Player[],
  pool: Piece[];
}

export interface Board {
  middle?: Piece;
  trains: Train[],
}

export interface Train {
  hasTrain: boolean;
  owner: string;
  pieces: Piece[];
}

export interface Player {
  id: number;
  isHost: boolean;
  isTurn: boolean;
  isWinner: boolean;
  name: string;
  pieces: Piece[],
  points: number;
}

export interface Piece {
  0: number; // left
  1: number; // right
}
