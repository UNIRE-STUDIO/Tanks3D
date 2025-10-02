import * as THREE from "three";

export default class BlockPool {
    constructor(material, geometry, count = undefined, positionArray = undefined){
        this.count = count;
        this.zeroMatrix = new THREE.Matrix4().set(
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0, 
            0, 0, 0, 0
        );

        this.instancedMesh = new THREE.InstancedMesh(geometry, material, count !== undefined ? count : positionArray.length);
    }

    init(matrixs){
        
        // Обнуляем 
        for (let i = 0; i < this.count; i++) { this.instancedMesh.setMatrixAt(i, this.zeroMatrix); }

        for (let i = 0; i < matrixs.length; i++) {
            const matrix = new THREE.Matrix4();
            let position = new THREE.Vector3(matrixs[i].pX, matrixs[i].pY, matrixs[i].pZ)
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3(1, 1, 1);
            
            // Применяем вращение
            if (matrixs[i].rX !== undefined) 
            { 
                quaternion.setFromEuler(new THREE.Euler(
                    matrixs[i].rX * Math.PI / 180, 
                    matrixs[i].rY * Math.PI / 180, 
                    matrixs[i].rZ * Math.PI / 180
                    ));
            }
            matrix.compose(position, quaternion, scale);
            this.instancedMesh.setMatrixAt(i, matrix);
        }
    }
}
