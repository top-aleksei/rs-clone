import Control from '../../../common/common';
import { clearNameLS, getNameLS } from '../../localStorage/localStorage';
import Games from './games';

class UserPage {
  container: Control;
  startPage: () => void;

  constructor(parent: HTMLElement, startPage: () => void) {
    this.container = new Control(parent, 'div', 'user-page');
    this.startPage = startPage;
  }

  render() {
    const name = getNameLS() || '';
    new Control(this.container.node, 'h2', 'user-page__title', 'Home page');
    const info = new Control(this.container.node, 'div', 'user-page__info');
    new Control(info.node, 'div', 'user-page__img');
    new Control(info.node, 'p', 'user-page__name', name);
    this.renderGamesList();
    this.createLogOut();
  }

  renderGamesList() {
    new Games(this.container.node);
  }

  createLogOut() {
    const backBTN = new Control(
      this.container.node,
      'button',
      'entrance__button',
      'Log out',
    );

    backBTN.node.onclick = () => {
      clearNameLS();
      this.startPage();
    };
  }
}

export default UserPage;
