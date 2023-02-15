// eslint-disable-next-line import/no-extraneous-dependencies
import diceRoller from 'dice-roller-3d';

import Control from '../../../common/common';
import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import { GameInfo } from '../../types/game';

class CenterItem {
  container: Control;
  chat: Control;
  chatForm: Control;
  dices: Control;
  name: string;
  gameInfo: GameInfo;

  constructor(parent: HTMLElement, gameInfo: GameInfo) {
    this.name = getNameLS() || '';
    this.gameInfo = gameInfo;
    this.container = new Control(parent, 'div', 'board__center');
    this.chat = new Control(this.container.node, 'div', 'chat');
    this.chatForm = new Control(this.container.node, 'form', 'chat__form');
    this.dices = new Control(this.container.node, 'div', 'dices');
    this.renderChat();
  }

  renderChat() {
    const input = new Control(this.chatForm.node, 'input', 'chat__input');
    (input.node as HTMLInputElement).placeholder = 'Start your message..';
    new Control(this.chatForm.node, 'button', 'chat__btn', 'send');
    this.chatForm.node.onsubmit = (e) => {
      e.preventDefault();
    };
  }

  renderThrowDicePopup() {
    const container = new Control(this.container.node, 'div', 'popup');
    const rollButton = new Control(container.node, 'div', 'popup__roll');
    rollButton.node.onclick = () => {
      const data = {
        event: 'step',
        payload: {
          gameId: this.gameInfo.gameId,
          nickname: this.name,
        },
      };
      ws.send(JSON.stringify(data));
      container.destroy();
    };
  }

  rollDiceAnimation(diceValues: number[]) {
    diceRoller({
      element: this.dices.node,
      numberOfDice: 2,
      values: diceValues,
    });
  }

  addMessage(el: HTMLElement) {
    this.chat.node.append(el);
    this.chat.node.scrollTop = this.chat.node.scrollHeight;
  }
}

export default CenterItem;
