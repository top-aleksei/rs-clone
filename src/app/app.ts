import Entrance from './pages/entrance/entrance';
// import Game from './pages/field/game';

class App {
  container: Entrance;
  // container: Game;
  constructor() {
    this.container = new Entrance(document.body);
    // this.container = new Game(document.body);
  }

  run() {
    this.container.render();
  }
}

export default App;
