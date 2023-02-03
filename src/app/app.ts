import Entrance from './pages/entrance/entrance';

class App {
  container: Entrance;
  constructor() {
    this.container = new Entrance(document.body);
  }

  run() {
    this.container.render();
  }
}

export default App;
