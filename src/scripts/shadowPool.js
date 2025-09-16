import {coordinatesToId, idToCoordinates} from "./general.js";

export class ShadowPool {
    constructor(container, modelRight, modelAbove, arenaSizeX) {
        this.container = container;
        this.modelAbove = modelAbove;
        this.modelRight = modelRight;
        this.arenaSizeX = arenaSizeX;
        const pool_size = 110;
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

    

    createAbove(posX, posY = 0.001, posZ){
        if (this.usedAboveList.has(coordinatesToId(posX, posZ, this.arenaSizeX))){
            return;
        }
        if (this.shadowsAbove.length === 0) {
            this.shadowsAbove.push(this.modelAbove.clone());
            this.shadowsAbove[0].visible = false;
            this.container.add(this.shadowsAbove[0]);
            console.log("Добавляем дополнительный объект в ShadowPool");
        }
        let shadow = this.shadowsAbove.splice(this.shadowsAbove.length-1, 1)[0];
        this.usedAboveList.set(coordinatesToId(posX, posZ, this.arenaSizeX), shadow);
        shadow.position.set(posX, posY, posZ);
        shadow.visible = true;
    }

    createRight(posX, posY = 0.001, posZ){
        if (this.usedRightList.has(coordinatesToId(posX, posZ, this.arenaSizeX))){
            return;
        }
        if (this.shadowsRight.length === 0) {
            this.shadowsRight.push(this.modelRight.clone());
            this.shadowsRight[0].visible = false;
            this.container.add(this.shadowsRight[0]);
            console.log("Добавляем дополнительный объект в ShadowPool");
        }
        let shadow = this.shadowsRight.splice(this.shadowsRight.length-1, 1)[0];
        this.usedRightList.set(coordinatesToId(posX, posZ, this.arenaSizeX), shadow);
        shadow.position.set(posX, posY, posZ);
        shadow.visible = true;
    }

    remove(posX, posZ){
        let shadowRight = this.usedRightList.get(coordinatesToId(posX, posZ, this.arenaSizeX));
        let shadowAbove = this.usedAboveList.get(coordinatesToId(posX, posZ, this.arenaSizeX));

        if (shadowRight) {
            this.usedRightList.delete(coordinatesToId(posX, posZ, this.arenaSizeX));
            shadowRight.visible = false;
            this.shadowsRight.push(shadowRight);
        }

        if (shadowAbove) {
            this.usedAboveList.delete(coordinatesToId(posX, posZ, this.arenaSizeX));
            shadowAbove.visible = false;
            this.shadowsAbove.push(shadowAbove);
        }
        
    }
}

