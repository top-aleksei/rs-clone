import Control from '../../../common/common';
import CornerCell from './corner-cell';
import Cell from './cell';
import { GameInfo } from '../../types/game';
import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import CenterItem from './centerItem';
import PlayersToken from './token';
// const cornerImageSource = ['./assets/img/board/start.png'];

class Board {
  container: Control;
  fieldContainer: Control;
  // fieldCenter: Control;
  fieldCenter: CenterItem;
  gameInfo: GameInfo;
  name: string;

  constructor(parent: HTMLElement, gameInfo: GameInfo) {
    this.name = getNameLS() || '';
    this.container = new Control(parent, 'div', 'board');
    this.gameInfo = gameInfo;
    this.fieldContainer = new Control(
      this.container.node,
      'div',
      'board__fields',
    );
    this.fieldCenter = new CenterItem(this.container.node, this.gameInfo);
    this.render();
    this.changeWindowSize();
  }

  drawCells(widthCell: number, heightCell: number, id: number) {
    new Cell(this.fieldContainer.node, widthCell, heightCell, id);
  }

  render() {
    new CornerCell(this.fieldContainer.node, 'corner-one', '1');
    for (let i = 2; i < 11; i += 1) {
      this.drawCells(55, 100, i);
    }
    new CornerCell(this.fieldContainer.node, 'corner-two', '11');

    for (let i = 12; i < 21; i += 1) {
      this.drawCells(100, 55, i);
    }

    new CornerCell(this.fieldContainer.node, 'corner-three', '21');
    for (let i = 22; i < 31; i += 1) {
      this.drawCells(55, 100, i);
    }
    new CornerCell(this.fieldContainer.node, 'corner-four', '31');

    for (let i = 32; i < 41; i += 1) {
      this.drawCells(100, 55, i);
    }
    this.renderTokens();
  }
  renderTokens() {
    this.gameInfo.players.forEach(
      (el) => new PlayersToken(this.container.node, el),
    );
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
    const commonPosition = 
      this.gameInfo.players.filter((el) => el.position === nextPos);
    console.log(this.gameInfo)

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
      token.style.bottom = 'auto';

      if(commonPosition.length === 2) {
        token.style.right = '55px';
      } else if (commonPosition.length === 3) {
        token.style.right = '15px';
      } else if (commonPosition.length === 4) {
        token.style.right = '5px';
      } else {   
        token.style.right = '35px'; 
      }

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

      if(commonPosition.length === 2) {
        token.style.bottom = '55px';
      } else if (commonPosition.length === 3) {
        token.style.bottom = '15px';
      } else if (commonPosition.length === 4) {
        token.style.bottom = '5px';
      } else {  
        token.style.bottom = '35px'; 
      }

      if (posBottomLine < nextPos - 20) {
        animationBottomId = requestAnimationFrame(animationBottomLine);
      }

      let posTokenRight = parseInt(token.style.right); 
      if(posTokenRight > centreAngle) {
        cancelAnimationFrame(animationBottomId);
        animationLeftId = requestAnimationFrame(animationLeftLine);
      }

    }
    
    function animationLeftLine() {
      posLeftLine += duration;
      
      token.style.top = 'auto';
      token.style.right = 'auto';      
      token.style.bottom = 55 * posLeftLine + 'px';
      if(commonPosition.length === 2) {
        token.style.left = '55px';
      } else if (commonPosition.length === 3) {
        token.style.left = '15px';
      } else if (commonPosition.length === 4) {
        token.style.left = '5px';
      } else {        
        token.style.left = '35px'; 
      }
      if (nextPos > 30 && nextPos <= 40) {
        if (posLeftLine < nextPos - 30) {
          animationLeftId = requestAnimationFrame(animationLeftLine);
        }
      } else if (nextPos < 10) {
        if (posLeftLine < 41) {
          animationLeftId = requestAnimationFrame(animationLeftLine);
        } else {
          cancelAnimationFrame(animationLeftId);
          posTopLine = 1;
          animationTopId = requestAnimationFrame(animationTopLine);
        }
      }
      
      
      let posTokenBottom = parseInt(token.style.bottom);  
      if(posTokenBottom > 620) {
        cancelAnimationFrame(animationLeftId);
        posTopLine = 1;
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

  changeWindowSize () {
    this.resizeBoard();
    window.addEventListener('resize', this.resizeBoard);
  }

  resizeBoard () {
    const area = document.querySelector('.table');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const maxWidthBoard = 1055;
    const maxHeigthBoard = 753;
    const scaleValue = Math.min(
      window.innerWidth / maxWidthBoard,
      window.innerHeight / maxHeigthBoard
    );

    (<HTMLElement>area).style.transform = `scale(${scaleValue})`;    
  }
}

export default Board;
