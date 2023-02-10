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
