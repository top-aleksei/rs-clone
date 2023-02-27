import { allCells } from './cellsInfo';
import Control from '../../../common/common';
import {
  createBonusMessage,
  createBuyMessage,
  createChatMessage,
  createMessageThrow,
  createShouldPayMessage,
} from '../../controller/chat';
import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import { Colors, GameInfo, Player } from '../../types/game';
import Board from './board';
import Players from './players';
import state from '../../../common/state';
import { reloadBuyPopUp } from '../../controller/reloadPopUps';

class Game {
  container: Control;
  table: Control;
  wrapperTable: Control;
  board: Board;
  players: Players;
  gameInfo: GameInfo;
  name: string;

  constructor(parent: HTMLElement, gameInfo: GameInfo) {
    this.name = getNameLS() || '';
    this.container = new Control(parent, 'div', 'game');
    this.wrapperTable = new Control(parent, 'div', 'wrapper');
    this.table = new Control(this.wrapperTable.node, 'div', 'table');
    this.gameInfo = gameInfo;
    this.players = new Players(this.table.node, this.gameInfo);
    this.board = new Board(this.table.node, this.gameInfo);
    this.addWsLitener();
    this.activePlayerStartStep();
  }

  activePlayerStartStep() {
    if (this.isActive()) {
      this.board.fieldCenter.renderThrowDicePopup();
    }
  }

  isActive() {
    return this.name === this.gameInfo.activePlayer;
  }

  addWsLitener() {
    ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data);
      if (res.event === 'stepping') {
        const data = res.payload;
        this.gameInfo = {
          gameId: data.gameId,
          activePlayer: data.activePlayer,
          type: data.type,
          players: data.players,
        };

        // Throwing dices in next and abilitytobuy types
        if (
          data.type === 'next' ||
          data.type === 'abilityToByu' ||
          data.type === 'payingTax' ||
          data.type === 'bonus'
        ) {
          this.throwDicesAndMove(data);
        }

        // render Buy popup
        if (data.type === 'abilityToByu' && this.isActive()) {
          const delay = (data.boneOne + data.boneTwo) * 100 + 2200;
          setTimeout(() => {
            this.board.fieldCenter.renderBuyPopUp(data);
          }, delay);
        }
        if (data.type === 'buying') {
          this.buyFactory(data);
        }
        if (data.type === 'bonus') {
          this.stepOnBonus(data);
        }
        if (data.type === 'payingTax') {
          this.payingTax(data);
        }

        // temp (add temp second condition)
        if (this.isActive() && data.type === 'next') {
          setTimeout(() => {
            this.sendEndStep();
          }, 3000);
        }
        // temp
      } else if (res.event === 'startStep') {
        this.gameInfo.activePlayer = res.payload.activePlayer;
        state.activePlayer = res.payload.activePlayer;
        this.players.showCurrentPlayer();
        this.activePlayerStartStep();
      } else if (res.event === 'chatMessage') {
        const info = res.payload;
        const messageHTML = createChatMessage(
          info.color,
          info.nickname,
          info.message,
        );
        this.board.fieldCenter.addMessage(messageHTML);
        // event when someone payed
      } else if (res.event === 'paying') {
        const data = res.payload.players;
        this.players.rerenderMoney(data);
        if (this.isActive()) {
          this.sendEndStep();
        }
      } else if (res.event === 'selling') {
        this.sellFactory(res.payload);
      } else if (res.event === 'banckrot') {
        this.players.renderBankrupt(res.payload.nickname);
      }
    });
  }

  stepOnBonus(data: any) {
    const color = this.getActiveColor();
    const messageHTML = createBonusMessage(color, data.bonusSize);
    const { money } = data.players.find(
      (el: { nickname: string }) => el.nickname === data.activePlayer,
    );

    setTimeout(() => {
      this.board.fieldCenter.addMessage(messageHTML);
      this.players.rerenderMoney(data.players);
    }, 2500);

    if (this.isActive() && money >= 0) {
      setTimeout(() => {
        this.sendEndStep();
      }, 3000);
    } else if (this.isActive()) {
      setTimeout(() => {
        this.board.fieldCenter.renderBonusPopUp(data);
      }, 3000);
    }
  }

  throwDicesAndMove(data: any) {
    const color = this.getActiveColor();

    const dice = [data.boneOne, data.boneTwo];
    this.board.fieldCenter.rollDiceAnimation(dice);
    const messageHTML = createMessageThrow(color, dice);
    setTimeout(() => {
      this.board.moveTokens(this.gameInfo);
      this.board.fieldCenter.addMessage(messageHTML);
    }, 1200);
  }

  sellFactory(data: any) {
    const cell = allCells.find((el) => el.name === data.selling);
    if (cell) {
      cell.owner = null;
    }
    const id = cell?.id;

    const elem = document.getElementById(String(id));
    if (elem) {
      elem.style.backgroundColor = 'transparent';
    }
    this.players.rerenderMoney(data.players);
    if (this.name === data.activePlayer) {
      const currentMoney = data.players.find(
        (el: Player) => el.nickname === data.activePlayer,
      ).money;
      reloadBuyPopUp(currentMoney);
    }
  }

  buyFactory(data: any) {
    const color = this.getActiveColor();
    const message = createBuyMessage(color, data.activePlayer, data.buying);
    this.board.fieldCenter.addMessage(message);

    const cell = allCells.find((el) => el.name === data.buying);
    if (cell) {
      cell.owner = data.activePlayer;
    }
    const id = cell?.id;

    const elem = document.getElementById(String(id));
    if (elem) {
      elem.style.backgroundColor = Colors[color as keyof typeof Colors];
    }
    this.players.rerenderMoney(data.players);

    if (this.isActive()) {
      this.sendEndStep();
    }
  }

  payingTax(data: any) {
    const delay = (data.boneOne + data.boneTwo) * 100 + 2200;
    setTimeout(() => {
      const messageHTML = createShouldPayMessage(this.getActiveColor(), data);
      this.board.fieldCenter.addMessage(messageHTML);
    }, delay);
    if (this.isActive()) {
      if (data.activePlayer !== data.ownerName) {
        setTimeout(() => {
          this.board.fieldCenter.renderPayPopUp(data);
        }, delay);
      } else {
        setTimeout(() => {
          this.sendEndStep();
        }, 3000);
      }
    }
  }

  getActiveColor() {
    return (
      this.gameInfo.players.find(
        (el) => el.nickname === this.gameInfo.activePlayer,
      )?.color || 'white'
    );
  }

  sendEndStep() {
    ws.send(
      JSON.stringify({
        event: 'stepend',
        payload: {
          gameId: this.gameInfo.gameId,
          nickname: this.name,
        },
      }),
    );
  }
}

export default Game;
