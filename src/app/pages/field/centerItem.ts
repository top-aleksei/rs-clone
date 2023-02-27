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
    input.node.setAttribute('name', 'message');
    (input.node as HTMLInputElement).placeholder = 'Start your message..';
    new Control(this.chatForm.node, 'button', 'chat__btn', 'send');
    this.chatForm.node.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(this.chatForm.node as HTMLFormElement);
      const message = formData.get('message');
      if (message) {
        ws.send(
          JSON.stringify({
            event: 'chatMessage',
            payload: {
              gameId: this.gameInfo.gameId,
              nickname: this.name,
              message,
            },
          }),
        );
        (input.node as HTMLInputElement).value = '';
      }
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

  renderBuyPopUp(data: any) {
    const { buildName, buildCost, activePlayer } = data;
    const playerMoney = data.players.find(
      (el: { nickname: string }) => el.nickname === activePlayer,
    ).money;
    const container = new Control(this.container.node, 'div', 'popup');
    const wrapper = new Control(container.node, 'div', 'popup__message');
    const text = `Do you want to buy ${buildName} for ${buildCost}$`;
    new Control(wrapper.node, 'p', 'popup__text', text);
    const btns = new Control(wrapper.node, 'div', 'popup__btn-line');
    const accept = new Control(
      btns.node,
      'button',
      'popup__btn popup__btn_green pay',
      'BUY',
    );
    accept.node.setAttribute('data-cost', buildCost);
    const decline = new Control(
      btns.node,
      'button',
      'popup__btn popup__btn_red',
      'DECLINE',
    );
    if (playerMoney < buildCost) {
      new Control(
        wrapper.node,
        'div',
        'popup__description',
        'You need more money to buy it',
      );
      accept.node.setAttribute('disabled', 'true');
    }
    accept.node.onclick = () => {
      ws.send(
        JSON.stringify({
          event: 'buying',
          payload: {
            gameId: this.gameInfo.gameId,
            nickname: this.name,
            buildName,
          },
        }),
      );
      container.destroy();
    };

    decline.node.onclick = () => {
      ws.send(
        JSON.stringify({
          event: 'stepend',
          payload: {
            gameId: this.gameInfo.gameId,
            nickname: this.name,
          },
        }),
      );
      container.destroy();
    };
  }

  renderPayPopUp(data: any) {
    const container = new Control(this.container.node, 'div', 'popup');
    const wrapper = new Control(container.node, 'div', 'popup__message');
    const text = `You are on ${data.ownerName} territory, you should pay him ${data.costParking}$`;
    new Control(wrapper.node, 'p', 'popup__text', text);
    const btns = new Control(wrapper.node, 'div', 'popup__btn-line');
    const pay = new Control(btns.node, 'button', 'popup__btn', 'PAY');
    pay.node.onclick = () => {
      ws.send(
        JSON.stringify({
          event: 'paying',
          payload: {
            gameId: this.gameInfo.gameId,
            nickname: this.name,
          },
        }),
      );
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
