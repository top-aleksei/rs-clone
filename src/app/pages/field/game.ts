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
  }

  moveTokens(token: HTMLElement, currentPos: number, nextPos: number) {     
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

    // const nextCell = document.getElementById(`${nextPos}`);
    // const cellWidth = (<HTMLElement>nextCell).offsetWidth;
    // const cellHeight = (<HTMLElement>nextCell).offsetHeight;

    function animationTopLine() {
      posTopLine += duration;
              
      token.style.top = '35px';
      token.style.bottom = 'auto';
      token.style.right = 'auto';
      token.style.left = 55 * posTopLine + 'px';      
      
      if (posTopLine < nextPos) {
        animationTopId = requestAnimationFrame(animationTopLine);
      }
      
      let posTokenLeft = parseInt(token.style.left);
      console.log(posTokenLeft)  
      if(posTokenLeft > centreAngle) {
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
      if(posTokenTop > centreAngle) {
        cancelAnimationFrame(animationRightId);
        animationBottomId = requestAnimationFrame(animationBottomLine);
      }
    }
    
    function animationBottomLine() {
      posBottomLine += duration;
      
      //let posTokenLeftStart = token.offsetLeft;      
      let posTokenRight = parseInt(token.style.right);      
      token.style.left = 'auto';
      token.style.right = 55 * posBottomLine + 'px';
      token.style.top = 'auto';   
      token.style.bottom = '30px';

      if (posBottomLine < nextPos - 20) {
        animationBottomId = requestAnimationFrame(animationBottomLine);
      }
      if(posTokenRight > centreAngle) {
        cancelAnimationFrame(animationBottomId);
        animationLeftId = requestAnimationFrame(animationLeftLine);
      }
    }

    
    function animationLeftLine() {
      posLeftLine += duration;
      
      //let posTokenLeftStart = token.offsetLeft;      
      let posTokenBottom = parseInt(token.style.bottom);      
      token.style.top = 'auto';
      token.style.left = '30px';
      token.style.right = 'auto';      
      token.style.bottom = 55 * posLeftLine + 'px';  
      if (posLeftLine < nextPos - 30) {
        animationLeftId = requestAnimationFrame(animationLeftLine);
      }
      if(posTokenBottom > 620) {
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
        
        setTimeout(()=> {
          this.moveTokens(<HTMLElement>activeToken, currentPosition, nextPosition)
        }, 2000);
        
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
