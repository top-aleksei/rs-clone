import Control from '../../../common/common';
import {
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
    this.renderForm();
    this.list = new Control(this.container.node, 'div', 'games__list');
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

  createGameListener() {
    this.form.node.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(this.form.node as HTMLFormElement);
      const totalPlayers = formData.get('qty') || 2;
      const name = getNameLS();
      if (name) {
        const roomInfo: Room = {
          id: Date.now(),
          qty: +totalPlayers,
          players: [name],
        };
        setInRoomLS();
        this.disableEnableCreation();
        const room = new GameRoom(
          this.list.node,
          roomInfo,
          this.disableEnableCreation.bind(this),
        );
        room.renderPlayers();
      }
    };
  }
}

export default Games;
