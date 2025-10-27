import * as THREE from 'three'
import AnimatedSprite from './animatedSprite'

export default class AnimatedSpritePool{
    private animatedsprites: Array<AnimatedSprite>
    
    constructor(container: THREE.Object3D, 
                createAnimatedSpriteMesh: Function, 
                offsetsForFrames: Array<{x: number, y: number}>,
                camera: THREE.Camera,
                duration: number){

        const pool_size: number = 6;
        this.animatedsprites = [];
        for (let i = 0; i < pool_size; i++) 
        {
            let mesh: THREE.Mesh = createAnimatedSpriteMesh();
            mesh.visible = false;
            container.add(mesh);
            this.animatedsprites[i] = new AnimatedSprite(mesh, offsetsForFrames, camera, duration);
        }
    }

    create(pos)
    {
        for (let i = 0; i < this.animatedsprites.length; i++) {
            if (!this.animatedsprites[i].isUse)
            {
                this.animatedsprites[i].create(pos);
                return;
            }
        }
        console.log("BangPool переполнен");
    }

    setReset()
    {

    }

    update(lag: number)
    {
        for (let i = 0; i < this.animatedsprites.length; i++) {
            if (this.animatedsprites[i].isUse)
            {
                this.animatedsprites[i].update(lag);
            }
        }
    }

    render()
    {
        for (let i = 0; i < this.animatedsprites.length; i++) {
            if (this.animatedsprites[i].isUse)
            {
                this.animatedsprites[i].render();
            }
        }
    }

}