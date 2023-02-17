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
  board: Board;
  players: Players;
  gameInfo: GameInfo;
  name: string;

  constructor(parent: HTMLElement, gameInfo: GameInfo) {
    this.name = getNameLS() || '';
    this.container = new Control(parent, 'div', 'game');
    this.table = new Control(parent, 'div', 'table');
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
          this.moveTokens(
            <HTMLElement>activeToken,
            currentPosition,
            nextPosition,
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

  moveTokens(token: HTMLElement, currentPos: number, nextPos: number) {
    const commonPosition = this.gameInfo.players.filter(
      (el) => el.position === nextPos,
    );
    let animationTopId: number;
    let animationBottomId: number;
    let animationRightId: number;
    let animationLeftId: number;

    let posTopLine = currentPos;
    let posRightLine = 1;
    let posBottomLine = 1;
    let posLeftLine = 1;

    const centreAngle = 645;
    const duration = 0.1;

    function animationTopLine() {
      posTopLine += duration;

      token.style.bottom = 'auto';
      token.style.right = 'auto';
      token.style.left = 55 * posTopLine + 'px';
      if (commonPosition.length === 2) {
        token.style.top = '55px';
      } else if (commonPosition.length === 3) {
        token.style.top = '15px';
      } else if (commonPosition.length === 4) {
        token.style.top = '5px';
      } else {
        token.style.top = '35px';
      }

      if (posTopLine < nextPos) {
        animationTopId = requestAnimationFrame(animationTopLine);
      }

      let posTokenLeft = parseInt(token.style.left);
      if (posTokenLeft > centreAngle) {
        cancelAnimationFrame(animationTopId);
        animationRightId = requestAnimationFrame(animationRightLine);
      }
    }

    function animationRightLine() {
      posRightLine += duration;

      token.style.top = 55 * posRightLine + 'px';
      token.style.left = 'auto';
      token.style.right = '35px';
      token.style.bottom = 'auto';

      if (posRightLine < nextPos - 10) {
        animationRightId = requestAnimationFrame(animationRightLine);
      }

      let posTokenTop = parseInt(token.style.top);
      if (posTokenTop > centreAngle) {
        cancelAnimationFrame(animationRightId);
        animationBottomId = requestAnimationFrame(animationBottomLine);
      }
    }

    function animationBottomLine() {
      posBottomLine += duration;

      token.style.left = 'auto';
      token.style.right = 55 * posBottomLine + 'px';
      token.style.top = 'auto';
      token.style.bottom = '35px';

      if (posBottomLine < nextPos - 20) {
        animationBottomId = requestAnimationFrame(animationBottomLine);
      }

      let posTokenRight = parseInt(token.style.right);
      if (posTokenRight > centreAngle) {
        cancelAnimationFrame(animationBottomId);
        animationLeftId = requestAnimationFrame(animationLeftLine);
      }
    }

    function animationLeftLine() {
      posLeftLine += duration;

      token.style.top = 'auto';
      token.style.left = '35px';
      token.style.right = 'auto';
      token.style.bottom = 55 * posLeftLine + 'px';
      if (posLeftLine < nextPos - 30) {
        animationLeftId = requestAnimationFrame(animationLeftLine);
      }

      let posTokenBottom = parseInt(token.style.bottom);
      if (posTokenBottom > 620) {
        cancelAnimationFrame(animationLeftId);
        animationTopId = requestAnimationFrame(animationTopLine);
      }
    }

    if (currentPos < 11) {
      animationTopId = requestAnimationFrame(animationTopLine);
    }
    if (currentPos >= 11 && currentPos < 21) {
      posRightLine = currentPos - 10;
      animationRightId = requestAnimationFrame(animationRightLine);
    }
    if (currentPos >= 21 && currentPos < 31) {
      posBottomLine = currentPos - 20;
      animationBottomId = requestAnimationFrame(animationBottomLine);
    }
    if (currentPos >= 31) {
      posLeftLine = currentPos - 30;
      animationLeftId = requestAnimationFrame(animationLeftLine);
    }
  }
}

export default Game;
