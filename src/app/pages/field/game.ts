import Control from '../../../common/common';
import Board from './board';
import Players from './players';

class Game {
  container: Control;

  constructor(parent: HTMLElement) {
    this.container = new Control(parent, 'div', 'game');
  }

  render() {
    const table = new Control(this.container.node, 'div', 'table');
    new Players(table.node);
    new Board(table.node);
  }
}

export default Game;
