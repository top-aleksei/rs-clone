// eslint-disable-next-line import/prefer-default-export, import/no-mutable-exports
export let ws: WebSocket;

export function createConnection() {
  ws = new WebSocket('wss://mymonopoly.sytes.net');
  // ws = new WebSocket('ws://localhost:14000');
}
