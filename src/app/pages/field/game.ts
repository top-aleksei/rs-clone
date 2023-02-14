import Control from '../../../common/common';
import { ws } from '../../controller/socket';
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
    this.addWsLitener();
  }

  render() {
    const table = new Control(this.container.node, 'div', 'table');
    new Players(table.node, this.gameInfo);
    const bord = new Board(table.node, this.gameInfo);
    bord.render();
    if (this.name === this.gameInfo.activePlayer) {
      bord.renderThrowDicePopup();
    }
  }

  addWsLitener() {
    ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data);
      if (res.event === 'stepping') {
        const data = res.payload;
        const info = {
          gameId: data.gameId,
          activePlayer: data.activePlayer,
          type: data.type,
          players: data.players,
        };
        const dice = [data.boneOne, data.boneTwo];
        this.gameInfo = info;
        console.log(this.gameInfo.activePlayer, 'выбросил', dice);
        // temp
        if (this.name === this.gameInfo.activePlayer) {
          ws.send(
            JSON.stringify({
              event: 'stepend',
              payload: {
                gameId: this.gameInfo.gameId,
                nickname: this.gameInfo.activePlayer,
              },
            }),
          );
        }
        // temp
      }
    });
  }
}

export default Game;
