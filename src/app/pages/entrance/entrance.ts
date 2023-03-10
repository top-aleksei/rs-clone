import Control from '../../../common/common';
import { getNameLS } from '../../localStorage/localStorage';
import UserPage from '../userPage/userPage';
import LogIn from './login';
import Registrate from './registrate';

class Entrance {
  container: Control;
  bg: Control;
  btns: Control;

  constructor(parent: HTMLElement) {
    this.container = new Control(parent, 'div', 'entrance');
    this.bg = new Control(this.container.node, 'div', 'entrance__bg');
    this.btns = new Control(this.bg.node, 'div', 'entrance__frame');
    window.addEventListener('resize', this.resizeEntrance);
    this.resizeEntrance();
  }

  render() {
    this.btns.node.innerHTML = '';
    const name = getNameLS();
    if (name) {
      const page = new UserPage(this.btns.node, this.render.bind(this));
      page.render();
    } else {
      new Control(this.btns.node, 'div', 'entrance__sign');
      new Control(
        this.btns.node,
        'button',
        'entrance__btn registrate',
        'REGISTRATE',
      );
      new Control(this.btns.node, 'button', 'entrance__btn login', 'LOGIN');
      new Control(this.btns.node, 'div', 'entrance__author');

      this.addListenrs();
      this.renderAuthor();
    }
  }

  addListenrs() {
    this.btns.node.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).textContent;
      const btns = ['LOGIN', 'REGISTRATE'];
      if (target && btns.includes(target)) {
        this.btns.node.innerHTML = '';
        if (target === btns[0]) {
          this.showLogIn();
        } else if (target === btns[1]) {
          this.showRegistrate();
        }
      }
    });
  }

  showLogIn() {
    this.btns.node.innerHTML = '';
    const log = new LogIn(this.btns.node, this.render.bind(this));
    log.render();
  }

  showRegistrate() {
    this.btns.node.innerHTML = '';
    const reg = new Registrate(
      this.btns.node,
      this.render.bind(this),
      this.showLogIn.bind(this),
    );
    reg.render();
  }

  renderAuthor() {
    const authorsBlock = document.querySelector('.entrance__author');
    (<HTMLElement>authorsBlock).innerHTML = `
    <div class="authors">
      <a href="https://github.com/top-aleksei">top-aleksei | </a>
      <a href="https://github.com/poznerrr">poznerrr | </a>
      <a href="https://github.com/nike93">nike93</a>
    </div>
    <div class="year">2023
    </div>
    <div class="rs-link">
      <a href="https://rs.school/js/"><img src="https://rollingscopes.com/images/logo_rs_text.svg"></a>
    </div>
    `;
  }

  resizeEntrance () {
    const entranceContainer = document.querySelector('.entrance');
    const maxWidthBoard = 747;
    const maxHeigthBoard = 747;
    const scaleValue = Math.min(
      window.innerWidth / maxWidthBoard,
      window.innerHeight / maxHeigthBoard,
    );
    if (<HTMLElement>entranceContainer) {
      (<HTMLElement>entranceContainer).style.transform = `scale(${scaleValue})`;
    }
  }
}

export default Entrance;
