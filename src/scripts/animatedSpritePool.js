import Bang from "./bang.js";
import { getPosOnSliceImage } from "./general.js";

export default class AnimatedSpritePool
{
    constructor(config, bangSize, sliceSize = 16, frames)
    {
        this.frames = frames;

        const pool_size = 6;
        this.bangs = [];

        for (let i = 0; i < pool_size; i++) 
        {
            this.bangs[i] = new Bang(config, this.frames, bangSize, sliceSize);
        }
    }

    create(pos)
    {
        for (let i = 0; i < this.bangs.length; i++) {
            if (!this.bangs[i].isUse)
            {
                this.bangs[i].create(pos);
                return;
            }
        }
        console.log("BangPool переполнен");
    }

    setReset()
    {
        for (let i = 0; i < this.bangs.length; i++) 
        {
            this.bangs[i].isUse = false;
        }
    }

    update(lag)
    {
        for (let i = 0; i < this.bangs.length; i++) {
            if (this.bangs[i].isUse)
            {
                this.bangs[i].update(lag);
            }
        }
    }

    render()
    {
        for (let i = 0; i < this.bangs.length; i++) {
            if (this.bangs[i].isUse)
            {
                this.bangs[i].render();
            }
        }
    }
}