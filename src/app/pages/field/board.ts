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

  drawCornerCells(source: string) {
    //new CornerCell(this.fieldContainer.node, source, );
  }

  drawCells(widthCell: number, heightCell: number) {
    new Cell(this.fieldContainer.node, widthCell, heightCell, '');
  }


  render() {    
    new CornerCell(this.fieldContainer.node, '', 'corner-one');
    for (let i = 0; i < 9; i++) {  
      this.drawCells(55, 100);    
    }
    new CornerCell(this.fieldContainer.node, '', 'corner-two');

    for (let i = 0; i < 9; i++) {
      this.drawCells(100, 55);
    }

    new CornerCell(this.fieldContainer.node, '', 'corner-three');
    for (let i = 0; i < 9; i++) {
      this.drawCells(55, 100);
    }
    new CornerCell(this.fieldContainer.node, '', 'corner-four');

    for (let i = 0; i < 9; i++) {
      this.drawCells(100, 55);
    }
    //new Control(this.container.node, 'div', 'board__fields');
    new Control(this.container.node, 'div', 'board__center');
    //new Control(this.container.node, 'div', 'board__tokens');
    
  }
}

export default Board;
