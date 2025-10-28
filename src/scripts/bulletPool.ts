import Bullet from './bullet';
import Config from './config';
import UIFields from './uiFields.js';
import * as THREE from 'three';
import Tank from './tank.js'

export default class BulletPool {
    private config: Config;
    private bullets: Array<Bullet> = [];

    constructor(config: Config, 
                removeTile: Function, 
                destructionOfTheBaseEvent: Function, 
                bangCreateEvent: Function, 
                uiFields: UIFields, 
                createBullet: Function, 
                container: THREE.Object3D) {
        this.config = config;
        const pool_size = 12;

        let model
        for (let i = 0; i < pool_size; i++) {
            // Добавить сюда создание самого 3д объекта с помощью threeManager
            model = createBullet();
            container.add(model);
            this.bullets[i] = new Bullet(this.config, removeTile, destructionOfTheBaseEvent, i, bangCreateEvent, uiFields, model);
        }
        for (let i = 0; i < pool_size; i++) {
            this.bullets[i].bullets = this.bullets;
        }
    }

    setListNpcTanks(tanks: Array<Tank>) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].tanks.push(...tanks)
        }
    }
    setListPlayers(tanks: Array<Tank>) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].players.push(...tanks)
        }
    }
    setOtherCollisionObject(obj: {x: number, y: number}) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].setOtherCollisionObject(obj)
        }
    }

    init(currentMap: Array<Array<number>>, basePos: {x: number, y: number}) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].setCurrentMap(currentMap);
            this.bullets[i].setBasePos(basePos);
        }
    }

    create(pos: {x: number, y: number}, dir: {x: number, y: number}, playersBullet: boolean, tankId: number) {
        for (let i = 0; i < this.bullets.length; i++) {
            if (!this.bullets[i].isUse) {
                this.bullets[i].create(pos, dir, playersBullet, tankId)
                return
            }
        }
        console.log('BulletPool переполнен')
    }

    setReset() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].destroy();
        }
    }

    update(lag: number) {
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].isUse) {
                this.bullets[i].update(lag);
            }
        }
    }
}
