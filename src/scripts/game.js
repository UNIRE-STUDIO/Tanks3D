import GameLoop from './gameLoop.js'
import Input from './input.js'
import LevelManager from './levelManager.js'
//import SaveManager from './saveManager.js'

export let GameScreens = { MENU: 0, PLAY: 1, PAUSE: 2, WIN: 3, GAMEOVER: 4 }

export default class Game {
    constructor() {
        this.config
        this.uiFields
        this.levelManager

        this.input = new Input()
        this.input.changeScreenEvent = this.changeScreen.bind(this)
    }
    init(config, uiFields) {
        this.uiFields = uiFields
        this.config = config
        // this.saveManager = new SaveManager()
        new GameLoop(this.update.bind(this), this.render.bind(this))
        this.levelManager = new LevelManager(this.input, this.config, uiFields)
        this.levelManager.gameOverEvent = this.changeScreen.bind(this, GameScreens.GAMEOVER)
        this.levelManager.winEvent = this.changeScreen.bind(this, GameScreens.WIN)
        this.levelManager.saveManager = this.saveManager

        //this.changeScreen(4); // Тут можно проверять интерфейс
    }

    // изменить экран игры на указанный + дополнительный параметр для уточнения поведения
    changeScreen(screen, parameter = 0, secondParam = 0) {
        // Если нажата НЕ кнопка назад
        switch (screen) {
            case GameScreens.MENU:
                this.levelManager.reset()
                this.uiFields.currentScreen = GameScreens.MENU
                break
            case GameScreens.PLAY:
                if (parameter === 1) this.levelManager.start(secondParam)
                else if (parameter === 2) this.levelManager.setResume()
                this.uiFields.currentScreen = GameScreens.PLAY
                break
            case GameScreens.PAUSE:
                this.levelManager.setPause();
                this.uiFields.currentScreen = GameScreens.PAUSE;
                break
            case GameScreens.GAMEOVER:
                this.levelManager.setPause();
                this.uiFields.currentScreen = GameScreens.GAMEOVER;
                break
            case GameScreens.WIN:
                this.levelManager.setPause();
                this.uiFields.currentScreen = GameScreens.WIN;
                break
            case -1: // Если нажата кнопка назад
                if (this.uiFields.currentScreen === GameScreens.PAUSE) this.changeScreen(GameScreens.MENU)
                if (this.uiFields.currentScreen === GameScreens.GAMEOVER) this.changeScreen(GameScreens.MENU)
                break
        }
    }

    nextLevel() {
        this.levelManager.nextLevel()
        this.changeScreen(1, 1, this.levelManager.uiFields.playersMode)
    }

    update(lag) {
        if (this.uiFields.currentScreen !== GameScreens.PLAY) return
        this.levelManager.update(lag)
    }

    render() {
        if (this.uiFields.currentScreen === GameScreens.MENU) return
        this.levelManager.render()
    }
}
