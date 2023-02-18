//import { Player } from './../../types/game';
import Control from '../../../common/common';
import { createChatMessage, createMessageThrow } from '../../controller/chat';
import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import { GameInfo } from '../../types/game';
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
    if (this.name === this.gameInfo.activePlayer) {
      this.board.fieldCenter.renderThrowDicePopup();
    }
  }

  addWsLitener() {
    ws.addEventListener('message', (e) => {
      // replace
      const currentPosition =
        this.gameInfo.players.find(
          (el) => el.nickname === this.gameInfo.activePlayer,
        )?.position || 1;
      // replace

      const res = JSON.parse(e.data);
      if (res.event === 'stepping') {
        const data = res.payload;
        const info: GameInfo = {
          gameId: data.gameId,
          activePlayer: data.activePlayer,
          type: data.type,
          players: data.players,
        };

        this.gameInfo = info;

        const color =
          info.players.find((el) => el.nickname === info.activePlayer)?.color ||
          'white';
        const nextPosition =
          info.players.find((el) => el.nickname === info.activePlayer)
            ?.position || 1;
        
        const activeToken = document.getElementById(
          `token-${this.gameInfo.activePlayer}`,
        );
        if (data.type !== 'buying') {
          const dice = [data.boneOne, data.boneTwo];
          this.board.fieldCenter.rollDiceAnimation(dice);
          const messageHTML = createMessageThrow(
            color,
            info.activePlayer,
            dice,
          );
          this.board.fieldCenter.addMessage(messageHTML);
        }
        // TEMP. REPLACE. BUY
        if (
          data.type === 'abilityToByu' &&
          this.name === this.gameInfo.activePlayer
        ) {
          const name = data.buildName;
          const cost = data.buildCost;
          this.board.fieldCenter.renderBuyPopUp(name, cost);
        }
        // TEMP. REPLACE. BUY

        setTimeout(() => {
          this.board.moveTokens(
            <HTMLElement>activeToken,
            currentPosition, 
            nextPosition
          );
        }, 2000);

        // temp (add temp second condition)
        if (this.name === this.gameInfo.activePlayer && data.type === 'next') {
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

}

export default Game;
