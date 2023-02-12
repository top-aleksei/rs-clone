export interface Player {
  id: number;
  name: string;
  bank: number;
}

export interface Room {
  gameId: number;
  qty: number;
  nicknames: string[];
}
