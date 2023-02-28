// eslint-disable-next-line import/prefer-default-export, import/no-mutable-exports
export let ws: WebSocket;

export function createConnection() {
  ws = new WebSocket('ws://45.82.153.155:14000');
  // ws = new WebSocket('ws://localhost:14000');
}
