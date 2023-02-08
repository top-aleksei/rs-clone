export function setNameLS(name: string) {
  localStorage.setItem('monopolyName', name);
}

export function getNameLS() {
  return localStorage.getItem('monopolyName');
}

export function clearNameLS() {
  localStorage.removeItem('monopolyName');
}
