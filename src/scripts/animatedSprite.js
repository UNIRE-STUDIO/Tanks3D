export default class AnimatedSprite {
    constructor(mesh, frames, config, size)
    {
        this.mesh = mesh;
        this.config = config;
        this.posX = 0;
        this.posY = 0;
        this.isUse = false;
        this.duration = 400; // ms
        this.timeCounter = 0;

        this.frames = frames;
        this.size = size;
    }

    create(pos)
    {
        this.posX = pos.x - this.size/2;
        this.posY = pos.y - this.size/2;
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
    }

    render()
    {
        let frameNumber = Math.floor(this.timeCounter / (this.duration/this.frames.length))
        this.mesh.material.map.offset.set(this.frames[frameNumber].x, this.frames[frameNumber].y);
    }
}