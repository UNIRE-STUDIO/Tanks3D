import Bullet from './bullet.js'

export default class BulletPool {
    constructor(config, removeTile, destructionOfTheBaseEvent, bangCreateEvent, uiFields, createBullet, container) {
        this.config = config
        const pool_size = 12
        this.bullets = []

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

    setListNpcTanks(tanks) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].tanks.push(...tanks)
        }
    }
    setListPlayers(tanks) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].players.push(...tanks)
        }
    }
    setOtherCollisionObject(obj) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].setOtherCollisionObject(obj)
        }
    }

    init(currentMap, basePos) {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].setCurrentMap(currentMap);
            this.bullets[i].setBasePos(basePos);
        }
    }

    create(pos, dir, playersBullet, tankId) {
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

    update(lag) {
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].isUse) {
                this.bullets[i].update(lag);
            }
        }
    }
}
