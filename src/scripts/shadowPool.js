export class ShadowPool {
    constructor(modelHor, modelVer) {
        this.modelHor = modelHor;
        this.modelVer = modelVer;

        const pool_size = 50;
        this.shadowsHor = [];
        this.shadowsVer = [];

        for (let i = 0; i < pool_size; i++) {
            // Добавить сюда создание самого 3д объекта с помощью threeManager
            model = this.threeManager.createBullet();
            this.bullets[i] = new Bullet(this.config, removeTile, destructionOfTheBaseEvent, i, bangCreateEvent, uiFields, threeManager, model);
        }
    }

    

    create(posX, posY = 0.001, posZ){
        let shadow = new THREE.Mesh(this.shadowGeometry, this.materials[8]);
        shadow.position.set(posX, 0.001, posZ);
        base.add(shadow);
    }
}

