import Control from '../../../common/common';
import { PlayerInGame } from '../../types/game';

class PlayersCard {
  container: Control;
  player: PlayerInGame;

  constructor(parent: HTMLElement, player: PlayerInGame) {
    this.container = new Control(parent, 'div', 'players-card');
    this.player = player;
    this.render();
  }

  render() {
    this.container.node.id = `card-${this.player.nickname}`;
    this.container.node.style.border = `2px solid ${this.player.color}`;
    new Control(
      this.container.node,
      'div',
      'players-card__nick',
      this.player.nickname,
    );
    new Control(this.container.node, 'div', 'players-card__money', '10000$');
    new Control(this.container.node, 'div', 'players-card__timer');
  }
}

export default PlayersCard;
