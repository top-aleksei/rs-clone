import Control from '../../../common/common';

class CornerCell {
  container: Control;

  constructor(parent: HTMLElement, classCard: string, id: string) {
    this.container = new Control(parent, 'div', `corner-card ${classCard}`);
    (<HTMLElement>this.container.node).id = id;
    this.render();
  }

  render() {
    //(<HTMLImageElement>this.container.node).style.background = `url(${this.imageSrc})`;    
  }
}

export default CornerCell;
