import Control from '../../../common/common';

class CornerCell {
  container: Control;
  //imageCell: Control;

  constructor(parent: HTMLElement, imageSrc: string, classCard: string) {
    this.container = new Control(parent, 'div', `corner-card ${classCard}`);
    //this.imageCell = new Control(this.container.node, 'img', 'corner-card__img');
    this.render();
  }

  render() {
    //(<HTMLImageElement>this.container.node).style.background = `url(${this.imageSrc})`;    
  }
}

export default CornerCell;
