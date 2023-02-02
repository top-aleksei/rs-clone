import Control from '../../../common/common';

class Registrate {
  container: Control;
  form: Control;
  backBTN: Control;
  backFunction: () => void;

  constructor(parent: HTMLElement, back: () => void) {
    this.container = new Control(parent, 'div', 'entrance__container');
    this.form = new Control(this.container.node, 'form', 'entrance__form');
    this.backFunction = back;
    this.backBTN = new Control(
      this.form.node,
      'button',
      'entrance__button_small',
      'back',
    );
  }

  render() {
    const labelName = new Control(
      this.form.node,
      'label',
      'entrance__label',
      'Name:',
    );
    labelName.node.setAttribute('for', 'name');
    const inputName = new Control(this.form.node, 'input', 'entrance__input');
    inputName.node.id = 'name';

    const labelPassword = new Control(
      this.form.node,
      'label',
      'entrance__label',
      'Password:',
    );
    labelPassword.node.setAttribute('for', 'password');
    const inputPassword = new Control(
      this.form.node,
      'input',
      'entrance__input',
    );
    inputPassword.node.id = 'password';

    new Control(this.form.node, 'button', 'entrance__button', 'registrate');
    this.addListeners();
  }
  addListeners() {
    this.form.node.onsubmit = (e) => e.preventDefault();

    this.backBTN.node.onclick = () => {
      this.container.destroy();
      this.backFunction();
    };
  }
}

export default Registrate;
