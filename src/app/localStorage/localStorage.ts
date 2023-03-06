export function setNameLS(name: string) {
  localStorage.setItem('monopolyName', name);
}

export function getNameLS() {
  return localStorage.getItem('monopolyName');
}

export function clearNameLS() {
  localStorage.removeItem('monopolyName');
}

export function setInRoomLS() {
  localStorage.setItem('isInRoom', 'true');
}

export function getInRoomLS() {
  return localStorage.getItem('isInRoom');
}

export function clearInRoomLS() {
  localStorage.removeItem('isInRoom');
}

export function setInGameLS(gameId: number) {
  localStorage.setItem('currentGame', String(gameId));
}

export function getIngameLS() {
  return localStorage.getItem('currentGame');
}

export function clearInGameLS() {
  localStorage.removeItem('currentGame');
}
