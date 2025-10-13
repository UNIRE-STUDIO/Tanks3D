export default class AnimatedSprite {
    constructor(mesh, frames, camera, duration)
    {
        this.mesh = mesh;
        this.camera = camera;
        this.posX = 0;
        this.posY = 0;
        this.isUse = true;
        this.duration = duration; // ms
        this.timeCounter = 0;

        this.frames = frames;
    }

    create(pos)
    {
        this.posX = pos.x;
        this.posY = pos.y;
        this.isUse = true;
        this.timeCounter = 0;
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.visible = true;
        this.mesh.needsUpdate = true;
    }

    update(lag)
    {
        this.timeCounter += lag;
        if (this.timeCounter >= this.duration){
            this.isUse = false;
            this.mesh.visible = false;
        }
        this.mesh.lookAt(this.camera.position);
    }

    render()
    {
        let frameNumber = Math.floor(this.timeCounter / (this.duration/this.frames.length))
        this.mesh.material.map.offset.set(this.frames[frameNumber].x, this.frames[frameNumber].y);
    }
}