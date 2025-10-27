import * as THREE from 'three'
import AnimatedSprite from './animatedSprite.ts'

export default class AnimatedSpritePool{
    private animatedsprites: Array<AnimatedSprite>
    
    constructor(container: THREE.Object3D, 
                createAnimatedSpriteMesh: THREE.Mesh, 
                offsetsForFrames: Array<{x: number, y: number}>,
                camera: THREE.Camera,
                duration: number){

        const pool_size: number = 6;
        
    }

}