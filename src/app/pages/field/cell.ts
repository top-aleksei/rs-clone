/* eslint-disable @typescript-eslint/keyword-spacing */
import { allCells } from './cellsInfo';
import Control from '../../../common/common';
import { Factory, GameInfo } from '../../types/game';

class Cell {
  container: Control;
  imageCard: Control;
  costCard: Control;
  costCardText: Control;
  cardWidth: number;
  cardHeight: number;
  id: number;
  factoryInfo: Factory | undefined;
  gameInfo: GameInfo;

  constructor(
    parent: HTMLElement,
    cardWidth: number,
    cardHeight: number,
    id: number,
    gameInfo: GameInfo,
  ) {
    this.container = new Control(parent, 'div', 'card');
    this.imageCard = new Control(this.container.node, 'div', 'card__img');
    this.costCard = new Control(this.container.node, 'div', 'card__cost');
    this.costCardText = new Control(this.costCard.node, 'div', 'card__cost-text');
    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;
    this.id = id;
    this.gameInfo = gameInfo;
    this.factoryInfo = allCells.find((el) => el.id === id);
    this.render();
  }

  render() {
    (<HTMLImageElement>this.container.node).style.width = `${this.cardWidth}px`;
    (<HTMLImageElement>(
      this.container.node
    )).style.height = `${this.cardHeight}px`;
    (<HTMLImageElement>this.container.node).id = `${this.id}`;

    if ((this.id > 1 && this.id < 11) || (this.id > 21 && this.id < 32)) {
      (<HTMLImageElement>this.costCard.node).style.width = `${
        this.cardWidth - 2
      }px`;
      (<HTMLImageElement>this.costCard.node).style.height = `${
        this.cardHeight / 4
      }px`;
    } else {
      (<HTMLImageElement>this.costCard.node).style.width = `${
        this.cardWidth / 4
      }px`;
      (<HTMLImageElement>this.costCard.node).style.height = `${
        this.cardHeight - 2
      }px`;
    }

    (<HTMLImageElement>this.costCard.node).id = `cost-${this.id}`;

    (<HTMLImageElement>this.costCardText.node).innerText = `${this.factoryInfo?.costBuy}$`;

    this.container.node.addEventListener('click', (e) =>
      this.renderFactoryPopUp(e),
    );
  }

  renderFactoryPopUp(event: Event) {
    const openEl = (event.target as HTMLElement).closest('.factory');
    if (openEl) {
      return;
    }
    if (this.factoryInfo?.type !== 'build' && (event.target as HTMLElement).closest('.card')) {
      this.removePopUp();
      return;
    }

    this.removePopUp();

    const wrapper = new Control(this.container.node, 'div', 'factory');
    wrapper.node.id = `f${this.id}`;
    new Control(wrapper.node, 'p', 'factory__title', this.factoryInfo?.name);
    const ownerText = this.factoryInfo?.owner
      ? `Owner: ${this.factoryInfo?.owner}`
      : 'no one owns it';
    new Control(wrapper.node, 'p', 'factory__subtitle', ownerText);
    const boardWrap = document.querySelector('.wrapper');
    (boardWrap as HTMLElement).onclick = (e) => {
      const el = (e.target as HTMLElement).closest('.card');
      if (el && +el.id === this.id) {
        //console.log(el);
      } else {
        wrapper.destroy();
        (boardWrap as HTMLElement).onclick = () => {};
      }
    };
    if (this.id >= 12 && this.id <= 20) {
      wrapper.node.style.right = '0px';
    }
  }

  removePopUp() {
    const allMenu = document.querySelectorAll('.factory');
    allMenu.forEach((el) => el.remove());
  }
}

export default Cell;