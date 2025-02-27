import {coordinatesToId, idToCoordinates} from "./general.js";

export class ShadowPool {
    constructor(modelHor, modelVer, scene, config) {
        this.config = config;

        const pool_size = 50;
        this.shadowsHor = [];
        this.shadowsVer = [];

        for (let i = 0; i < pool_size; i++) {
            this.shadowsHor.push(modelHor.clone());
            this.shadowsHor[i].visible = false;
        }

        this.usedList = new Map();
    }

    

    create(posX, posY = 0.001, posZ){
        let shadow = this.shadowsHor.splice(this.shadowsHor.length-1, 1);
        this.usedList.set(coordinatesToId(posX, posY, this.config.viewSize.x), shadow);
        
        shadow.position.set(posX, posY, posZ);
    }
}

