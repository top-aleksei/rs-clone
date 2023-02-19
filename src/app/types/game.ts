export interface Player {
  nickname: string;
  position: number;
  color: string;
  money: number;
  owner: string[];
}

export interface Room {
  gameId: number;
  qty: number;
  nicknames: string[];
}

export interface GameInfo {
  gameId: number;
  activePlayer: string;
  // nicknames: string[];
  type: string;
  players: PlayerInGame[];
}

export interface PlayerInGame {
  nickname: string;
  position: number;
  color: string;
}

export enum Colors {
  green = 'rgba(21, 140, 20, 0.2)',
  red = 'rgba(252, 7, 7, 0.2)',
  blue = 'rgba(12, 12, 243, 0.2)',
  yellow = 'rgba(248, 248, 10, 0.2)',
}
