import AnimatedSprite from './animatedSprite.ts'

export default class AnimatedSpritePool
{
    constructor(container, createAnimatedSpriteMesh, offsetsForFrames, camera, duration)
    {
        const pool_size = 6;
        this.animatedsprites = [];
        this.createAnimatedSpriteMesh = createAnimatedSpriteMesh;
        for (let i = 0; i < pool_size; i++) 
        {
            let mesh = this.createAnimatedSpriteMesh();
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

    update(lag)
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