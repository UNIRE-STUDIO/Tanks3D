import {coordinatesToId, idToCoordinates} from "./general.js";

export class ShadowPool {
    constructor(container, modelRight, modelAbove) {
        this.container = container;
        this.modelAbove = modelAbove;
        this.modelRight = modelRight;
        const pool_size = 55;
        this.shadowsAbove = [];
        this.shadowsRight = [];

        for (let i = 0; i < pool_size; i++) {
            this.shadowsAbove.push(modelAbove.clone());
            this.shadowsAbove[i].visible = false;
            this.container.add(this.shadowsAbove[i]);

            this.shadowsRight.push(modelRight.clone());
            this.shadowsRight[i].visible = false;
            this.container.add(this.shadowsRight[i]);
        }

        this.usedAboveList = new Map();
        this.usedRightList = new Map();
    }

    

    createAbove(posX, posY = 0.001, posZ, viewSizeX){
        if (this.shadowsAbove.length === 0) {
            this.shadowsAbove.push(this.modelAbove.clone());
            this.shadowsAbove[0].visible = false;
            this.container.add(this.shadowsAbove[0]);
            console.log("Добавляем дополнительный объект в ShadowPool");
        }
        let shadow = this.shadowsAbove.splice(this.shadowsAbove.length-1, 1)[0];
        this.usedAboveList.set(coordinatesToId(posX, posY, viewSizeX), shadow);
        shadow.position.set(posX, posY, posZ);
        shadow.visible = true;
    }

    createRight(posX, posY = 0.001, posZ, viewSizeX){
        if (this.shadowsRight.length === 0) {
            this.shadowsRight.push(this.modelRight.clone());
            this.shadowsRight[0].visible = false;
            this.container.add(this.shadowsRight[0]);
            console.log("Добавляем дополнительный объект в ShadowPool");
        }
        let shadow = this.shadowsRight.splice(this.shadowsRight.length-1, 1)[0];
        this.usedRightList.set(coordinatesToId(posX, posY, viewSizeX), shadow);
        shadow.position.set(posX, posY, posZ);
        shadow.visible = true;
    }
}

