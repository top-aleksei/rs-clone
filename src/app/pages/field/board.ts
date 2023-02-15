import Control from '../../../common/common';
import CornerCell from './corner-cell';
import Cell from './cell';
import { GameInfo } from '../../types/game';
// import { ws } from '../../controller/socket';
import { getNameLS } from '../../localStorage/localStorage';
import CenterItem from './centerItem';

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
    // this.fieldCenter = new Control(this.container.node, 'div', 'board__center');
    this.fieldCenter = new CenterItem(this.container.node, this.gameInfo);
    this.render();
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
    // new Control(this.container.node, 'div', 'board__fields');
    // new Control(this.container.node, 'div', 'board__center');
    // new Control(this.container.node, 'div', 'board__tokens');
  }
  // renderThrowDicePopup() {
  //   const container = new Control(this.fieldCenter.node, 'div', 'popup');
  //   const rollButton = new Control(container.node, 'div', 'popup__roll');
  //   rollButton.node.onclick = () => {
  //     const data = {
  //       event: 'step',
  //       payload: {
  //         gameId: this.gameInfo.gameId,
  //         nickname: this.name,
  //       },
  //     };
  //     ws.send(JSON.stringify(data));
  //     container.destroy();
  //   };
  // }
}

export default Board;
