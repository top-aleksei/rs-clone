import Control from '../../../common/common';

class Cell {
  container: Control;
  imageCard: Control;
  costCard: Control;
  cardWidth: number;
  cardHeight: number;
  id: number;

  constructor(parent: HTMLElement, cardWidth: number, cardHeight:number, id: number) {
    this.container = new Control(parent, 'div', 'card');
    this.imageCard = new Control(this.container.node, 'div', 'card__img');
    this.costCard = new Control(this.container.node, 'div', 'card__cost');
    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;
    this.id = id;
    this.render();
  }

  render() {
    (<HTMLImageElement>this.container.node).style.width = `${this.cardWidth}px`;
    (<HTMLImageElement>this.container.node).style.height = `${this.cardHeight}px`;
    (<HTMLImageElement>this.container.node).id = `${this.id}`;

    if ((this.id > 1 && this.id < 11) || (this.id > 21 && this.id < 32)) {
      (<HTMLImageElement>this.costCard.node).style.width = `${this.cardWidth - 2}px`;
      (<HTMLImageElement>this.costCard.node).style.height = `${this.cardHeight / 4}px`;
    } else {
      (<HTMLImageElement>this.costCard.node).style.width = `${this.cardWidth / 4}px`;
      (<HTMLImageElement>this.costCard.node).style.height = `${this.cardHeight - 2}px`;
    }
    
    (<HTMLImageElement>this.costCard.node).id = `cost-${this.id}`;

  }
}

export default Cell;
