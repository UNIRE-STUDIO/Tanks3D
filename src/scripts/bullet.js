import { drawImage, drawRect, isInside } from './general.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

export default class Bullet {
    constructor(config, removeTile, destructionOfTheBaseEvent, id, bangCreateEvent, uiFields, scene) {
        this.config = config
        this.scene = scene
        this.posX = 0
        this.posY = 0
        this.dirY = 0
        this.dirX = 0
        this.currentMap
        this.basePos
        this.isUse = false
        this.id = id
        this.uiFields = uiFields

        this.speed = 0.01 * config.grid
        this.damage = 1
        this.bulletsPlayer = false

        this.removeTile = removeTile
        this.destructionOfTheBaseEvent = destructionOfTheBaseEvent
        this.tanks = [] // bulletPool
        this.players = [] // bulletPool
        this.bullets = [] // bulletPool
        this.otherCollisionObject = []
        this.tankId
        this.size = this.config.grid / 2
        this.bangCreateEvent = bangCreateEvent

        // 3d
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        this.mesh = new THREE.Mesh(geometry, material)
    }

    create(pos, dir, bulletsPlayer, tankId) {
        this.posX = pos.x
        this.posY = pos.y
        this.dirY = dir.y
        this.dirX = dir.x
        this.bulletsPlayer = bulletsPlayer
        this.otherCollisionObject = []
        this.tankId = tankId
        this.mesh.position.set(this.posX, this.posY, 1)
        this.scene.add(this.mesh)
        this.isUse = true
    }

    setOtherCollisionObject(obj) {
        this.otherCollisionObject.push(obj)
    }

    checkCollisionWithObstacle() {
        let tileX = Math.round((this.posX + this.size/2 * this.dirX) / this.config.grid)
        let tileY = Math.round((this.posY + this.size/2 * this.dirY) / this.config.grid)

        if (this.currentMap[tileY] === undefined || this.currentMap[tileY][tileX] === undefined) {
            return true
        }

        let isCollision = false
        let tile = this.currentMap[tileY][tileX]
        if (tile === 1 || tile === 2) {
            // Проверяем основным датчиком
            if (tile === 1) this.removeTile(tileX, tileY)
            isCollision = true
        }
        if (
            this.dirY != 0 &&
            this.currentMap[0][tileX - 1] !== undefined &&
            (this.currentMap[tileY][tileX - 1] === 1 || this.currentMap[tileY][tileX - 1] === 2)
        ) {
            // Проверяем соседний блок по горизонтале
            if (this.currentMap[tileY][tileX - 1] === 1) this.removeTile(tileX - 1, tileY)
            isCollision = true
        } else if (
            this.dirX != 0 &&
            this.currentMap[tileY - 1] !== undefined &&
            (this.currentMap[tileY - 1][tileX] === 1 || this.currentMap[tileY - 1][tileX] === 2)
        ) {
            // Проверяем соседний блок по вертикали
            if (this.currentMap[tileY - 1][tileX] === 1) this.removeTile(tileX, tileY - 1)
            isCollision = true
        }
        return isCollision
    }

    sortTanks() {
        for (let i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].isUse) {
                if (!this.bulletsPlayer && i === this.tankId) continue
                if (this.checkCollisionWithTank(this.tanks[i].position, this.config.grid2 - 2)) {
                    // магические числа
                    if (this.bulletsPlayer) {
                        this.tanks[i].setDamage(this.damage)
                        if (this.tanks[i].isDead) {
                            if (this.tanks[i].type === 1) this.uiFields.numDestroyedType1[this.tankId]++
                            else this.uiFields.numDestroyedType0[this.tankId]++
                        }
                    }
                    return true
                }
            }
        }
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].isUse) {
                if (this.bulletsPlayer && i === this.tankId) continue
                if (this.checkCollisionWithTank(this.players[i].position, this.config.grid2 - 2)) {
                    // магические числа
                    if (!this.bulletsPlayer) this.players[i].setDamage(this.damage)
                    return true
                }
            }
        }
        return false
    }

    checkCollisionWithBullets() {
        for (let i = 0; i < this.bullets.length; i++) {
            if (i === this.id || !this.bullets[i].isUse) continue
            let tX = Math.round(this.posX / this.config.grid)
            let tY = Math.round(this.posY / this.config.grid)

            let oX = Math.round(this.bullets[i].posX / this.config.grid)
            let oY = Math.round(this.bullets[i].posY / this.config.grid)

            if (tX === oX && tY === oY) {
                this.bullets[i].isUse = false
                return true
            }
        }
        return false
    }

    checkCollisionWithTank(pos, size) {
        if (this.dirX !== 0) {
            return (
                isInside({ x: this.posX, y: this.posY }, pos, size, size) ||
                isInside({ x: this.posX, y: this.posY + this.size }, pos, size, size)
            )
        }
        if (this.dirY !== 0) {
            return (
                isInside({ x: this.posX, y: this.posY }, pos, size, size) ||
                isInside({ x: this.posX + this.size, y: this.posY }, pos, size, size)
            )
        }
    }

    destroy() {
        this.isUse = false
        this.scene.remove(this.mesh)
    }

    update(lag) {
        if (this.checkCollisionWithObstacle() || this.sortTanks() || this.checkCollisionWithBullets()) {
            this.destroy()

            // Спауним на середине пули // Смещаем по направлению
            // this.bangCreateEvent({
            //     x: this.posX + this.size / 2 + this.size * this.dirX,
            //     y: this.posY + this.size / 2 + this.size * this.dirY                 <----------------------------
            // })
            return
        }
        // Левый верхний угол пули и правый нижний угл
        if (
            isInside({ x: this.posX, y: this.posY }, { x: this.basePos.x, y: this.basePos.y }, this.config.grid2, this.config.grid2) ||
            isInside(
                { x: this.posX + this.size, y: this.posY + this.size },
                { x: this.basePos.x, y: this.basePos.y },
                this.config.grid2,
                this.config.grid2
            )
        ) {
            this.destroy()
            this.destructionOfTheBaseEvent()
            return
        }

        this.posX += this.dirX * lag * this.speed
        this.posY += this.dirY * lag * this.speed
        this.mesh.position.set(this.posX, 1, this.posY)
    }
}
