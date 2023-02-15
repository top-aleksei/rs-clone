import Control from '../../../common/common';
import { createMessageThrow } from '../../controller/chat';
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
    // new Players(this.table.node, this.gameInfo);
    // const bord = new Board(table.node, this.gameInfo);
    if (this.name === this.gameInfo.activePlayer) {
      this.board.fieldCenter.renderThrowDicePopup();
    }
    console.log(this.gameInfo.players)
  }

  moveTokens() {    
    // const activeToken = document.getElementById(`token-${this.gameInfo.activePlayer}`);
    // (<HTMLElement>activeToken).style.left = `${55 * this.gameInfo.players[0].position}px`;
  }

  addWsLitener() {
    ws.addEventListener('message', (e) => {
      const currentPosition = 
        this.gameInfo.players.find((el) => el.nickname === this.gameInfo.activePlayer)?.position || 1;
        
      const res = JSON.parse(e.data);
      if (res.event === 'stepping') {
        const data = res.payload;
        const info: GameInfo = {
          gameId: data.gameId,
          activePlayer: data.activePlayer,
          type: data.type,
          players: data.players,
        };
        const dice = [data.boneOne, data.boneTwo];
        this.board.fieldCenter.rollDiceAnimation(dice);
        this.gameInfo = info;

        // eslint-disable-next-line operator-linebreak
        const color =
          // eslint-disable-next-line operator-linebreak
          info.players.find((el) => el.nickname === info.activePlayer)?.color ||
          'white';        

        const nextPosition = 
          info.players.find((el) => el.nickname === info.activePlayer)?.position || 1;
          
        const activeToken = document.getElementById(`token-${this.gameInfo.activePlayer}`);

        let pos = currentPosition;
        let startDate = Date.now();
        function myAnimation() {
          const duration = 0.1;
          pos = pos + duration;
          (<HTMLElement>activeToken).style.left = 55 * pos + 'px';
      
          if (pos < nextPosition) {
              requestAnimationFrame(myAnimation);
          }
        }
        requestAnimationFrame(myAnimation);

        const messageHTML = createMessageThrow(color, info.activePlayer, dice);
        this.board.fieldCenter.addMessage(messageHTML);
        // temp
        if (this.name === this.gameInfo.activePlayer) {
          ws.send(
            JSON.stringify({
              event: 'stepend',
              payload: {
                gameId: this.gameInfo.gameId,
                nickname: this.gameInfo.activePlayer,
              },
            }),
          );
        }
        // temp
      } else if (res.event === 'startStep') {
        this.gameInfo.activePlayer = res.payload.activePlayer;
        this.players.showCurrentPlayer(this.gameInfo.activePlayer);
        this.activePlayerStartStep();
      }
    });
  }
}

export default Game;
