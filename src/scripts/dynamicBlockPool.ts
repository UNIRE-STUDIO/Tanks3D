import * as THREE from "three";
import { coordinatesToId } from "./general";
import StaticBlockPool from "./staticBlockPool";

export default class DynamicBlockPool extends StaticBlockPool {
    private freeBlocks: Array<number>
    private usedBlocks: Map<number, number>

    constructor(material, geometry, count = undefined) {
        super(material, geometry, count)
        this.freeBlocks = [];        // От сюда мы берём блоки для создания на карте
        this.usedBlocks = new Map(); // От сюда мы берём блоки для удаления с карты
    }

    // mapWidth нельзя сделать на уровне класса, так как размер карты может меняться
    override init(matrixs: {pX: number, pY: number, pZ: number, rX: number, rY: number, rZ: number}, mapWidth: number): void {
        for (let i = 0; i < this.count; i++) { 
            this.instancedMesh.setMatrixAt(i, this.zeroMatrix);
            this.instancedMesh.setMatrixAt(i, this.zeroMatrix);
        }
        for (let i = 0; i < Object.keys(matrixs).length; i++) {
            let matrix = new THREE.Matrix4();
            let position = new THREE.Vector3(matrixs[i].pX, matrixs[i].pY, matrixs[i].pZ);
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3(1, 1, 1);
            matrix.compose(position, quaternion, scale);
            this.usedBlocks.set(coordinatesToId(matrixs[i].pX, matrixs[i].pZ, mapWidth), i);
            this.instancedMesh.setMatrixAt(i, matrix);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
    }

    remove(posX, posZ, mapWidth){
        let id = this.usedBlocks.get(coordinatesToId(posX, posZ, mapWidth));
        if (id){
            this.instancedMesh.setMatrixAt(id, this.zeroMatrix);
            this.usedBlocks.delete(coordinatesToId(posX, posZ, mapWidth));
            this.instancedMesh.instanceMatrix.needsUpdate = true; // После обработки флаг сбрасывается
        }
    }
}
