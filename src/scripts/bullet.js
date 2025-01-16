import { drawImage, drawRect, isInside } from "./general.js";
import * as THREE from "three";

export default class Bullet {
    constructor(
        config,
        removeTile,
        destructionOfTheBaseEvent,
        id,
        bangCreateEvent,
        uiFields,
        threeManager,
        model
    ) {
        this.config = config;
        this.threeManager = threeManager;
        this.posX = 0;
        this.posY = 0;
        this.dirY = 0;
        this.dirX = 0;
        this.currentMap;
        this.basePos;
        this.isUse = false;
        this.id = id;
        this.uiFields = uiFields;
        this.checkerX = 0;
        this.checkerY = 0;
        this.checkerExtraX = 0;
        this.checkerExtraY = 0;

        this.speed = 0.01 * config.grid;
        this.damage = 1;
        this.bulletsPlayer = false;

        this.removeTile = removeTile;
        this.destructionOfTheBaseEvent = destructionOfTheBaseEvent;
        this.tanks = []; // bulletPool
        this.players = []; // bulletPool
        this.bullets = []; // bulletPool
        this.otherCollisionObject = [];
        this.tankId;
        this.size = this.config.grid / 2;
        this.bangCreateEvent = bangCreateEvent;

        // 3d                                                    
        this.model = model; // центром пули является её начало *|========>
        this.threeManager.scene.add(this.model);
        this.model.visible = false;
    }

    create(pos, dir, bulletsPlayer, tankId) {
        this.posX = pos.x;
        this.posY = pos.y;
        this.dirY = dir.y;
        this.dirX = dir.x;
        this.bulletsPlayer = bulletsPlayer;
        this.otherCollisionObject = [];
        this.tankId = tankId;
        this.model.position.set(this.posX, this.posY, 1);
        this.model.rotation.y = THREE.MathUtils.degToRad((this.dirX * -90) + (this.dirY > 0 ? 180 : 0));
        this.model.visible = true;
        this.isUse = true;
    }

    setOtherCollisionObject(obj) {
        this.otherCollisionObject.push(obj);
    }

    checkCollisionWithObstacle() {
        let tileX = Math.round((this.posX + (this.size / 2) * this.dirX) / this.config.grid);
        let tileY = Math.round((this.posY + (this.size / 2) * this.dirY) / this.config.grid);

        if (
            this.currentMap[tileY] === undefined ||
            this.currentMap[tileY][tileX] === undefined
        ) {
            return true;
        }

        let isCollision = false;
        let tile = this.currentMap[tileY][tileX];
        if (tile === 1 || tile === 2) {
            // Проверяем основным датчиком
            if (tile === 1) this.removeTile(tileX, tileY);
            isCollision = true;
        }
        if (this.dirY != 0 && this.currentMap[0][tileX - 1] !== undefined && (this.currentMap[tileY][tileX - 1] === 1 || this.currentMap[tileY][tileX - 1] === 2)) 
        {
            // Проверяем соседний блок по горизонтале
            if (this.currentMap[tileY][tileX - 1] === 1)
                this.removeTile(tileX - 1, tileY);
            isCollision = true;
        } else if (
            this.dirX != 0 &&
            this.currentMap[tileY - 1] !== undefined &&
            (this.currentMap[tileY - 1][tileX] === 1 ||
                this.currentMap[tileY - 1][tileX] === 2)
        ) {
            // Проверяем соседний блок по вертикали
            if (this.currentMap[tileY - 1][tileX] === 1)
                this.removeTile(tileX, tileY - 1);
            isCollision = true;
        }
        return isCollision;
    }

    sortTanks() {
        for (let i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].isUse) {
                if (!this.bulletsPlayer && i === this.tankId) continue;
                if (this.checkCollisionWithTank(this.tanks[i].position, this.config.grid2)) {
                    // магические числа
                    if (this.bulletsPlayer) {
                        this.tanks[i].setDamage(this.damage);
                        if (this.tanks[i].isDead) {
                            if (this.tanks[i].type === 1)
                                this.uiFields.numDestroyedType1[this.tankId]++;
                            else this.uiFields.numDestroyedType0[this.tankId]++;
                        }
                    }
                    return true;
                }
            }
        }
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].isUse) {
                if (this.bulletsPlayer && i === this.tankId) continue;
                if (this.checkCollisionWithTank(this.players[i].position, this.config.grid2)) {
                    if (!this.bulletsPlayer) this.players[i].setDamage(this.damage);
                    return true;
                }
            }
        }
        return false;
    }

    checkCollisionWithBullets() {
        for (let i = 0; i < this.bullets.length; i++) {
            if (i === this.id || !this.bullets[i].isUse) continue;
            let tX = Math.round(this.posX / this.config.grid);
            let tY = Math.round(this.posY / this.config.grid);

            let oX = Math.round(this.bullets[i].posX / this.config.grid);
            let oY = Math.round(this.bullets[i].posY / this.config.grid);

            if (tX === oX && tY === oY) {
                this.bullets[i].destroy();
                return true;
            }
        }
        return false;
    }

    checkCollisionWithTank(pos, size) {
        return (
            isInside({ x: this.checkerX, y: this.checkerY }, pos, size, size) ||
            isInside({ x: this.checkerExtraX, y: this.checkerExtraY }, pos, size, size));
    }

    destroy() {
        this.isUse = false;
        this.model.visible = false;
    }

    checkerUpdatePos()
    {
        let halfSize = this.size / 2;
        let dirAbsX = Math.abs(this.dirX);
        let dirAbsY = Math.abs(this.dirY);
        // датчик * с боку
        this.checkerX = (this.posX - (halfSize * dirAbsY) + (halfSize * dirAbsX)); // Если Движемся по вертикали, то смещаем датчик в бок, если движемся по горизонтали смещаем чек по направлению
        this.checkerY = (this.posY - (halfSize * dirAbsX) + (halfSize * dirAbsY)); // Если Движемся по горизонтали, то смещаем датчик в бок, если движемся по вертикали смещаем чек по направлению
        //   *        *     ##   /\   
        // ====>    <====  *##  *##
        //                  \/   ##
        
        this.checkerExtraX = this.checkerX + this.size * dirAbsY;
        this.checkerExtraY = this.checkerY + this.size * dirAbsX;
    }

    update(lag) {
        this.checkerUpdatePos(); // Обновляем положения датчика
        if (this.checkCollisionWithObstacle() || this.sortTanks() || this.checkCollisionWithBullets()) {
            this.destroy();

            // Спауним на середине пули // Смещаем по направлению
            // this.bangCreateEvent({
            //     x: this.posX + this.size / 2 + this.size * this.dirX,
            //     y: this.posY + this.size / 2 + this.size * this.dirY                 <----------------------------
            // })
            return;
        }

        if (isInside({ x: this.checkerX, y: this.checkerY}, { x: this.basePos.x, y: this.basePos.y }, this.config.grid2, this.config.grid2) ||
            isInside({ x: this.checkerExtraX, y: this.checkerExtraY },{ x: this.basePos.x, y: this.basePos.y }, this.config.grid2, this.config.grid2)) 
        {
            this.destroy();
            this.destructionOfTheBaseEvent();
            return;
        }

        this.posX += this.dirX * lag * this.speed;
        this.posY += this.dirY * lag * this.speed;
        this.model.position.set(this.posX, 1, this.posY);
    }
}
