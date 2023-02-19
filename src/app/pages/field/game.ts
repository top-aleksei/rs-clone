import { allCells } from './cellsInfo';
import Control from '../../../common/common';
import {
  createBuyMessage,
  createChatMessage,
  createMessageThrow,
} from '../../controller/chat';
import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import { Colors, GameInfo } from '../../types/game';
import Board from './board';
import Players from './players';

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
          data.type === 'payingTax'
        ) {
          this.throwDicesAndMove(data);
        }

        // render Buy popup
        if (data.type === 'abilityToByu' && this.isActive()) {
          const name = data.buildName;
          const cost = data.buildCost;
          const delay = (data.boneOne + data.boneTwo) * 100 + 2000;
          setTimeout(() => {
            this.board.fieldCenter.renderBuyPopUp(name, cost);
          }, delay);
        }
        if (data.type === 'buying') {
          this.buyFactory(data);
        }
        if (data.type === 'payingTax' && this.isActive()) {
          if (data.activePlayer !== data.ownerName) {
            const delay = (data.boneOne + data.boneTwo) * 100 + 2000;
            setTimeout(() => {
              this.board.fieldCenter.renderPayPopUp(
                data,
                this.players.rerenderMoney.bind(this.players, data.players),
              );
            }, delay);
          } else {
            console.log(data.activePlayer, ' stepped on his cell');
            setTimeout(() => {
              ws.send(
                JSON.stringify({
                  event: 'stepend',
                  payload: {
                    gameId: this.gameInfo.gameId,
                    nickname: this.name,
                  },
                }),
              );
            }, 3000);
          }
        }

        // temp (add temp second condition)
        if (this.isActive() && data.type === 'next') {
          setTimeout(() => {
            ws.send(
              JSON.stringify({
                event: 'stepend',
                payload: {
                  gameId: this.gameInfo.gameId,
                  nickname: this.name,
                },
              }),
            );
          }, 3000);
        }
        // temp
      } else if (res.event === 'startStep') {
        this.gameInfo.activePlayer = res.payload.activePlayer;
        this.players.showCurrentPlayer(this.gameInfo.activePlayer);
        this.activePlayerStartStep();
      } else if (res.event === 'chatMessage') {
        const info = res.payload;
        const messageHTML = createChatMessage(
          info.color,
          info.nickname,
          info.message,
        );
        this.board.fieldCenter.addMessage(messageHTML);
      }
    });
  }
  throwDicesAndMove(data: any) {
    const color = this.getActiveColor();

    const dice = [data.boneOne, data.boneTwo];
    this.board.fieldCenter.rollDiceAnimation(dice);
    const messageHTML = createMessageThrow(
      color,
      this.gameInfo.activePlayer,
      dice,
    );
    this.board.fieldCenter.addMessage(messageHTML);
    setTimeout(() => {
      this.board.moveTokens(this.gameInfo);
    }, 1200);
  }

  buyFactory(data: any) {
    const color = this.getActiveColor();
    const message = createBuyMessage(color, data.activePlayer, data.buying);
    this.board.fieldCenter.addMessage(message);

    const id = allCells.find((el) => el.name === data.buying)?.id;

    const elem = document.getElementById(String(id));
    if (elem) {
      elem.style.backgroundColor = Colors[color as keyof typeof Colors];
    }
    this.players.rerenderMoney(data.players);

    if (this.isActive()) {
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
  getActiveColor() {
    return (
      this.gameInfo.players.find(
        (el) => el.nickname === this.gameInfo.activePlayer,
      )?.color || 'white'
    );
  }
}

export default Game;
