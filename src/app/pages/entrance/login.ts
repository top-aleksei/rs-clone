import Control from '../../../common/common';
import { authorization } from '../../controller/entrance';
import { clearInRoomLS, setNameLS } from '../../localStorage/localStorage';
import { User } from '../../types/entrance';

class LogIn {
  container: Control;
  form: Control;
  label: Control;
  backFunction: () => void;

  constructor(parent: HTMLElement, back: () => void) {
    this.container = new Control(parent, 'div', 'entrance__container');
    this.backFunction = back;
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
    inputPassword.node.setAttribute('autocomplete', 'on');
    (inputPassword.node as HTMLInputElement).type = 'password';

    new Control(this.form.node, 'button', 'entrance__button', 'Log in');
    this.addListeners();
  }
  addListeners() {
    this.form.node.onsubmit = async (e) => {
      e.preventDefault();
      this.label.node.textContent = '';
      const formData = new FormData(this.form.node as HTMLFormElement);
      const name = formData.get('name');
      const password = formData.get('password');
      if (!name || !password) {
        this.label.node.textContent = 'Fill in all the fields';
        return;
      }

      const data = { name, password } as User;
      const res = await authorization(data);
      if (res.status === 200) {
        setNameLS(name as string);
        clearInRoomLS();
        this.backFunction();
      } else if (res.values === 'User not found') {
        this.label.node.textContent = `User '${name}' was not found`;
      } else if (res.values === 'Wrong password') {
        this.label.node.textContent = res.values;
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
}

export default LogIn;
