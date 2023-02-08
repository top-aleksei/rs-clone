/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
import Control from '../../../common/common';
import { createUser } from '../../controller/entrance';
import { User } from '../../types/entrance';

class Registrate {
  container: Control;
  form: Control;
  label: Control;
  backFunction: () => void;
  renderLogIn: () => void;

  constructor(parent: HTMLElement, back: () => void, renderLogIn: () => void) {
    this.container = new Control(parent, 'div', 'entrance__container');
    this.backFunction = back;
    this.renderLogIn = renderLogIn;

    this.createBackBTN();
    this.form = new Control(this.container.node, 'form', 'entrance__form');
    this.label = new Control(
      this.container.node,
      'div',
      'entrance__description',
    );
  }

  render() {
    new Control(this.form.node, 'label', 'entrance__label', 'Name:');
    const inputName = new Control(this.form.node, 'input', 'entrance__input');
    inputName.node.setAttribute('name', 'name');
    (inputName.node as HTMLInputElement).type = 'text';

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

    const submitBTN = new Control(
      this.form.node,
      'input',
      'entrance__button',
      'registrate',
    );
    (submitBTN.node as HTMLInputElement).type = 'submit';
    (submitBTN.node as HTMLInputElement).value = 'registrate';
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
      const res = await createUser(data);
      if (res.status === 200) {
        this.label.node.textContent = `User ${name} was created. You can log in now`;
        this.createLogInBTN();
        (e.target as HTMLFormElement).reset();
        this.disableForm();
      } else if (res.values === 'EXIST') {
        this.label.node.textContent = 'This name already use someone else';
      }
    };
  }

  createBackBTN() {
    const backBTN = new Control(
      this.container.node,
      'button',
      'entrance__button',
      'back',
    );

    backBTN.node.onclick = this.backFunction;
  }

  createLogInBTN() {
    const logInBTN = new Control(
      this.container.node,
      'button',
      'entrance__button',
      'Log in',
    );
    logInBTN.node.onclick = this.renderLogIn;
  }

  disableForm() {
    const elements = [...this.form.node.children];
    elements.forEach((el) =>
      (el as HTMLElement).setAttribute('disabled', 'true'),
    );
  }
}
export default Registrate;
