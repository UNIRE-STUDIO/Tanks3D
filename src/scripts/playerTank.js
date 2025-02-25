import Tank from './tank.js'
import Timer from './timer.js'

export default class PlayerTank extends Tank {
    constructor(config, spawnBullet, deadEvent, playerId, threeManager, model) {
        super(config, spawnBullet, threeManager);

        this.speed = 0.005 * config.grid;

        this.isCooldown = false;
        this.cooldownTime = 1;
        this.timerShoot = new Timer(this.cooldownTime, () => { this.isCooldown = false }, 0.1);

        this.deadEvent = deadEvent;
        this.playerId = playerId;

        this.model = model;
    }

    setReset() {
        this.dirX = 0;
        this.dirY = -1;
        this.moveX = 0;
        this.moveY = 0;
        this.isUse = false;
        this.isCooldown = false;
        this.isPause = false;
        this.timerShoot.stop();
        this.timerShoot.reset();
        this.model.visible = false;
    }

    setPause() {
        this.isPause = true;
        this.timerShoot.stop();
    }
    setResume() {
        this.isPause = false;
        this.timerShoot.start();
    }

    setDamage(damage) {
        this.health = this.health - damage <= 0 ? 0 : this.health - damage;
        if (this.health === 0) {
            this.isPause = true;
            setTimeout(() => { // Уничтожение с задержкой
                this.setReset();
                this.deadEvent(this.playerId);
            }, 300);
        }
    }

    shoot() {
        if (this.isCooldown || this.isPause || !this.isUse) return;
        // Смещаем на середину танка                 // Смещаем в сторону ствола от центра танка
        let centerPos = {
            x: this.position.x + this.config.grid/2 + (this.config.grid/2) * this.dirX,
            y: this.position.y + this.config.grid/2 + (this.config.grid/2) * this.dirY
        }
        this.spawnBullet(centerPos, { x: this.dirX, y: this.dirY }, true, this.playerId)
        this.isCooldown = true
        this.timerShoot.reset()
        this.timerShoot.start()
    }

    move(lag) {
        let incrementX = this.moveX * lag * this.speed
        let incrementY = this.moveY * lag * this.speed
        if ((this.moveX == 0 && this.moveY == 0) || this.checkCollisionWithObstacle() || this.sortOtherTanks() || this.sortOtherObjects())
            return // Если выходим за границы карты

        this.position.x += incrementX
        this.position.y += incrementY
    }

    update(lag) {
        if (!this.isUse && !this.isPause) return
        super.update(lag);
        this.move(lag);
    }
}
