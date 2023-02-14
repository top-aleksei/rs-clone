import Control from '../../../common/common';
import { getNameLS } from '../../localStorage/localStorage';
import { GameInfo } from '../../types/game';
import Board from './board';
import Players from './players';

class Game {
  container: Control;
  gameInfo: GameInfo;
  name: string;

  constructor(parent: HTMLElement, gameInfo: GameInfo) {
    this.container = new Control(parent, 'div', 'game');
    this.gameInfo = gameInfo;
    this.name = getNameLS() || '';
  }

  render() {
    const table = new Control(this.container.node, 'div', 'table');
    new Players(table.node, this.gameInfo);
    const bord = new Board(table.node, this.gameInfo);
    bord.render();
    if (this.name === this.gameInfo.activePlayer) {
      bord.renderThrowDicePopup();
    }
    console.log(this.gameInfo.players)
  }
}

export default Game;
