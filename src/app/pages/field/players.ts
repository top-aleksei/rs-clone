import Control from '../../../common/common';
import state from '../../../common/state';
import { GameInfo, Player } from '../../types/game';
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
    this.showCurrentPlayer();
  }

  showCurrentPlayer() {
    const { activePlayer } = state;
    const players = this.container.node.children;
    [...players].forEach((el) => {
      if (el.id === `card-${activePlayer}`) {
        el.classList.add('players-card_active');
      } else {
        el.classList.remove('players-card_active');
      }
    });
  }

  rerenderMoney(players: Player[]) {
    const playersDOM = this.container.node.children;
    players.forEach((player) => {
      const curPlayer = [...playersDOM].find(
        (el) => el.id === `card-${player.nickname}`,
      ) as HTMLElement;
      curPlayer.children[1].textContent = `${player.money}$`;
    });
  }

  renderBankrupt(name: string) {
    const playersDOM = this.container.node.children;

    const bankrupt = [...playersDOM].find(
      (el) => el.id === `card-${name}`,
    ) as HTMLElement;
    bankrupt.style.opacity = '0.3';
    bankrupt.children[1].textContent = 'BANCKRUPT';
  }
}

export default Players;
