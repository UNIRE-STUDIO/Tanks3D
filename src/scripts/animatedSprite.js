class AnimatedSprite {
    constructor(config, frames, size, sliceSize)
    {
        this.config = config;
        this.posX = 0;
        this.posY = 0;
        this.isUse = false;
        this.duration = frames.length * 80; // ms
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
    }

    update(lag)
    {
        this.timeCounter += lag;
        if (this.timeCounter >= this.duration) this.isUse = false;
    }

    render()
    {
        let pos = {x: this.posX, y: this.posY};
        drawSliceImage(this.config.ctxMain, this.config.atlas, pos, {x:this.size, y:this.size}, this.frames[Math.floor(this.timeCounter/(this.duration/this.frames.length))], {x: this.sliceSize, y: this.sliceSize});
    }
}