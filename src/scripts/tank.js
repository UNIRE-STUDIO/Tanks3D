import { drawImage } from './general.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

export default class Tank {
    constructor(config, scene) {
        this.config = config
        this.position = {
            x: 0,
            y: 0
        }
        this.moveY = 0
        this.moveX = 0
        this.dirY = -1
        this.dirX = 0
        //this.spawnBullet = spawnBullet;
        this.isPause = false
        this.currentMap
        this.isUse = false

        this.image_up = new Image()
        this.image_down = new Image()
        this.image_right = new Image()
        this.image_left = new Image()

        this.speed = 0
        this.speedRotation = 0.03
        this.health = 1

        this.otherTanks = [] // Присваивает Level Manager или npcPool
        this.otherCollisionObject = []

        this.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        this.gltfLoader = new GLTFLoader()
        this.model
        this.gltfLoader.load('/models/tank1.glb', (gltf) => {
            this.model = gltf.scene.children[0]
            scene.add(this.model)
        })
    }

    create(currentMap, pos) {
        this.currentMap = currentMap
        this.position.x = pos.x * this.config.grid
        this.position.y = pos.y * this.config.grid
        this.otherCollisionObject = []
        this.isUse = true
    }

    setOtherCollisionObject(obj) {
        this.otherCollisionObject.push(obj)
    }

    setDirection(dirX, dirY) {
        if (this.isPause || !this.isUse) return

        // Если поворачиваем
        if (this.dirX != 0 && dirY != 0) {
            this.position.x = Math.round(this.position.x / this.config.grid) * this.config.grid
        } else if (this.dirY != 0 && dirX != 0) {
            this.position.y = Math.round(this.position.y / this.config.grid) * this.config.grid
        }
        this.moveX = dirX
        this.moveY = dirY
        if (dirX == 0 && dirY == 0) return // Если input пытается сбросить направления, то this.dir? должны его сохранить даже если кнопка не нажата
        this.dirY = dirY
        this.dirX = dirX
    }

    checkCollisionWithObstacle() {
        let tileX = Math.ceil((this.position.x + this.config.grid * this.moveX) / this.config.grid)
        let tileY = Math.ceil((this.position.y + this.config.grid * this.moveY) / this.config.grid)
        let extraX = tileX
        let extraY = tileY

        if (this.currentMap[tileY] === undefined || this.currentMap[tileY][tileX] === undefined) return true

        if (this.moveY != 0) extraX += 1
        else if (this.moveX != 0) extraY += 1

        return (
            (this.currentMap[tileY][tileX] !== 0 && this.currentMap[tileY][tileX] !== 4) ||
            (this.currentMap[extraY][extraX] !== 0 && this.currentMap[extraY][extraX] !== 4)
        )
    }

    sortOtherObjects() {
        let check = 0
        for (let i = 0; i < this.otherCollisionObject.length; i++) {
            check = this.checkCollisionWithObject(this.otherCollisionObject[i]) ? check + 1 : check
        }
        return check > 0
    }

    sortOtherTanks() {
        let check = 0
        for (let i = 0; i < this.otherTanks.length; i++) {
            if (this.otherTanks[i].isUse) {
                check = this.checkCollisionWithObject(this.otherTanks[i].position) ? check + 1 : check
            }
        }
        return check > 0
    }

    checkCollisionWithObject(objPos) {
        let tX = Math.round((this.position.x + (this.config.grid / 2) * this.moveX) / this.config.grid)
        let tY = Math.round((this.position.y + (this.config.grid / 2) * this.moveY) / this.config.grid)

        let oX = Math.round(objPos.x / this.config.grid)
        let oY = Math.round(objPos.y / this.config.grid)

        if (this.moveY > 0) {
            // Двигаясь вниз
            if (
                (tX === oX + 1 && tY + 1 === oY) || // Сравниваем левый нижний угл нашего танка с правым верхним углом другого
                (tX + 1 === oX && tY + 1 === oY) || // правый нижний угл нашего танка с левым верхним углом другого
                (tX === oX && tY + 1 === oY)
            )
                return true // левый нижний угл нашего танка с левым верхним углом другого
        } else if (this.moveY < 0) {
            // Двигаясь вверх
            if (
                (tX === oX + 1 && tY === oY + 1) || // Сравниваем левый верхний угл нашего танка с правым нижним углом другого
                (tX + 1 === oX && tY === oY + 1) || // правый верхний угл нашего танка с левым нижним углом другого
                (tX === oX && tY === oY + 1)
            )
                return true // левый верхний угл нашего танка с левым верхним углом другого
        } else if (this.moveX > 0) {
            // Двигаясь вправо
            if (
                (tX + 1 === oX && tY === oY + 1) || // Сравниваем правый верхний угл нашего танка с левым нижним углом другого
                (tX + 1 === oX && tY + 1 === oY) || // правый нижний угл нашего танка с левым верхним углом другого
                (tX + 1 === oX && tY === oY)
            )
                return true // правый верхний угл нашего танка с левым верхним углом другого
        } else if (this.moveX < 0) {
            // Двигаясь влево
            if (
                (tX === oX + 1 && tY === oY + 1) || // Сравниваем левый верхний угл нашего танка с правым нижним углом другого
                (tX === oX + 1 && tY + 1 === oY) || // левый нижний угл нашего танка с правым верхним углом другого
                (tX === oX + 1 && tY === oY)
            )
                return true // левый верхний угл нашего танка с правым верхним углом другого
        }

        return false
    }

    update(lag) {
        let halfAngle
        if (this.dirY != 0)
            halfAngle = this.dirY > 0 ? Math.PI / 2 : 0 // Вниз или вверх
        else if (this.dirX != 0) halfAngle = this.dirX > 0 ? (3 * Math.PI) / 2 / 2 : Math.PI / 2 / 2 // Вправо или влево
        let q = new THREE.Quaternion(0, 1 * Math.sin(halfAngle), 0, Math.cos(halfAngle))
        this.model.quaternion.slerp(q, lag * this.speedRotation)
    }

    render() {
        if (!this.isUse) return

        // if (this.dirX == 1)
        //     drawImage(this.config.ctx, this.image_right, pos, {x:this.config.grid2, y:this.config.grid2});
        // else if (this.dirX == -1)
        //     drawImage(this.config.ctx, this.image_left, pos, {x:this.config.grid2, y:this.config.grid2});
        // else if (this.dirY == 1)
        //     drawImage(this.config.ctx, this.image_down, pos, {x:this.config.grid2, y:this.config.grid2});
        // else if (this.dirY == -1)
        //     drawImage(this.config.ctx, this.image_up, pos, {x:this.config.grid2, y:this.config.grid2});

        //   pos = {x: Math.ceil((this.position.x + this.config.grid) / this.config.grid) * this.config.grid,
        //          y: Math.ceil((this.position.y + this.config.grid * this.moveY) / this.config.grid) * this.config.grid};
        //   drawRect(this.config.ctx, pos, {x:this.config.grid, y:this.config.grid}, "#fff");

        // pos = {x: Math.ceil((this.position.x + this.config.grid * this.moveX) / this.config.grid) * this.config.grid,
        //       y: Math.ceil((this.position.y + this.config.grid * this.moveY) / this.config.grid) * this.config.grid};
        // drawRect(this.config.ctx, pos, {x:this.config.grid, y:this.config.grid}, "#007");
    }
}