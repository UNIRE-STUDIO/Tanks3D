import Tank from './tank.js'
import Timer from './timer.js'
import { moveTo } from './general.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

export default class PlayerTank extends Tank {
    constructor(config, spawnBullet, deadEvent, playerId, scene) {
        super(config, spawnBullet, scene)

        this.speed = 0.005 * config.grid

        this.isCooldown = false
        this.cooldownTime = 1
        this.timerShoot = new Timer(
            this.cooldownTime,
            () => {
                this.isCooldown = false
            },
            0.1
        )

        this.deadEvent = deadEvent
        this.playerId = playerId

        let urlModels = [
            '/models/tank1.glb',    // 0
            '/models/tank2.glb',    // 1
        ]
        const gltfLoader = new GLTFLoader()
        gltfLoader.load(urlModels[playerId], (gltf) => {
            this.model = gltf.scene.children[0]
            this.model.material.map.minFilter = THREE.LinearFilter
        })
    }

    setReset() {
        this.dirX = 0
        this.dirY = -1
        this.moveX = 0
        this.moveY = 0
        this.isUse = false
        this.isCooldown = false
        this.timerShoot.stop()
        this.timerShoot.reset()
    }

    setPause() {
        this.isPause = true
        this.timerShoot.stop()
    }
    setResume() {
        this.isPause = false
        this.timerShoot.start()
    }

    setDamage(damage) {
        this.health = this.health - damage <= 0 ? 0 : this.health - damage
        if (this.health === 0) {
            this.setReset()
            this.deadEvent(this.playerId)
        }
    }

    shoot() {
        if (this.isCooldown || this.isPause || !this.isUse) return
        // Смещаем на середину танка                 // Смещаем в сторону ствола от центра танка
        let centerPos = {
            x: this.position.x + this.config.grid2 / 2 + (this.config.grid2 / 2) * this.dirX,
            y: this.position.y + this.config.grid2 / 2 + (this.config.grid2 / 2) * this.dirY
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
        if (!this.isUse) return
        super.update(lag)

        this.move(lag)
        this.model.position.x = this.position.x + this.config.grid
        this.model.position.z = this.position.y + this.config.grid
    }
}
