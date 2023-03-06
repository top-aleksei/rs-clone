import { getInRoomLS } from '../localStorage/localStorage';

export function changeHash(hash: string) {
  window.location.hash = hash;
}

export function changeHashonLoad() {
  const room = getInRoomLS();
  if (room) {
    window.location.hash = room;
  }
}
