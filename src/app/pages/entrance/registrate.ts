import Control from '../../../common/common';
import { createUser } from '../../controller/entrance';
import { User } from '../../types/entrance';

class Registrate {
  container: Control;
  form: Control;
  backBTN: Control;
  label: Control;
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
    this.label = new Control(
      this.container.node,
      'div',
      'entrance__discription',
    );
  }

  render() {
    new Control(this.form.node, 'label', 'entrance__label', 'Name:');
    const inputName = new Control(this.form.node, 'input', 'entrance__input');
    inputName.node.setAttribute('name', 'name');

    new Control(this.form.node, 'label', 'entrance__label', 'Password:');
    const inputPassword = new Control(
      this.form.node,
      'input',
      'entrance__input',
    );
    inputPassword.node.setAttribute('name', 'password');

    new Control(this.form.node, 'label', 'entrance__label', 'Repeat password:');
    const repeatPassword = new Control(
      this.form.node,
      'input',
      'entrance__input',
    );
    repeatPassword.node.setAttribute('name', 'repeatPassword');

    new Control(this.form.node, 'button', 'entrance__button', 'registrate');
    this.addListeners();
  }
  addListeners() {
    this.form.node.onsubmit = async (e) => {
      e.preventDefault();
      this.label.node.textContent = '';
      const formData = new FormData(this.form.node as HTMLFormElement);
      const name = formData.get('name');
      const password = formData.get('password');
      const repeatPassword = formData.get('repeatPassword');
      if (!name || !password || !repeatPassword) {
        this.label.node.textContent = 'Fill in all the fields';
        return;
      }
      if (password !== repeatPassword) {
        this.label.node.textContent = 'Type the same password';
        return;
      }

      const data = { name, password } as User;
      // try {
      await createUser(data);
      console.log('cool');
      // } catch {
      //   throw new Error('hui');
      // }
    };

    this.backBTN.node.onclick = () => {
      this.container.destroy();
      this.backFunction();
    };
  }
}

export default Registrate;
