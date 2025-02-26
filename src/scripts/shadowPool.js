export class ShadowPool {
    constructor(modelHor, modelVer) {

        const pool_size = 50;
        this.shadowsHor = [];
        this.shadowsVer = [];

        for (let i = 0; i < pool_size; i++) {
            
        }
    }

    

    create(posX, posY = 0.001, posZ){
        let shadow = new THREE.Mesh(this.shadowGeometry, this.materials[8]);
        shadow.position.set(posX, 0.001, posZ);
        base.add(shadow);
    }
}

