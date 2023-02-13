import Control from '../../../common/common';
import CornerCell from './corner-cell';
import Cell from './cell';

const cornerImageSource = [
  './assets/img/board/start.png',
]

class Board {
  container: Control;
  fieldContainer: Control;

  constructor(parent: HTMLElement) {
    this.container = new Control(parent, 'div', 'board');
    this.fieldContainer = new Control(this.container.node, 'div', 'board__fields');
    this.render();
  }

  drawCells(widthCell: number, heightCell: number, id: number) {
    new Cell(this.fieldContainer.node, widthCell, heightCell, id);
  }


  render() {    
    new CornerCell(this.fieldContainer.node, 'corner-one', '1');
    for (let i = 2; i < 11; i++) {  
      this.drawCells(55, 100, i);    
    }
    new CornerCell(this.fieldContainer.node, 'corner-two', '11');

    for (let i = 12; i < 21; i++) {
      this.drawCells(100, 55, i);
    }

    new CornerCell(this.fieldContainer.node, 'corner-three', '21');
    for (let i = 22; i < 31; i++) {
      this.drawCells(55, 100, i);
    }
    new CornerCell(this.fieldContainer.node, 'corner-four', '31');

    for (let i = 32; i < 41; i++) {
      this.drawCells(100, 55, i);
    }
    //new Control(this.container.node, 'div', 'board__fields');
    new Control(this.container.node, 'div', 'board__center');
    //new Control(this.container.node, 'div', 'board__tokens');
    
  }
}

export default Board;
