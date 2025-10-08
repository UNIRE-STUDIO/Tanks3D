export default class AnimatedSprite {
    constructor(mesh, config, frames, size, sliceSize)
    {
        this.mesh = mesh;
        this.config = config;
        this.posX = 0;
        this.posY = 0;
        this.isUse = false;
        this.duration = 50; // ms
        this.timeCounter = 0;

        this.frames = frames;
        this.size = size;
        this.sliceSize = sliceSize;
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
        console.log(this.mesh.material);
    }

    update(lag)
    {
        
    }

    render()
    {
       
    }
}