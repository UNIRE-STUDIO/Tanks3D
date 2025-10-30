import {coordinatesToId, idToCoordinates} from "./general";
import * as THREE from "three";

export class ShadowPool {
    private container: THREE.Object3D;
    private modelAbove: THREE.Mesh;
    private modelRight: THREE.Mesh;
    private pool_size = 400;
    private freeShadowsAbove: Array<number> = [];
    private freeShadowsRight: Array<number> = [];

    private usedAboveList = new Map();
    private usedRightList = new Map();

    private zeroMatrix = new THREE.Matrix4().set(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0, 
        0, 0, 0, 0
    );
    private instancedMeshForRight: THREE.InstancedMesh;
    private instancedMeshForAbove: THREE.InstancedMesh;

    constructor(container: THREE.Object3D, modelRight: THREE.Mesh, modelAbove: THREE.Mesh) {
        this.container = container;
        this.modelAbove = modelAbove;
        this.modelRight = modelRight;

        this.instancedMeshForRight = new THREE.InstancedMesh(modelRight.geometry, modelRight.material, this.pool_size);
        this.instancedMeshForAbove = new THREE.InstancedMesh(modelAbove.geometry, modelAbove.material, this.pool_size);
        this.container.add(this.instancedMeshForRight);
        this.container.add(this.instancedMeshForAbove);
    }

    init(rightMatrixs: {pX: number, pY: number, pZ: number, rX: number, rY: number, rZ: number}, 
        aboveMatrixs: {pX: number, pY: number, pZ: number, rX: number, rY: number, rZ: number}, 
        mapWidth: number){
        this.freeShadowsRight = [];
        this.freeShadowsAbove = [];
        this.usedRightList.clear();
        this.usedAboveList.clear();
        for (let i = 0; i < this.pool_size; i++) { 
            this.instancedMeshForRight.setMatrixAt(i, this.zeroMatrix);
            this.freeShadowsRight.push(i);

            this.instancedMeshForAbove.setMatrixAt(i, this.zeroMatrix);
            this.freeShadowsAbove.push(i);
        }
        for (let i = 0; i < Object.keys(rightMatrixs).length; i++) {
            const matrix = new THREE.Matrix4();
            let position = new THREE.Vector3(rightMatrixs[i].pX, rightMatrixs[i].pY, rightMatrixs[i].pZ);
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3(1, 1, 1);
            matrix.compose(position, quaternion, scale);

            this.freeShadowsRight.splice(this.freeShadowsRight.indexOf(i), 1);
            this.usedRightList.set(coordinatesToId(rightMatrixs[i].pX, rightMatrixs[i].pZ, mapWidth), i);
            this.instancedMeshForRight.setMatrixAt(i, matrix);
        }
        for (let i = 0; i < Object.keys(aboveMatrixs).length; i++) {
            const matrix = new THREE.Matrix4();
            let position = new THREE.Vector3(aboveMatrixs[i].pX, aboveMatrixs[i].pY, aboveMatrixs[i].pZ);
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3(1, 1, 1);
            matrix.compose(position, quaternion, scale);

            this.freeShadowsAbove.splice(this.freeShadowsAbove.indexOf(i), 1);
            this.usedAboveList.set(coordinatesToId(aboveMatrixs[i].pX, aboveMatrixs[i].pZ, mapWidth), i);
            this.instancedMeshForAbove.setMatrixAt(i, matrix);
        }
        this.instancedMeshForAbove.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
        this.instancedMeshForRight.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
    }

    createAbove(posX: number, posY = 0.01, posZ: number, mapWidth: number){
        if (this.usedAboveList.has(coordinatesToId(posX, posZ, mapWidth))){
            return;
        }
        if (this.freeShadowsAbove.length === 0) {
            console.log("Добавляем дополнительный объект в ShadowPool");
        }
        let shadow = this.freeShadowsAbove.splice(this.freeShadowsAbove.length-1, 1)[0];
        this.usedAboveList.set(coordinatesToId(posX, posZ, mapWidth), shadow);

        const matrix = new THREE.Matrix4();
        let position = new THREE.Vector3(posX, posY, posZ);
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3(1, 1, 1);
        matrix.compose(position, quaternion, scale);

        this.instancedMeshForAbove.setMatrixAt(shadow, matrix);
        this.instancedMeshForAbove.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
        this.instancedMeshForRight.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
    }

    createRight(posX: number, posY: number = 0.01, posZ: number, mapWidth: number){
        if (this.usedRightList.has(coordinatesToId(posX, posZ, mapWidth))){
            return;
        }
        if (this.freeShadowsRight.length === 0) {
            console.log("Добавляем дополнительный объект в ShadowPool");
        }
        let shadow = this.freeShadowsRight.splice(this.freeShadowsRight.length-1, 1)[0];
        this.usedRightList.set(coordinatesToId(posX, posZ, mapWidth), shadow);

        const matrix = new THREE.Matrix4();
        let position = new THREE.Vector3(posX, posY, posZ);
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3(1, 1, 1);
        matrix.compose(position, quaternion, scale);

        this.instancedMeshForRight.setMatrixAt(shadow, matrix);
        this.instancedMeshForAbove.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
        this.instancedMeshForRight.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
    }

    remove(posX: number, posZ: number, mapWidth: number){
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

