import Control from '../../../common/common';
import { ws } from '../../controller/socket';
import {
  clearInRoomLS,
  getInRoomLS,
  getNameLS,
  setInRoomLS,
} from '../../localStorage/localStorage';
import { Room } from '../../types/game';
import GameRoom from './gameRoom';

class Games {
  container: Control;
  form: Control;
  list: Control;

  constructor(parent: HTMLElement) {
    this.container = new Control(parent, 'div', 'games');
    this.renderTitle();
    this.form = new Control(this.container.node, 'form', 'games__form');
    this.addWsListener();
    this.renderForm();
    this.list = new Control(this.container.node, 'div', 'games__list');
    // clear in Room when rendering
  }

  renderTitle() {
    new Control(this.container.node, 'h2', 'games__title', 'Game rooms');
  }

  disableEnableCreation() {
    const elements = [...this.form.node.children];
    if (getInRoomLS()) {
      elements.forEach((el) => el.setAttribute('disabled', 'true'));
    } else {
      elements.forEach((el) => el.removeAttribute('disabled'));
    }
  }

  renderForm() {
    clearInRoomLS();
    const createBTN = new Control(this.form.node, 'input', 'games__button');
    (createBTN.node as HTMLInputElement).type = 'submit';
    (createBTN.node as HTMLInputElement).value = 'create new game';

    const select = new Control(this.form.node, 'select', 'games__select');
    select.node.setAttribute('name', 'qty');
    const gameTypes = [2, 3, 4];
    gameTypes.forEach((el) => {
      const option = new Control(
        select.node,
        'option',
        'games__option',
        `${el} players`,
      );
      (option.node as HTMLSelectElement).value = String(el);
    });
    this.createGameListener();
  }

  addWsListener() {
    ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data);
      if (res.event === 'rooms') {
        this.loadExistGames(res.games);
      }
      if (res.event === 'newroom') {
        const room = new GameRoom(
          this.list.node,
          res.room,
          this.disableEnableCreation.bind(this),
        );
        room.renderPlayers();
      }
    });
  }

  createGameListener() {
    this.form.node.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(this.form.node as HTMLFormElement);
      const totalPlayers = formData.get('qty') || 2;
      const name = getNameLS();
      if (name) {
        const roomInfo: Room = {
          gameId: Date.now(),
          qty: +totalPlayers,
          nicknames: [name],
        };
        ws.send(JSON.stringify({ event: 'create', payload: roomInfo }));
        setInRoomLS();
        // this.disableEnableCreation();
      }
    };
  }

  loadExistGames(rooms: Room[]) {
    if (rooms.length > 0) {
      rooms.forEach((el) => {
        if (el.qty !== el.nicknames.length) {
          const room = new GameRoom(
            this.list.node,
            el,
            this.disableEnableCreation.bind(this),
          );
          room.renderPlayers();
        }
      });
    }
  }
}

export default Games;
