import * as THREE from "three";

export default class BlockPool {
    constructor(material, geometry, count = undefined, positionArray = undefined){

        this.instancedMesh = new THREE.InstancedMesh(geometry, material, count !== undefined ? count : positionArray.length);
    }

    init(positionArray){
        for (let i = 0; i < positionArray.length; i++) {
            const matrix = new THREE.Matrix4();
            let position = new THREE.Vector3(positionArray[i].pX, positionArray[i].pY, positionArray[i].pZ)
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3(1, 1, 1);
            
            // Применяем вращение
            if (positionArray[i].rX !== undefined) 
            { 
                quaternion.setFromEuler(new THREE.Euler(
                    positionArray[i].rX * Math.PI / 180, 
                    positionArray[i].rY * Math.PI / 180, 
                    positionArray[i].rZ * Math.PI / 180
                    ));
            }
            matrix.compose(position, quaternion, scale);
            this.instancedMesh.setMatrixAt(i, matrix);
        }
    }
}
