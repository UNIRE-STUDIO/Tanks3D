import Config from './config';
import Tank from './tank';
import Timer from './timer.js';
import * as THREE from 'three';
import ThreeManager from "./threeManager";

export default class PlayerTank extends Tank {
    private deadEvent: Function;
    private playerId: number;
    private bangTankEvent: Function;     

    private isCooldown = false;
    private cooldownTime = 1;
    private timerShoot = new Timer(this.cooldownTime, () => { this.isCooldown = false }, 0.1);
    
    constructor(config: Config, createBullet: Function, threeManager: ThreeManager, deadEvent: Function, playerId: number, model: THREE.Mesh, bangTankEvent: Function) {
        super(config, createBullet, threeManager);

        this.deadEvent = deadEvent;
        this.playerId = playerId;
        this.model = model;
        this.bangTankEvent = bangTankEvent;

        this.speed = 0.005 * config.grid;
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

    setDamage(damage: number) {
        this.health = this.health - damage <= 0 ? 0 : this.health - damage;
        if (this.health === 0) {
            this.bangTankEvent({x:this.position.x + this.config.grid, y: 0.7, z: this.position.y + this.config.grid})
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
            x: this.position.x + this.config.grid + (this.config.grid) * this.dirX,
            y: this.position.y + this.config.grid + (this.config.grid) * this.dirY
        }
        this.createBullet(centerPos, { x: this.dirX, y: this.dirY }, true, this.playerId)
        this.isCooldown = true
        this.timerShoot.reset()
        this.timerShoot.start()
    }

    move(lag: number) {
        let incrementX = this.moveX * lag * this.speed
        let incrementY = this.moveY * lag * this.speed
        if ((this.moveX == 0 && this.moveY == 0) || this.checkCollisionWithObstacle() || this.sortOtherTanks() || this.sortOtherObjects())
            return // Если выходим за границы карты

        this.position.x += incrementX
        this.position.y += incrementY
    }

    update(lag: number) {
        if (!this.isUse && !this.isPause) return
        super.update(lag);
        this.move(lag);
    }
}
