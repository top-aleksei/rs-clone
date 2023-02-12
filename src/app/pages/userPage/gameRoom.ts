import Control from '../../../common/common';
import { ws } from '../../controller/socket';
import {
  clearInRoomLS,
  getInRoomLS,
  getNameLS,
  setInRoomLS,
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
      const name = this.roomInfo.nicknames[i];
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
          empty.node.onclick = () => {
            this.joinRoom();
            // setInRoomLS();
          };
        }
      }
    }
  }

  joinRoom() {
    this.roomInfo.nicknames.push(this.name);
    ws.send(
      JSON.stringify({
        event: 'join',
        payload: { gameId: this.roomInfo.gameId, nickname: this.name },
      }),
    );
    setInRoomLS();
  }

  leaveRoom() {
    clearInRoomLS();
    const { nicknames } = this.roomInfo;

    const ind = nicknames.indexOf(this.name);
    if (ind !== -1) {
      nicknames.splice(ind, 1);
    }
    ws.send(
      JSON.stringify({
        event: 'leave',
        payload: { gameId: this.roomInfo.gameId, nickname: this.name },
      }),
    );

    this.enableCreation();
  }

  addWsListener() {
    ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data);
      if (
        res.event === 'changeroom' &&
        res.room.gameId === this.roomInfo.gameId
      ) {
        this.roomInfo = res.room;
        console.log('res');
        if (res.room.nicknames.length === 0) {
          this.container.destroy();
        } else {
          this.renderPlayers();
          // this.enableCreation();
        }
      }
    });
  }
}

export default GameRoom;
