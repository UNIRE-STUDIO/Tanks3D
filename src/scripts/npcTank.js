import { randomRange, coordinatesToId, idToCoordinates } from "./general.js";
import Tank from "./tank.js";
import Timer from "./timer.js";

export default class NpcTank extends Tank {
    constructor(config, spawnBullet, players, deadNpcEvent, id, threeManager) {
        super(config, spawnBullet, id);
        this.npcId = id;
        this.dirY = 1;
        this.speed = 0.003 * config.grid;
        this.isDead = false;
        this.timeOfModeChange = 15; // 23 Длительность режима в секундах

        this.isBlockTurn = false;
        this.drivingMode = 0; // 0 =

        this.players = players;
        this.deadNpcEvent = deadNpcEvent;
        this.playersMode; // npcPool -> Create

        // ПОИСК | Это всё нужно обнулять
        this.stack = [];
        this.visited = [];
        this.whereFrom = new Map();
        this.path = [];
        this.target = [];
        this.currentPosOnPath = 0; // Позиция на пути к цели

        this.sides = [[-2, 0], // слева
                      [0, -2], // сверху
                      [2, 0],  // справа
                      [0, 2]]; // снизу

        this.timerDrivingMode = new Timer(this.timeOfModeChange, this.changeMode.bind(this));

        this.timerOfJamming = 0; // Застревание
        this.minTimeWaitOfJamming = 100;
        this.maxTimeWaitOfJamming = 800;
        this.timeWaitOfJamming = randomRange(this.minTimeWaitOfJamming, this.maxTimeWaitOfJamming);

        this.minCooldownTime = 1;
        this.maxCooldownTime = 5;
        this.timerShoot = new Timer(randomRange(this.minCooldownTime, this.maxCooldownTime), this.randomShoot.bind(this), 0.1);

        this.basePos; // npcPool
        this.type = 0;
    }

    create(currentMap, pos, basePos, playersMode, type, originModel) {
        this.model = this.threeManager.createNpcTank();
        super.create(currentMap, pos);
        this.type = type;

        if (type === 0) {
            this.maxTimeWaitOfJamming = 300;
            this.speed = 0.003 * this.config.grid;
        }
        else {
            this.maxTimeWaitOfJamming = 800;
            this.speed = 0.0045 * this.config.grid;
        }
        this.health = 1;
        this.moveX = this.dirX;
        this.moveY = this.dirY;
        this.drivingMode = 0;
        this.basePos = basePos;
        this.timerDrivingMode.reset();
        this.timerDrivingMode.start();
        this.timerShoot.reset();
        this.timerShoot.start();
        this.playersMode = playersMode;
        this.isDead = false;
    }

    setReset() {
        this.isUse = false;
        if (this.model !== undefined) this.model.visible = false;
        this.timerDrivingMode.stop();
        this.timerDrivingMode.reset();
        this.drivingMode = 0;
        this.timerShoot.reset();
        this.timerShoot.stop();
    }

    setPause() {
        this.timerShoot.stop();
        this.timerDrivingMode.stop();
    }

    setResume() {
        this.timerShoot.start();
        this.timerDrivingMode.start();
    }

    changeMode() {
        this.timerDrivingMode.reset();
        this.timerDrivingMode.start();
        this.drivingMode = this.drivingMode === 0 ? randomRange(1, 3) : 0; // Если предыдущий режим был случайным перемещением, то включаем поиск и наоборот
        this.timerOfJamming = 0;
        let id = randomRange(0, 2);
        let nearBasePos;
        if (this.playersMode === 0) id = 0; // Если одиночный режим, то ищем только первого игрока
        switch (this.drivingMode) {
            case 1:
                this.search([Math.round(this.players[id].position.x / this.config.grid), Math.round(this.players[id].position.y / this.config.grid)]);
                break;

            case 2:
                nearBasePos = this.searchForFreeSpaceNearTheBase();
                if (nearBasePos === undefined) {
                    this.changeMode();
                    return;
                }
                this.search(nearBasePos);
                break;
            default:
                this.path = [];
                break;
        }
    }

    getAvailableDirections() {
        let dirs = [];

        if (this.dirY != 0) {
            let rightX = Math.ceil((this.position.x + this.config.grid2) / this.config.grid);
            let rightY = Math.ceil(this.position.y / this.config.grid);

            let leftX = Math.ceil((this.position.x - this.config.grid) / this.config.grid);
            let leftY = rightY;

            if (this.currentMap[rightY] !== undefined  // поворот направо
                && this.currentMap[rightY][rightX] !== undefined
                && this.currentMap[rightY + 1] !== undefined
                && (this.currentMap[rightY][rightX] === 0 || this.currentMap[rightY][rightX] === 4)
                && (this.currentMap[rightY + 1][rightX] === 0 || this.currentMap[rightY + 1][rightX] === 4)) {
                dirs.push([1, 0]);
            }
            if (this.currentMap[leftY] !== undefined // поворот налево
                && this.currentMap[leftY][leftX] !== undefined
                && this.currentMap[leftY + 1] !== undefined
                && (this.currentMap[leftY][leftX] === 0 || this.currentMap[leftY][leftX] === 4)
                && (this.currentMap[leftY + 1][leftX] === 0 || this.currentMap[leftY + 1][leftX] === 4)) {
                dirs.push([-1, 0]);
            }
        }
        else if (this.dirX != 0) {
            let downX = Math.ceil(this.position.x / this.config.grid);
            let downY = Math.ceil((this.position.y + this.config.grid2) / this.config.grid);

            let upX = downX;
            let upY = Math.ceil((this.position.y - this.config.grid) / this.config.grid);

            if (this.currentMap[downY] !== undefined  // поворот вниз
                && this.currentMap[downY][downX] !== undefined
                && this.currentMap[downY][downX + 1] !== undefined
                && (this.currentMap[downY][downX] === 0 || this.currentMap[downY][downX] === 4)
                && (this.currentMap[downY][downX + 1] === 0 || this.currentMap[downY][downX + 1] === 4)) {
                dirs.push([0, 1]);
            }
            if (this.currentMap[upY] !== undefined  // поворот вверх
                && this.currentMap[upY][upX] !== undefined
                && this.currentMap[upY][upX + 1] !== undefined
                && (this.currentMap[upY][upY] === 0 || this.currentMap[upY][upY] === 4)
                && (this.currentMap[upY][upY + 1] === 0 || this.currentMap[upY][upY + 1] === 4)) {
                dirs.push([0, -1]);
            }
        }

        return dirs;
    }

    tryTurn() {
        let dirs = this.getAvailableDirections();
        if (randomRange(0, 7) === 0 || dirs.length === 0) // разворачиваемся по вероятности или при отсутствии доступного пространства
        {
            this.setDirection(-this.dirX, -this.dirY);
            return;
        }
        let rand = randomRange(0, dirs.length);
        this.setDirection(dirs[rand][0], dirs[rand][1]);
    }

    tryTurnAnywhere() {
        let dirs = [];

        if (this.dirY != 0) {
            let rightX = Math.round((this.position.x + this.config.grid * 2) / this.config.grid);
            let rightY = Math.round(this.position.y / this.config.grid);

            let leftX = Math.round((this.position.x - this.config.grid) / this.config.grid);
            let leftY = rightY;

            if (this.currentMap[rightY] !== undefined
                && this.currentMap[rightY][rightX] !== undefined
                && this.currentMap[rightY + 1] !== undefined) {
                dirs.push([1, 0]);
            }

            if (this.currentMap[leftY] !== undefined
                && this.currentMap[leftY][leftX] !== undefined
                && this.currentMap[leftY + 1] !== undefined) {
                dirs.push([-1, 0]);
            }
        }
        else if (this.dirX != 0) {
            let downX = Math.round(this.position.x / this.config.grid);
            let downY = Math.round((this.position.y + this.config.grid2) / this.config.grid);

            let upX = downX;
            let upY = Math.round((this.position.y - this.config.grid) / this.config.grid);

            if (this.currentMap[downY] !== undefined
                && this.currentMap[downY][downX] !== undefined
                && this.currentMap[downY][downX + 1] !== undefined) {
                dirs.push([0, 1]);
            }
            if (this.currentMap[upY] !== undefined
                && this.currentMap[upY][upX] !== undefined
                && this.currentMap[upY][upX + 1] !== undefined) {
                dirs.push([0, -1]);
            }
        }
        if (randomRange(0, 6) == 0) // разворачиваемся по вероятности или при отсутствии доступного пространства
        {
            this.setDirection(-this.dirX, -this.dirY);
            return;
        }
        let rand = randomRange(0, dirs.length);
        this.setDirection(dirs[rand][0], dirs[rand][1]);
    }

    checkCollisionWithPlayers()
    {
        return this.players[0].isUse && this.checkCollisionWithObject(this.players[0].position)
        || (this.playersMode === 1 && this.players[1].isUse && this.checkCollisionWithObject(this.players[1].position))
    }

    randomMove(lag) {
        let incrementX = this.dirX * lag * this.speed;
        let incrementY = this.dirY * lag * this.speed;

        if (!this.checkCollisionWithObstacle()
            && !this.sortOtherTanks()
            && !this.checkCollisionWithPlayers()
            && !this.sortOtherObjects()) // Игрока можно обрабатывать отдельно
        {
            this.position.x += incrementX;
            this.position.y += incrementY;
        }
        if (this.checkCollisionWithObstacle()
            || this.sortOtherTanks()) // Только когда танк упирается в эти сущности мы считаем застревание и меняем направление танка
        {
            this.timerOfJamming += lag;
            if (this.timerOfJamming >= this.timeWaitOfJamming) // Если мы застряли дольше определенного времени
            {
                this.timeWaitOfJamming = randomRange(this.minTimeWaitOfJamming, this.maxTimeWaitOfJamming); // Время следующего застревания
                this.timerOfJamming = 0;
                this.tryTurn();
            }
            return;
        }
        if (this.checkCollisionWithObject(this.players[0].position)
            || (this.playersMode === 1 && this.checkCollisionWithObject(this.players[1].position))) {
            this.timerOfJamming += lag;
            if (this.timerOfJamming >= 700) // Если мы застряли дольше определенного времени
            {
                this.tryShoot();
            }
            if (this.timerOfJamming >= 900) // Если мы застряли дольше определенного времени
            {
                this.timerOfJamming = 0;
                this.tryTurn();
            }
            return;
        }

        if (Math.floor((this.position.x - incrementX) / this.config.grid2) != Math.floor(this.position.x / this.config.grid2)
            || Math.floor((this.position.y - incrementY) / this.config.grid2) != Math.floor(this.position.y / this.config.grid2)
            && !this.isBlockTurn) 
        {
            if (randomRange(0, 8) === 0) 
            {
                this.tryTurnAnywhere();
            }
            else {
                let dirs = this.getAvailableDirections();
                if (dirs.length > 0 && randomRange(0, 3) === 0) {
                    let rand = randomRange(0, dirs.length);
                    this.setDirection(dirs[rand][0], dirs[rand][1]);
                }
            }

            this.isBlockTurn = true;
            setTimeout(() => { this.isBlockTurn = false }, 1000);
        }
    }

    movingTowardsTheGoal(lag) {
        let accuracy = this.config.grid/2; // Точность
        let posOnPath = idToCoordinates(this.path[this.currentPosOnPath], this.currentMap[0].length);
        posOnPath.x *= this.config.grid;
        posOnPath.y *= this.config.grid;
        let distX = Math.abs(posOnPath.x - this.position.x) < accuracy ? 0 : posOnPath.x - this.position.x;
        let distY = Math.abs(posOnPath.y - this.position.y) < accuracy ? 0 : posOnPath.y - this.position.y;
        let newDirX = distX > 0 ? 1 : (distX < 0 ? -1 : 0);
        let newDirY = distY > 0 ? 1 : (distY < 0 ? -1 : 0);

        if (this.dirX != this.newDirX || this.dirY != this.newDirY) 
        {
            this.setDirection(newDirX, newDirY);
        }

        let incrementX = this.dirX * lag * this.speed;
        let incrementY = this.dirY * lag * this.speed;

        if (this.sortOtherTanks()) 
        {
            this.timerOfJamming += lag;
            if (this.timerOfJamming >= 1000) // Если мы застряли дольше определенного времени
            {
                this.timerOfJamming = 0;
                this.changeMode();
            }
            return;
        }

        if (this.checkCollisionWithPlayers()) 
        {
            this.timerOfJamming += lag;
            if (this.timerOfJamming >= 1500) this.tryShoot(); // Если мы застряли дольше определенного времени
            if (this.timerOfJamming >= 2000) // Если мы застряли дольше определенного времени
            {
                this.timerOfJamming = 0;
                this.changeMode();
            }
            return;
        }
        this.position.x += incrementX;
        this.position.y += incrementY;

        if (Math.abs(posOnPath.x - this.position.x) < accuracy
            && Math.abs(posOnPath.y - this.position.y) < accuracy) {

            this.currentPosOnPath++;
            if (this.currentPosOnPath >= this.path.length) {
                // Завершаем путь
                if (this.drivingMode === 2) // Поворачиваем в сторону базы
                {
                    let distX = Math.floor((this.basePos.x - this.position.x) / this.config.grid2);
                    let distY = Math.floor((this.basePos.y - this.position.y) / this.config.grid2);

                    this.setDirection(distX === 0 ? 0 : distX > 0 ? 1 : -1, distY === 0 ? 0 : distY > 0 ? 1 : -1);
                }
                this.tryShoot();
                this.changeMode();
            }
        }
    }

    search(target) {
        this.target = target; // Обнуление
        this.path = [];
        this.stack = [];
        this.visited = [];
        this.whereFrom.clear();
        this.currentPosOnPath = 1;

        this.identifyPrioritiesSides(); // Выбираем приоритетные направления поиска
        this.depthFirstSearch({ x: Math.round(this.position.x / this.config.grid), y: Math.round(this.position.y / this.config.grid) });
    }

    identifyPrioritiesSides() {
        let distX = this.target[0] * this.config.grid - this.position.x;
        let distY = this.target[1] * this.config.grid - this.position.y;
        // По горизонтали ближе
        if (Math.abs(distX) < Math.abs(distY)) {

            this.sides[3] = [distX < 0 ? -1 : 1, 0]; // Приоритеты должный идти с конца
            this.sides[2] = [0, distY < 0 ? -1 : 1]; // так как при поиске соседних клеток
            this.sides[1] = [distX < 0 ? 1 : -1, 0]; // выбор начинается с последней
            this.sides[0] = [0, distY < 0 ? 1 : -1];
        }
        else // По вертикали ближе
        {
            this.sides[3] = [0, distY < 0 ? -1 : 1];
            this.sides[2] = [distX < 0 ? -1 : 1, 0];
            this.sides[1] = [0, distY < 0 ? 1 : -1];
            this.sides[0] = [distX < 0 ? 1 : -1, 0];
        }
    }

    saveWhereFrom(currentId, neighboringId) {
        // Запоминаем откуда мы нашли эту клетку
        if (!this.whereFrom.has(neighboringId))
            this.whereFrom.set(neighboringId, currentId);
    }

    depthFirstSearch(pos) {
        let l = this.currentMap[0].length;
        this.visited.push(coordinatesToId(pos.x, pos.y, l));
        if (pos.x == this.target[0] && pos.y == this.target[1]
            || pos.x + 1 == this.target[0] && pos.y == this.target[1]
            || pos.x == this.target[0] && pos.y + 1 == this.target[1]
            || pos.x + 1 == this.target[0] && pos.y + 1 == this.target[1]
        ) // Дошли до цели
        {
            this.path.push(coordinatesToId(pos.x, pos.y, l));
            while (this.visited[0] !== this.path[this.path.length - 1]) // Если дошли до старотовой позиции
            {
                this.path.push(this.whereFrom.get(this.path[this.path.length - 1]));
            }
            this.path.reverse();
            return;
        }

        let x = 0;
        let y = 0;
        let priority = [];
        for (let i = 0; i < 4; i++) {
            x = pos.x + this.sides[i][0];
            y = pos.y + this.sides[i][1];
            let getId = coordinatesToId(x, y, l); // Соседняя клетка
            if (this.currentMap[y] !== undefined
                && this.currentMap[y][x] !== undefined
                && this.currentMap[y + 1] !== undefined
                && this.currentMap[y + 1][x + 1] !== undefined
                && (this.currentMap[y][x] === 0 || this.currentMap[y][x] == 4) // Можно изменять карту саму карту для NPC 4 = 0
                && (this.currentMap[y][x + 1] === 0 || this.currentMap[y][x + 1] === 4)
                && (this.currentMap[y + 1][x] === 0 || this.currentMap[y + 1][x] === 4)
                && (this.currentMap[y + 1][x + 1] === 0 || this.currentMap[y + 1][x + 1] === 4)
                && !this.visited.includes(getId)) {
                if (!this.stack.includes(getId)) // Если клетка НЕ находится в очереди ставим её в приоритет
                {
                    this.saveWhereFrom(coordinatesToId(pos.x, pos.y, l), getId); // Сохраняем, что-бы в последствии построить "прямой" путь
                    priority.push(getId);
                    continue;
                }
                this.saveWhereFrom(coordinatesToId(pos.x, pos.y, l), getId);
                this.stack.push(getId);          // Если клетка находится в очереди добавляем её обычным образом
            }
        }
        this.stack.push(...priority);
        if (this.stack.length === 0) // Если поиск зашёл в тупик
        {
            this.changeMode();
            return;
        }
        this.depthFirstSearch(idToCoordinates(this.stack.pop(), l));
    }

    setDamage(damage) {
        this.health = this.health - damage <= 0 ? 0 : this.health - damage;
        if (this.health === 0) {
            this.isDead = true;
            setTimeout(() => { // Уничтожение с задержкой
                this.setReset();
                this.deadNpcEvent();
            }, 300);
        }
    }

    tryShoot() {
        if (this.timerShoot.elapsed > 0.4) // Время с последнего выстрела
        {
            this.randomShoot();
        }
    }

    randomShoot() {
        this.shoot();
        this.timerShoot.seconds = randomRange(this.minCooldownTime, this.maxCooldownTime);
        this.timerShoot.reset();
        this.timerShoot.start();
    }

    shoot() {
        if (this.isPause || !this.isUse || this.isDead) return;
        let centerPos = {
            x: this.position.x + this.config.grid2 / 2 + (this.config.grid2 / 2 * this.dirX),
            y: this.position.y + this.config.grid2 / 2 + (this.config.grid2 / 2 * this.dirY)
        };
        this.spawnBullet(centerPos, { x: this.dirX, y: this.dirY }, false, this.npcId);
    }

    searchForFreeSpaceNearTheBase() {
        let dirs = [];
        for (let i = 0; i < 3; i++) {
            let dir = [[-2 - i, 0], [0, -2 - i], [2 + i, 0], [0, 2 + i]]; // лево, верх, право, низ
            for (let j = 0; j < dir.length; j++) {
                let posX = this.basePos.x / this.config.grid + dir[j][0];
                let posY = this.basePos.y / this.config.grid + dir[j][1];

                if (this.currentMap[posY] !== undefined
                    && this.currentMap[posY + 1] !== undefined
                    && this.currentMap[posY][posX] !== undefined
                    && this.currentMap[posY][posX + 1] !== undefined
                    && (this.currentMap[posY][posX] === 0 || this.currentMap[posY][posX] === 4)
                    && (this.currentMap[posY][posX + 1] === 0 || this.currentMap[posY][posX + 1] === 4)
                    && (this.currentMap[posY + 1][posX] === 0 || this.currentMap[posY + 1][posX] === 4)
                    && (this.currentMap[posY + 1][posX + 1] === 0 || this.currentMap[posY + 1][posX + 1] === 4)) {
                    dirs.push([posX, posY]);
                }
            }
        }

        if (dirs.length === 0) return undefined;

        return dirs[randomRange(0, dirs.length)];
    }

    update(lag) {
        if (!this.isUse || this.isDead) return;
        super.update(lag)
        this.moveX = this.dirX;
        this.moveY = this.dirY;
        if (this.drivingMode === 0) 
        {
            this.randomMove(lag);
        }
        else 
        {
            this.movingTowardsTheGoal(lag);
        }
        this.model.position.x = this.position.x + this.config.grid
        this.model.position.z = this.position.y + this.config.grid
    }
}