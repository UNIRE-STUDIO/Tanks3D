import { drawImage, drawRect, isInside } from "./general.js";

export default class Bullet
{
    constructor(config, removeTile, destructionOfTheBaseEvent, id, bangCreateEvent, uiFields)
    {
        this.config = config;
        this.posX = 0;
        this.posY = 0;
        this.dirY = 0;
        this.dirX = 0;
        this.currentMap;
        this.basePos;
        this.isUse = false;
        this.id = id;
        this.uiFields = uiFields;

        this.image_up = new Image();
        this.image_up.src = "/Tanks2D/sprites/Bullet_Up.png";
        this.image_down = new Image();
        this.image_down.src = "/Tanks2D/sprites/Bullet_Down.png";
        this.image_right = new Image();
        this.image_right.src = "/Tanks2D/sprites/Bullet_Right.png";
        this.image_left = new Image();
        this.image_left.src = "/Tanks2D/sprites/Bullet_Left.png";
        
        this.speed = 0.01 * config.grid;
        this.damage = 1;
        this.bulletsPlayer = false;

        this.removeTile = removeTile;
        this.destructionOfTheBaseEvent = destructionOfTheBaseEvent;
        this.tanks = [];    // bulletPool
        this.players = [];   // bulletPool
        this.bullets = [];  // bulletPool
        this.otherCollisionObject = [];
        this.tankId;
        this.size = this.config.grid/2;
        this.bangCreateEvent = bangCreateEvent;
    }

    create(pos, dir, bulletsPlayer, tankId)
    {
        this.posX = pos.x - this.size/2;
        this.posY = pos.y - this.size/2;
        this.dirY = dir.y;
        this.dirX = dir.x;
        this.isUse = true;
        this.bulletsPlayer = bulletsPlayer;
        this.otherCollisionObject = [];
        this.tankId = tankId;
    }

    setOtherCollisionObject(obj)
    {
        this.otherCollisionObject.push(obj);
    }

    checkCollisionWithObstacle()
    {
        let tileX = Math.round((this.posX + this.size * this.dirX) / this.config.grid);
        let tileY = Math.round((this.posY + this.size * this.dirY) / this.config.grid);
        
        if (this.currentMap[tileY] === undefined
            || this.currentMap[tileY][tileX] === undefined)
        {
            return true;
        }
        
        let isCollision = false;
        let tile = this.currentMap[tileY][tileX];
        if (tile === 1 || tile === 2) // Проверяем основным датчиком
        {
            if (tile === 1) this.removeTile(tileX, tileY);
            isCollision = true;
        }
        if (this.dirY != 0 
            && this.currentMap[0][tileX - 1] !== undefined
            && (this.currentMap[tileY][tileX - 1] === 1 || this.currentMap[tileY][tileX - 1] === 2)) // Проверяем соседний блок по горизонтале
        {
            if (this.currentMap[tileY][tileX - 1] === 1) this.removeTile(tileX - 1, tileY);
            isCollision = true;
        }
        else if (this.dirX != 0 
            && this.currentMap[tileY - 1] !== undefined
            && (this.currentMap[tileY - 1][tileX] === 1 || this.currentMap[tileY - 1][tileX] === 2)) // Проверяем соседний блок по вертикали
        {
            if (this.currentMap[tileY - 1][tileX] === 1) this.removeTile(tileX, tileY - 1);
            isCollision = true;
        }
        return isCollision;
    }

    sortTanks()
    {
        for (let i = 0; i < this.tanks.length; i++) 
        {
            if (this.tanks[i].isUse)
            {
                if (!this.bulletsPlayer && i === this.tankId) continue;
                if (this.checkCollisionWithTank(this.tanks[i].position, this.config.grid2-2)) // магические числа
                {
                    if (this.bulletsPlayer) {
                        this.tanks[i].setDamage(this.damage);
                        if (this.tanks[i].isDead) {
                            if (this.tanks[i].type === 1)
                                this.uiFields.numDestroyedType1[this.tankId]++;
                            else
                                this.uiFields.numDestroyedType0[this.tankId]++;
                        }
                    }
                    return true;
                }
            }
        }
        for (let i = 0; i < this.players.length; i++) 
        {
            if (this.players[i].isUse)
            {
                if (this.bulletsPlayer && i === this.tankId) continue;
                if (this.checkCollisionWithTank(this.players[i].position, this.config.grid2-2)) // магические числа
                {
                    if (!this.bulletsPlayer) this.players[i].setDamage(this.damage);
                    return true;
                }
            }
        }
        return false;
    }

    checkCollisionWithBullets()
    {
        for (let i = 0; i < this.bullets.length; i++) 
        {
            if (i === this.id || !this.bullets[i].isUse) continue;
            let tX = Math.round((this.posX) / this.config.grid);
            let tY = Math.round((this.posY) / this.config.grid);

            let oX = Math.round((this.bullets[i].posX) / this.config.grid);
            let oY = Math.round((this.bullets[i].posY) / this.config.grid);

            if (tX === oX && tY === oY)
            {
                this.bullets[i].isUse = false;
                return true;
            }
        }
        return false;
    }

    checkCollisionWithTank(pos, size)
    {
        if (this.dirX !== 0) 
        {
            return isInside({x: this.posX, y:this.posY}, pos, size, size) 
            || isInside({x: this.posX, y:this.posY + this.size}, pos, size, size);
        }
        if (this.dirY !== 0)
        {
            return isInside({x: this.posX , y:this.posY}, pos, size, size)
            || isInside({x: this.posX + this.size, y:this.posY}, pos, size, size);
        }       
    }

    checkCollisionWithBorders()
    {
        let pX = Math.round((this.posX + this.size*2 * this.dirX) / this.config.grid);
        let pY = Math.round((this.posY + this.size*2 * this.dirY) / this.config.grid);
        
        if (pX < 0 || pX > this.config.canvas.width
         || pY < 0 || pY > this.config.canvas.height) return true;
        return false;
    }

    update(lag)
    {
        if (this.checkCollisionWithObstacle()
            || this.sortTanks()
            || this.checkCollisionWithBullets()
            || this.checkCollisionWithBorders())
        {
            this.isUse = false;     // Спауним на середине пули // Смещаем по направлению
            this.bangCreateEvent({x: this.posX + this.size/2 + this.size * this.dirX, y: this.posY + this.size/2 + this.size * this.dirY});
            return;
        }
        // Левый верхний угол пули и правый нижний угл
        if (isInside({x: this.posX, y:this.posY}, {x: this.basePos.x, y:this.basePos.y}, this.config.grid2, this.config.grid2) || 
            isInside({x: this.posX + this.size, y:this.posY + this.size}, {x: this.basePos.x, y:this.basePos.y}, this.config.grid2, this.config.grid2))
        {
            this.isUse = false;
            this.destructionOfTheBaseEvent();
            return;
        }
        
        this.posX += this.dirX * lag * this.speed;
        this.posY += this.dirY * lag * this.speed;
    }

    render()
    {
        let pos = {x: this.posX, y: this.posY};
        if (this.dirX == 1)
            drawImage(this.config.ctx, this.image_right, pos, {x:this.size, y:this.size});
        else if (this.dirX == -1)
            drawImage(this.config.ctx, this.image_left, pos, {x:this.size, y:this.size});
        else if (this.dirY == 1)
            drawImage(this.config.ctx, this.image_down, pos, {x:this.size, y:this.size});
        else if (this.dirY == -1)
            drawImage(this.config.ctx, this.image_up, pos, {x:this.size, y:this.size});
        
        // pos = {x: Math.round((this.posX - (this.dirX * this.config.grid/2)) / this.config.grid) * this.config.grid,
        //          y: Math.round((this.posY - (this.dirY * this.config.grid/2)) / this.config.grid) * this.config.grid};
        // drawRect(this.config.ctx, pos, {x:this.config.grid, y:this.config.grid}, "#fff");

        // if (this.dirY != 0) // Проверяем соседний блок по горизонтале
        // {
        //     pos = {x: pos.x - this.config.grid, y: pos.y};
        //     drawRect(this.config.ctx, pos, {x:this.config.grid, y:this.config.grid}, "#000");
        // }
        // else if (this.dirX != 0) // Проверяем соседний блок по вертикали
        // {
        //     pos = {x: pos.x, y: pos.y - this.config.grid};
        //     drawRect(this.config.ctx, pos, {x:this.config.grid, y:this.config.grid}, "#000");
        // }
    }
}