import Bullet from "./bullet.js";

export default class BulletPool
{
    constructor(config, removeTile, destructionOfTheBaseEvent, bangCreateEvent, uiFields)
    {
        this.config = config;

        const pool_size = 12;
        this.bullets = [];

        for (let i = 0; i < pool_size; i++) 
        {
            this.bullets[i] = new Bullet(this.config, removeTile, destructionOfTheBaseEvent, i, bangCreateEvent, uiFields);
        }
        for (let i = 0; i < pool_size; i++) 
        {
            this.bullets[i].bullets = this.bullets;
        }
    }

    setListNpcTanks(tanks)
    {
        for (let i = 0; i < this.bullets.length; i++) 
        {
            this.bullets[i].tanks.push(...tanks);
        }
    }
    setListPlayers(tanks)
    {
        for (let i = 0; i < this.bullets.length; i++) 
        {
            this.bullets[i].players.push(...tanks);
        }
    }
    setOtherCollisionObject(obj)
    {
        for (let i = 0; i < this.bullets.length; i++) 
        {
            this.bullets[i].setOtherCollisionObject(obj);
        }
    }

    init(currentMap, basePos)
    {
        for (let i = 0; i < this.bullets.length; i++) 
        {
            this.bullets[i].currentMap = currentMap;
            this.bullets[i].basePos = basePos;
        }
    }

    create(pos, dir, playersBullet, tankId)
    {
        for (let i = 0; i < this.bullets.length; i++) {
            if (!this.bullets[i].isUse)
            {
                this.bullets[i].create(pos, dir, playersBullet, tankId);
                return;
            }
        }
        console.log("BulletPool переполнен");
    }

    setReset()
    {
        for (let i = 0; i < this.bullets.length; i++) 
        {
            this.bullets[i].isUse = false;
        }
    }

    update(lag)
    {
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].isUse)
            {
                this.bullets[i].update(lag);
            }
        }
    }

    render()
    {
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].isUse)
            {
                this.bullets[i].render();
            }
        }
    }
}