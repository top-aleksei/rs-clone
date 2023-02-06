import Control from '../../../common/common';

class Board {
  container: Control;

  constructor(parent: HTMLElement) {
    this.container = new Control(parent, 'div', 'board');
    this.render();
  }

  render() {
    new Control(this.container.node, 'div', 'board__fields');
    new Control(this.container.node, 'div', 'board__center');
    new Control(this.container.node, 'div', 'board__tokens');
  }
}

export default Board;
