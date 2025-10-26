import * as THREE from "three";

export default class AnimatedSprite {
    public isUse: boolean;

    private mesh: THREE.Mesh;
    private frames: Array<{x: number, y: number, z:number}>;
    private camera: THREE.Camera;
    private duration: number = 0;
    private timeCounter: number = 0;

    constructor(mesh: THREE.Mesh, frames: Array<{x: number, y: number, z: number}>, camera: THREE.Camera, duration: number){
        this.mesh = mesh;
        this.frames = frames;
        this.camera = camera;
        this.duration = duration;
    }

    create(pos: {x: number, y: number, z: number}){
        this.isUse = true;
        this.timeCounter = 0;
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.visible = true;
    }

    update(lag: number){
        this.timeCounter += lag;
        if (this.timeCounter >= this.duration){
            this.isUse = false;
            this.mesh.visible = false;
        }
        this.mesh.lookAt(this.camera.position);
    }
    render()
    {
        let frameNumber = Math.floor(this.timeCounter / (this.duration / this.frames.length))
        this.mesh.material.map.offset.set(this.frames[frameNumber].x, this.frames[frameNumber].y);
    }
}