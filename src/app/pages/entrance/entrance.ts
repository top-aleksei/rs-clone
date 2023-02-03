import Control from '../../../common/common';
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
  }

  render() {
    new Control(this.btns.node, 'div', 'entrance__sign');
    new Control(
      this.btns.node,
      'button',
      'entrance__btn registrate',
      'REGISTRATE',
    );
    new Control(this.btns.node, 'button', 'entrance__btn login', 'LOGIN');

    this.addListenrs();
  }

  addListenrs() {
    this.btns.node.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).textContent;
      const btns = ['LOGIN', 'REGISTRATE'];
      if (target && btns.includes(target)) {
        this.btns.node.innerHTML = '';
        if (target === btns[0]) {
          const log = new LogIn(this.btns.node, this.render.bind(this));
          log.render();
        } else if (target === btns[1]) {
          const reg = new Registrate(this.btns.node, this.render.bind(this));
          reg.render();
        }
      }
    });
  }
}

export default Entrance;
