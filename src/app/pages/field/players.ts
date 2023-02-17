import Control from '../../../common/common';
import { GameInfo } from '../../types/game';
import PlayersCard from './player-card';

class Players {
  container: Control;
  gameInfo: GameInfo;

  constructor(parent: HTMLElement, gameInfo: GameInfo) {
    this.container = new Control(parent, 'div', 'players');
    this.gameInfo = gameInfo;
    this.render();
  }

  render() {
    this.gameInfo.players.forEach(
      (el) => new PlayersCard(this.container.node, el),
    );
    this.showCurrentPlayer(this.gameInfo.activePlayer);
  }

  showCurrentPlayer(activePlayer: string) {
    // console.log(this);
    // console.log(this.gameInfo);
    const players = this.container.node.children;
    [...players].forEach((el) => {
      if (el.id === `card-${activePlayer}`) {
        el.classList.add('players-card_active');
      } else {
        el.classList.remove('players-card_active');
      }
    });
  }
}

export default Players;