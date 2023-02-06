import Control from '../../../common/common';
import PlayersCard from './player-card';

const tempPlayers = [
  { id: 1, name: 'Leha', bank: 10000 },
  { id: 2, name: 'Nike', bank: 10000 },
  { id: 3, name: 'Poznerrr', bank: 10000 },
];

class Players {
  container: Control;

  constructor(parent: HTMLElement) {
    this.container = new Control(parent, 'div', 'players');
    this.render();
  }

  render() {
    tempPlayers.forEach((el) => new PlayersCard(this.container.node, el));
  }
}

export default Players;
