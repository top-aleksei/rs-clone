import Control from '../../../common/common';
import { PlayerInGame } from '../../types/game';

class PlayersToken {
  container: Control;
  player: PlayerInGame;

  constructor(parent: HTMLElement, player: PlayerInGame) {
    this.container = new Control(parent, 'div', 'players-token');
    this.player = player;
    this.render();
  }

  render() {
    this.container.node.id = `token-${this.player.nickname}`;
    this.container.node.style.background = `${this.player.color}`;
    // new Control(
    //   this.container.node,
    //   'div',
    //   'players-token__nick',
    //   this.player.nickname,
    // );
    // new Control(this.container.node, 'div', 'players-card__money', '10000$');
    // new Control(this.container.node, 'div', 'players-card__timer');
  }
}

export default PlayersToken;
