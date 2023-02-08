import Control from '../../../common/common';

class Cell {
  container: Control;
  //imageCell: Control;
  imageSrc: string;
  cardWidth: number;
  cardHeight: number;

  constructor(parent: HTMLElement, cardWidth: number, cardHeight:number, imageSrc: string) {
    this.container = new Control(parent, 'div', 'card');
    //this.imageCell = new Control(this.container.node, 'img', 'card__img');
    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;
    this.imageSrc = imageSrc;
    this.render();
  }

  render() {
    (<HTMLImageElement>this.container.node).style.width = `${this.cardWidth}px`;
    (<HTMLImageElement>this.container.node).style.height = `${this.cardHeight}px`;
  }
}

export default Cell;
