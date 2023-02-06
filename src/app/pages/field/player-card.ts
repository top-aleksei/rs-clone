import Control from '../../../common/common';
import { Player } from '../../types/game';

class PlayersCard {
  container: Control;
  player: Player;

  constructor(parent: HTMLElement, player: Player) {
    this.container = new Control(parent, 'div', 'players-card');
    this.player = player;
    this.render();
  }

  render() {
    new Control(
      this.container.node,
      'div',
      'players-card__nick',
      this.player.name,
    );
    new Control(
      this.container.node,
      'div',
      'players-card__money',
      String(this.player.bank),
    );
    new Control(this.container.node, 'div', 'players-card__timer');
  }
}

export default PlayersCard;
