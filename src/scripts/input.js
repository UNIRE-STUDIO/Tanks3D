export default class Input {
    constructor() {
        // На весь экран
        window.addEventListener("dblclick", () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.body.requestFullscreen();
            }
        });

        document.addEventListener('keydown', (e) => this.setKeydown(e));
        document.addEventListener('keyup', (e) => this.setKeyup(e));

        this.changeScreenEvent;

        this.movePlayer1Event;
        this.shootPlayer1Event;

        this.moveCameraEvent;

        this.dirX1 = 0
        this.dirY1 = 0

        this.dirX2 = 0
        this.dirY2 = 0

        this.isUp1 = false
        this.isDown1 = false
        this.isRight1 = false
        this.isLeft1 = false

        this.isUp2 = false
        this.isDown2 = false
        this.isRight2 = false
        this.isLeft2 = false

        this.cameraMoveAxis = 0;

        this.isForward = false;
        this.isBack = false;

    }

    backButton_click() {
        this.changeScreenEvent(-1)
    }

    pause_click() {
        this.changeScreenEvent(2)
    }

    restart_click() {
        this.changeScreenEvent(1, 1) // Параметр 1 - начать уровень заново
    }

    resume_click() {
        this.changeScreenEvent(1, 2) // Параметр 2 - продолжить игру на уровне с сохранением результата
    }

    setKeydown(e) {
        this.movePlayerDown(e.code);
        this.moveCameraDown(e.code);
    }

    setKeyup(e) {
        this.movePlayerUp(e.code);
        this.moveCameraUp(e.code);
    }

    movePlayerDown(key){
        if (key === 'Slash') {
            this.shootPlayer1Event()
        }
        if (key === 'ArrowRight') {
            this.dirY1 = 0
            this.dirX1 = 1
            this.isRight1 = true
        }
        if (key === 'ArrowLeft') {
            this.dirY1 = 0
            this.dirX1 = -1
            this.isLeft1 = true
        }
        if (key === 'ArrowUp') {
            this.dirX1 = 0
            this.dirY1 = -1
            this.isUp1 = true
        }
        if (key === 'ArrowDown') {
            this.dirX1 = 0
            this.dirY1 = 1
            this.isDown1 = true
        }

        if (key === 'Space') {
            this.shootPlayer2Event()
        }
        if (key === 'KeyD') {
            this.dirY2 = 0
            this.dirX2 = 1
            this.isRight2 = true
        }
        if (key === 'KeyA') {
            this.dirY2 = 0
            this.dirX2 = -1
            this.isLeft2 = true
        }
        if (key === 'KeyW') {
            this.dirX2 = 0
            this.dirY2 = -1
            this.isUp2 = true
        }
        if (key === 'KeyS') {
            this.dirX2 = 0
            this.dirY2 = 1
            this.isDown2 = true
        }

        this.movePlayer2Event(this.dirX2, this.dirY2);
        this.movePlayer1Event(this.dirX1, this.dirY1)
    }

    movePlayerUp(key){
        if (key === 'ArrowRight') {
            this.dirX1 = 0
            this.isRight1 = false
        }
        if (key === 'ArrowLeft') {
            this.dirX1 = 0
            this.isLeft1 = false
        }
        if (key === 'ArrowUp') {
            this.dirY1 = 0
            this.isUp1 = false
        }
        if (key === 'ArrowDown') {
            this.dirY1 = 0
            this.isDown1 = false
        }

        if (key === 'KeyD') {
            this.dirX2 = 0
            this.isRight2 = false
        }
        if (key === 'KeyA') {
            this.dirX2 = 0
            this.isLeft2 = false
        }
        if (key === 'KeyW') {
            this.dirY2 = 0
            this.isUp2 = false
        }
        if (key === 'KeyS') {
            this.dirY2 = 0
            this.isDown2 = false
        }

        if (this.isRight1) this.dirX1 = 1
        else if (this.isLeft1) this.dirX1 = -1
        else if (this.isUp1) this.dirY1 = -1
        else if (this.isDown1) this.dirY1 = 1

        if (this.isRight2) this.dirX2 = 1
        else if (this.isLeft2) this.dirX2 = -1
        else if (this.isUp2) this.dirY2 = -1
        else if (this.isDown2) this.dirY2 = 1

        if (this.dirY1 != 0 && this.dirX1 != 0) this.dirY1 = 0
        if (this.dirY2 != 0 && this.dirX2 != 0) this.dirY2 = 0

        this.movePlayer1Event(this.dirX1, this.dirY1)
        this.movePlayer2Event(this.dirX2, this.dirY2);
    }

    moveCameraDown(key){
        if (key === 'KeyE') {
            this.cameraMoveAxis = 1;
            this.isForward = true;
        }

        if (key === 'KeyQ') {
            this.cameraMoveAxis = -1;
            this.isBack = true;
        }

        this.moveCameraEvent(this.cameraMoveAxis);
    }

    moveCameraUp(key){
        if (key === 'KeyE') {
            this.cameraMoveAxis = 0;
            this.isForward = false;
        }

        if (key === 'KeyQ') {
            this.cameraMoveAxis = 0;
            this.isBack = false;
        }

        this.moveCameraEvent(this.cameraMoveAxis);
    }
}
