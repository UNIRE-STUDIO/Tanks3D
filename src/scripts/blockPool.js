import * as THREE from "three";

export default class BlockPool {
    constructor(material, geometry, count = undefined, positionArray = undefined){

        this.instancedMesh = new THREE.InstancedMesh(geometry, material, count !== undefined ? count : positionArray.length);
    }

    init(positionArray){
        for (let i = 0; i < positionArray.length; i++) {
            const matrix = new THREE.Matrix4();
            matrix.setPosition(
                positionArray[i].x,
                positionArray[i].y,
                positionArray[i].z
            );
            this.instancedMesh.setMatrixAt(i, matrix);
        }
    }
}
