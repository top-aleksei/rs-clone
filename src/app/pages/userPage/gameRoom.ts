import Control from '../../../common/common';
import { ws } from '../../controller/socket';
import {
  clearInRoomLS,
  getInRoomLS,
  getNameLS,
} from '../../localStorage/localStorage';
import { Room } from '../../types/game';

class GameRoom {
  container: Control;
  title: Control;
  players: Control;
  roomInfo: Room;
  name: string;
  enableCreation: () => void;

  constructor(parent: HTMLElement, roomInfo: Room, enableCreation: () => void) {
    this.name = getNameLS() || '';
    this.enableCreation = enableCreation;
    this.roomInfo = roomInfo;
    this.container = new Control(parent, 'div', 'room');
    this.title = new Control(
      this.container.node,
      'p',
      'room__title',
      'regular game',
    );
    this.players = new Control(this.container.node, 'p', 'room__players');
    this.addWsListener();
  }

  renderPlayers() {
    this.players.node.textContent = '';
    for (let i = 0; i < this.roomInfo.qty; i += 1) {
      const block = new Control(this.players.node, 'div', 'room__player');
      const name = this.roomInfo.players[i];
      if (name) {
        new Control(block.node, 'div', 'room__img');
        new Control(block.node, 'div', 'room__text', name);
        if (this.name === name) {
          const leave = new Control(block.node, 'div', 'room__exit');
          leave.node.onclick = this.leaveRoom.bind(this);
        }
      } else {
        const empty = new Control(block.node, 'div', 'room__empty', '+');
        if (!getInRoomLS()) {
          empty.node.classList.add('active');
          new Control(block.node, 'div', 'room__text', 'join');
          empty.node.onclick = () => this.joinRoom;
        }
      }
    }
  }

  joinRoom() {
    this.roomInfo.players.push(this.name);
    ws.send(JSON.stringify({ title: 'rerender room', body: this.roomInfo }));
  }

  leaveRoom() {
    clearInRoomLS();
    const { players } = this.roomInfo;

    const ind = players.indexOf(this.name);
    if (ind !== -1) {
      players.splice(ind, 1);
    }
    ws.send(JSON.stringify({ title: 'rerender room', body: this.roomInfo }));
    if (players.length === 0) {
      this.container.destroy();
    } else {
      this.renderPlayers();
    }
    this.enableCreation();
  }

  addWsListener() {
    ws.onmessage = (e) => {
      const res = e.data;
      if (res.title === 'rerender room' && res.body.id === this.roomInfo.id) {
        this.roomInfo = res.body;
        this.renderPlayers();
      }
    };
  }
}

export default GameRoom;
