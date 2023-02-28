// eslint-disable-next-line import/no-extraneous-dependencies
import diceRoller from 'dice-roller-3d';
import { allCells } from './cellsInfo';
import Control from '../../../common/common';
import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import { GameInfo, Player } from '../../types/game';

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
      container.destroy();
      const data = {
        event: 'step',
        payload: {
          gameId: this.gameInfo.gameId,
          nickname: this.name,
        },
      };
      ws.send(JSON.stringify(data));
    };
  }

  renderBuyPopUp(data: any) {
    const { buildName, buildCost, activePlayer } = data;
    const factoryName = allCells.find((el) => el.name === buildName);
    const playerMoney = data.players.find(
      (el: { nickname: string }) => el.nickname === activePlayer,
    ).money;
    const container = new Control(this.container.node, 'div', 'popup');
    const wrapper = new Control(container.node, 'div', 'popup__message');
    const text = `Do you want to buy ${factoryName?.company} for ${buildCost}$`;
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
      container.destroy();
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
    };

    decline.node.onclick = () => {
      container.destroy();
      ws.send(
        JSON.stringify({
          event: 'stepend',
          payload: {
            gameId: this.gameInfo.gameId,
            nickname: this.name,
          },
        }),
      );
    };
  }

  renderPayPopUp(data: any) {
    const playerMoney = data.players.find(
      (el: { nickname: string }) => el.nickname === data.activePlayer,
    ).money;

    const container = new Control(this.container.node, 'div', 'popup');

    const actives = this.countAllPossibleMoney(data);
    if (actives < data.costParking) {
      const wrapper = new Control(container.node, 'div', 'popup__message');
      new Control(
        wrapper.node,
        'p',
        'popup__text',
        'NO CHANCE. YOU ARE BANKRUPT',
      );
      ws.send(
        JSON.stringify({
          event: 'banckrot',
          payload: {
            gameId: this.gameInfo.gameId,
            nickname: this.name,
          },
        }),
      );
    } else {
      const wrapper = new Control(container.node, 'div', 'popup__message');
      const text = `You are on ${data.ownerName} territory, you should pay him ${data.costParking}$`;
      new Control(wrapper.node, 'p', 'popup__text', text);
      const btns = new Control(wrapper.node, 'div', 'popup__btn-line');
      const pay = new Control(btns.node, 'button', 'popup__btn pay', 'PAY');
      pay.node.onclick = () => {
        container.destroy();
        ws.send(
          JSON.stringify({
            event: 'paying',
            payload: {
              gameId: this.gameInfo.gameId,
              nickname: this.name,
            },
          }),
        );
      };
      pay.node.setAttribute('data-cost', data.costParking);
      if (playerMoney < data.costParking) {
        pay.node.setAttribute('disabled', 'true');
        new Control(
          wrapper.node,
          'div',
          'popup__description',
          'You have not enough money, try to sell something',
        );
      }
    }
  }
  renderBonusPopUp(data: any) {
    const playerMoney = data.players.find(
      (el: { nickname: string }) => el.nickname === data.activePlayer,
    ).money;

    const container = new Control(this.container.node, 'div', 'popup');
    const actives = this.countAllPossibleMoney(data);
    if (actives < 0) {
      const wrapper = new Control(container.node, 'div', 'popup__message');
      new Control(
        wrapper.node,
        'p',
        'popup__text',
        'NO CHANCE. YOU ARE BANKROT',
      );
      const btns = new Control(wrapper.node, 'div', 'popup__btn-line');
      const left = new Control(
        btns.node,
        'button',
        'popup__btn',
        'left the game',
      );
      left.node.onclick = () => {
        window.location.hash = '';
        window.location.reload();
      };
      ws.send(
        JSON.stringify({
          event: 'banckrot',
          payload: {
            gameId: this.gameInfo.gameId,
            nickname: this.name,
          },
        }),
      );
    } else if (playerMoney < 0) {
      const wrapper = new Control(container.node, 'div', 'popup__message');
      const text = 'You have no money, sell something to continue game';
      new Control(wrapper.node, 'p', 'popup__text', text);
      const btns = new Control(wrapper.node, 'div', 'popup__btn-line');
      const pay = new Control(btns.node, 'button', 'popup__btn pay', 'PAY');
      // todo stepend
      pay.node.onclick = () => {
        container.destroy();
        ws.send(
          JSON.stringify({
            event: 'stepend',
            payload: {
              gameId: this.gameInfo.gameId,
              nickname: this.name,
            },
          }),
        );
      };
      // todo
      pay.node.setAttribute('data-cost', String(Math.abs(playerMoney)));

      pay.node.setAttribute('disabled', 'true');
      new Control(
        wrapper.node,
        'div',
        'popup__description',
        'You have not enough money, try to sell something',
      );
    }
  }

  renderWinPopUp() {
    const container = new Control(this.container.node, 'div', 'popup');
    const wrapper = new Control(container.node, 'div', 'popup__message');
    new Control(
      wrapper.node,
      'p',
      'popup__text',
      'CONGRATULAION!!! You win this game!',
    );
    const btns = new Control(wrapper.node, 'div', 'popup__btn-line');
    const left = new Control(
      btns.node,
      'button',
      'popup__btn',
      'left the game',
    );
    left.node.onclick = () => {
      window.location.hash = '';
      window.location.reload();
    };
  }

  countAllPossibleMoney(data: any) {
    const curPlayerName = data.activePlayer;
    const allPlayers: Player[] = data.players;
    const playerInfo = allPlayers.find((el) => el.nickname === curPlayerName);
    const realMoney = playerInfo?.money || 0;
    const owns = playerInfo?.owner || [];
    let potentialMoney = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const val of owns) {
      const fMoney = allCells.find((el) => el.name === val)?.costSell;
      if (fMoney) {
        potentialMoney += fMoney;
      }
    }
    return realMoney + potentialMoney;
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
