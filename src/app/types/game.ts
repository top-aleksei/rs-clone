// export interface Player {
//   id: number;
//   name: string;
//   bank: number;
// }

export interface Room {
  gameId: number;
  qty: number;
  nicknames: string[];
}

export interface GameInfo {
  gameId: number;
  activePlayer: string;
  nicknames: string[];
  type: string;
  players: PlayerInGame[];
}

export interface PlayerInGame {
  nickname: string;
  position: number;
  color: string;
}
