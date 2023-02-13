// eslint-disable-next-line import/prefer-default-export, import/no-mutable-exports
export let ws: WebSocket;

// ws.onopen = () => {
//   console.log(ws);
// };

export function createConnection() {
  ws = new WebSocket('ws://localhost:14000');
}
