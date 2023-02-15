import Control from '../../../common/common';
import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import { GameInfo } from '../../types/game';

class CenterItem {
  container: Control;
  chat: Control;
  chatForm: Control;
  name: string;
  gameInfo: GameInfo;

  constructor(parent: HTMLElement, gameInfo: GameInfo) {
    this.name = getNameLS() || '';
    this.gameInfo = gameInfo;
    this.container = new Control(parent, 'div', 'board__center');
    this.chat = new Control(this.container.node, 'div', 'chat');
    this.chatForm = new Control(this.container.node, 'form', 'chat__form');
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

  addMessage(el: HTMLElement) {
    this.chat.node.append(el);
    this.chat.node.scrollTop = this.chat.node.scrollHeight;
  }
}

export default CenterItem;
