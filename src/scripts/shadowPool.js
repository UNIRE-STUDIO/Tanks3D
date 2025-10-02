import {coordinatesToId, idToCoordinates} from "./general.js";
import * as THREE from "three";

export class ShadowPool {
    constructor(container, modelRight, modelAbove) {
        this.container = container;
        this.modelAbove = modelAbove;
        this.modelRight = modelRight;
        this.pool_size = 200;
        this.freeShadowsAbove = [];
        this.freeShadowsRight = [];

        this.usedAboveList = new Map();
        this.usedRightList = new Map();

        this.zeroMatrix = new THREE.Matrix4().set(
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0, 
            0, 0, 0, 0
        );
        this.instancedMeshForRight = new THREE.InstancedMesh(modelRight.geometry, modelRight.material, this.pool_size);
        this.instancedMeshForAbove = new THREE.InstancedMesh(modelAbove.geometry, modelAbove.material, this.pool_size);
        this.container.add(this.instancedMeshForRight);
        this.container.add(this.instancedMeshForAbove);
    }

    init(rightMatrixs, aboveMatrixs, mapWidth){
        for (let i = 0; i < this.pool_size; i++) { 
            this.instancedMeshForRight.setMatrixAt(i, this.zeroMatrix);
            this.freeShadowsRight.push(i);

            this.instancedMeshForAbove.setMatrixAt(i, this.zeroMatrix);
            this.freeShadowsAbove.push(i);
        }
        for (let i = 0; i < rightMatrixs.length; i++) {
            const matrix = new THREE.Matrix4();
            let position = new THREE.Vector3(rightMatrixs[i].pX, rightMatrixs[i].pY, rightMatrixs[i].pZ);
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3(1, 1, 1);
            matrix.compose(position, quaternion, scale);

            this.freeShadowsRight.splice(this.freeShadowsRight.indexOf(i), 1);
            this.usedRightList.set(coordinatesToId(rightMatrixs[i].pX, rightMatrixs[i].pZ, mapWidth), i);
            this.instancedMeshForRight.setMatrixAt(i, matrix);
        }
        for (let i = 0; i < aboveMatrixs.length; i++) {
            const matrix = new THREE.Matrix4();
            let position = new THREE.Vector3(aboveMatrixs[i].pX, aboveMatrixs[i].pY, aboveMatrixs[i].pZ);
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3(1, 1, 1);
            matrix.compose(position, quaternion, scale);

            this.freeShadowsAbove.splice(this.freeShadowsAbove.indexOf(i), 1);
            this.usedAboveList.set(coordinatesToId(aboveMatrixs[i].pX, aboveMatrixs[i].pZ, mapWidth), i);
            this.instancedMeshForAbove.setMatrixAt(i, matrix);
        }
    }

    createAbove(posX, posY = 0.001, posZ, mapWidth){
        // if (this.usedAboveList.has(coordinatesToId(posX, posZ, mapWidth))){
        //     return;
        // }
        // if (this.shadowsAbove.length === 0) {
        //     this.shadowsAbove.push(this.modelAbove.clone());
        //     this.shadowsAbove[0].visible = false;
        //     this.container.add(this.shadowsAbove[0]);
        //     console.log("Добавляем дополнительный объект в ShadowPool");
        // }
        // let shadow = this.shadowsAbove.splice(this.shadowsAbove.length-1, 1)[0];
        // this.usedAboveList.set(coordinatesToId(posX, posZ, mapWidth), shadow);
        // shadow.position.set(posX, posY, posZ);
        // shadow.visible = true;
    }

    createRight(posX, posY = 0.001, posZ, mapWidth){
        // if (this.usedRightList.has(coordinatesToId(posX, posZ, mapWidth))){
        //     return;
        // }
        // if (this.shadowsRight.length === 0) {
        //     this.shadowsRight.push(this.modelRight.clone());
        //     this.shadowsRight[0].visible = false;
        //     this.container.add(this.shadowsRight[0]);
        //     console.log("Добавляем дополнительный объект в ShadowPool");
        // }
        // let shadow = this.shadowsRight.splice(this.shadowsRight.length-1, 1)[0];
        // this.usedRightList.set(coordinatesToId(posX, posZ, mapWidth), shadow);
        // shadow.position.set(posX, posY, posZ);
        // shadow.visible = true;
    }

    remove(posX, posZ, mapWidth){
        let idRight = this.usedRightList.get(coordinatesToId(posX, posZ, mapWidth));
        let idAbove = this.usedAboveList.get(coordinatesToId(posX, posZ, mapWidth));
        if (idRight) {
            this.instancedMeshForRight.setMatrixAt(idRight, this.zeroMatrix);
            this.usedRightList.delete(coordinatesToId(posX, posZ, mapWidth));
            this.freeShadowsRight.push(idRight);
            this.instancedMeshForRight.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
        }

        if (idAbove) {
            this.instancedMeshForAbove.setMatrixAt(idAbove, this.zeroMatrix);
            this.usedAboveList.delete(coordinatesToId(posX, posZ, mapWidth));
            this.freeShadowsAbove.push(idAbove);
            this.instancedMeshForAbove.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
        }
    }
}

