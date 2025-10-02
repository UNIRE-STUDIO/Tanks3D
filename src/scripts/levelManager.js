import BulletPool from "./bulletPool.js";
import ThreeManager from "./threeManager.js";
//import SaveManager from "./saveManager.js";
import levels from "./levels.json";
import NpcPool from "./npcPool.js";
import PlayerTank from "./playerTank.js";
//import BangPool from "./bangPool.js";
import { VisualBlocks as VB } from "./config.js";
import { VisualAndPhysics } from "./config.js";
import { watch } from "vue";

export default class LevelManager {
    constructor(input, config, uiFields) {
        this.uiFields = uiFields;

        this.timeUpdate = 0;
        this.uiFields.playersHealth[0] = 3;
        this.uiFields.playersHealth[1] = 3;
        this.isPause = false;
        this.isPlay = false; // Для того что-бы коректно ставить на паузу до появления игроков

        // Присваивает класс Game
        this.gameOverEvent;
        this.winEvent;
        this.saveManager;

        this.uiFields.currentLevel = 0;
        this.physicalCurrentMap = null;
        this.visualCurrentMap = null;
        this.config = config;
        this.threeManager = new ThreeManager(uiFields, config);
        this.initAsync(input);

        this.timerStart;
    }

    async initAsync(input) {
        await this.threeManager.initAsync();
        //this.bangPool = new BangPool(this.config)
        // this.bulletPool = new BulletPool(
        //     this.config,
        //     this.removeTile.bind(this),
        //     this.destructionOfTheBase.bind(this),
        //     this.bangPool.create.bind(this.bangPool), <--------
        //     this.uiFields
        // )
        this.bulletPool = new BulletPool(
            this.config,
            this.removeTile.bind(this),
            this.destructionOfTheBase.bind(this),
            undefined, // <--------
            this.uiFields,
            this.threeManager
        );
        this.players = [];
        this.players[0] = new PlayerTank(
            this.config,
            this.bulletPool.create.bind(this.bulletPool),
            this.playerDead.bind(this),
            0,
            this.threeManager,
            this.threeManager.player1TankMesh);

        this.players[1] = new PlayerTank(
            this.config,
            this.bulletPool.create.bind(this.bulletPool),
            this.playerDead.bind(this),
            1,
            this.threeManager,
            this.threeManager.player2TankMesh);

        this.npcPool = new NpcPool(this.config, this.bulletPool.create.bind(this.bulletPool), this.players, this.win.bind(this), this.uiFields, this.threeManager);

        this.players[0].otherTanks.push(...this.npcPool.tanks);
        this.players[1].otherTanks.push(...this.npcPool.tanks);
        this.players[0].otherTanks.push(this.players[1]);
        this.players[1].otherTanks.push(this.players[0]);

        this.bulletPool.setListNpcTanks(this.npcPool.tanks);
        this.bulletPool.setListPlayers(this.players);

        input.movePlayer1Event = this.players[0].setDirection.bind(this.players[0]);
        input.shootPlayer1Event = this.players[0].shoot.bind(this.players[0]);

        input.movePlayer2Event = this.players[1].setDirection.bind(this.players[1]);
        input.shootPlayer2Event = this.players[1].shoot.bind(this.players[1]);

        input.moveCameraEvent = this.threeManager.setCameraMove.bind(this.threeManager);
    }

    start(playersMode = 0) {
        this.uiFields.playersMode = playersMode;
        this.uiFields.reset();
        this.reset();
        this.physicalCurrentMap = [];
        this.visualCurrentMap = [];
        this.config.mapSize.y = levels[this.uiFields.currentLevel].map.length;
        this.config.mapSize.x = levels[this.uiFields.currentLevel].map[0].length;

        console.log("sizeMap: " + this.config.mapSize.x + " " + this.config.mapSize.y);
        let grasses = [];
        let waters = [];
        let wallsForWater = [];
        let borders1 = [];
        let borders2 = [];
        let covers = [];
        let rightShadows = [];
        let aboveShadows = [];
        let floors = [];

        // Поскольку Object.assign делает только поверхностную копию мы присваиваем каждую полосу отдельно
        for (let y = 0; y < this.config.mapSize.y; y++) {
            this.visualCurrentMap.push(levels[this.uiFields.currentLevel].map[y].slice());

            // Создаём физическую карту на основе визуальной
            this.physicalCurrentMap.push([]);
            for (let x = 0; x < this.config.mapSize.x; x++) {
                // Получаем физический тип блока по сопоставлению VisualAndPhysics
                let physicalBlock = VisualAndPhysics[levels[this.uiFields.currentLevel].map[y][x]]
                this.physicalCurrentMap[y].push(physicalBlock)
            }
        }
        for (let i = 0; i < this.config.mapSize.y; i++) {
            for (let j = 0; j < this.config.mapSize.x; j++) {
                let currentBlock = this.visualCurrentMap[i][j];
                let toRight = this.physicalCurrentMap[i][j + 1];
                let above = i - 1 < 0 ? -1 : this.physicalCurrentMap[i - 1][j];
                if (currentBlock === VB.WATER) { // Вода
                    waters.push({pX: j, pY: -0.8, pZ: i});
                    // if (this.currentMap[i + 1] === undefined || this.currentMap[i + 1][j] !== 3)  // Ниже блока воды
                    // {
                    //     this.threeManager.createWallForWater(j, 0, i + this.config.grid);
                    // }
                    if ((i - 1) < 0 || above !== VB.WATER)                                           // Выше блока воды
                    {
                        wallsForWater.push({pX: j, pY: 0, pZ: i, rX: 0, rY: 0, rZ: 0});
                    }
                    if (toRight !== VB.WATER)                                                        // Правее блока воды
                    {
                        wallsForWater.push({pX: j + this.config.grid, pY: 0, pZ: i, rX: 0, rY: -90, rZ: 0});
                    }
                    if (j - 1 < 0 || this.physicalCurrentMap[i][j - 1] !== VB.WATER)                 // Левее блока воды
                    {
                        wallsForWater.push({pX: j, pY: 0, pZ: i + this.config.grid, rX: 0, rY: 90, rZ: 0});
                    }
                    continue;
                }
                else if (currentBlock === VB.GRASS){
                    grasses.push({pX: j, pY: 0, pZ: i}); // Собираем координаты всех плоскостей с травой
                    continue;
                }
                floors.push({pX: j, pY: 0, pZ: i});              // Пол

                // Маскировка
                if (currentBlock === VB.COVER) { covers.push({pX: j, pY: 0, pZ: i}); } 
                else if (currentBlock === VB.BRICK) {                  // Кирпич
                    this.threeManager.createBrick(j, 0, i, this.config.mapSize.x);
                } 
                else if (currentBlock === VB.STONE) {                  // Камень
                    this.threeManager.createStone(j, 0, i, this.config.mapSize.x);
                }
                else if (currentBlock === VB.BORDER1){ borders1.push({pX: j, pY: 0, pZ: i}); }
                else if (currentBlock === VB.BORDER2){ borders2.push({pX: j, pY: 0, pZ: i}); }

                // Выставляем тени
                switch (currentBlock) {
                    case VB.BRICK:
                    case VB.STONE:
                    case VB.BORDER1:
                    case VB.BORDER2:
                        // Если нет препятствий справа то ставим тень
                        if (toRight !== undefined && (toRight === VB.FLOOR || toRight === VB.WATER || toRight === VB.COVER)) {
                            rightShadows.push({pX: j, pY: 0.01, pZ: i});
                        }

                        // Если нет препятствий сверху то ставим тень
                        if (above === VB.FLOOR || above === VB.WATER || above === VB.COVER) {
                            aboveShadows.push({pX: j, pY: 0.01, pZ: i});
                        }
                        break;
                }
            }
        }
        console.log("grasses: " + grasses.length);
        console.log("waters: " +  waters.length);
        console.log("wallsForWater: " + wallsForWater.length);
        console.log("border1: " + borders1.length);
        console.log("border2: " + borders2.length);
        console.log("covers: " +  covers.length);
        console.log("rightShadows: " + rightShadows.length);
        console.log("aboveShadows: " + aboveShadows.length);
        console.log("floors: " + floors.length);
        this.threeManager.createGrasses(grasses); // TODO: переименовать create в add
        this.threeManager.createWaters(waters);
        this.threeManager.createWallsForWater(wallsForWater);
        this.threeManager.createBorders1(borders1);
        this.threeManager.createBorders2(borders2);
        this.threeManager.createCovers(covers);
        this.threeManager.createAllShadows(rightShadows, aboveShadows, this.config.mapSize.x);
        this.threeManager.createFloors(floors);
        this.threeManager.addToScene();

        this.timerStart = setTimeout(() => {
            this.delayedSpawn();
        }, 1000);
    }

    delayedSpawn() {
        let base = {
            x: levels[this.uiFields.currentLevel].basePos.x * this.config.grid,
            y: levels[this.uiFields.currentLevel].basePos.y * this.config.grid,
        };
        this.bulletPool.init(this.physicalCurrentMap, base);
        this.isPause = false;
        this.players[0].create(this.physicalCurrentMap, levels[this.uiFields.currentLevel].playerSpawnsPos[0]);

        this.players[0].setOtherCollisionObject(base);
        this.players[0].isPause = false;
        if (this.uiFields.playersMode === 1) {
            this.players[1].create(
                this.physicalCurrentMap,
                levels[this.uiFields.currentLevel].playerSpawnsPos[1]);
            this.players[1].setOtherCollisionObject(base);
            this.players[1].isPause = false;
        }
        this.npcPool.init(this.physicalCurrentMap, base);
        this.isPlay = true; // Для того что-бы коректно ставить на паузу до появления игроков
    }

    removeTile(posX, posY) {
        this.physicalCurrentMap[posY][posX] = VB.FLOOR;
        this.threeManager.removeBlock(posX, posY, this.physicalCurrentMap[0].length)

        let toLeft = this.physicalCurrentMap[posY][posX - 1];

        // Если слева есть блок то создаём от него тень
        if (toLeft === VB.BRICK || toLeft === VB.STONE) {
            this.threeManager.createShadowRight(posX - 1, posY);
        }

        let below = this.physicalCurrentMap[posY + 1] === undefined ? undefined : this.physicalCurrentMap[posY + 1][posX];

        // Если снизу есть блок то создаём от него тень  остановился тут <-------------------
        if (below === VB.BRICK || below === VB.STONE) {
            this.threeManager.createShadowAbove(posX, posY + 1);
        }
    }

    setPause() {
        this.isPause = true;
        if (!this.isPlay) {
            clearTimeout(this.timerStart);
            return;
        }
        this.players[0].setPause();
        if (this.uiFields.playersMode === 1) this.players[1].setPause();
        this.npcPool.setPause();
    }

    setResume() {
        this.isPause = false;
        if (!this.isPlay) {
            this.delayedSpawn();
            return;
        }
        this.players[0].isPause = false;
        if (this.uiFields.playersMode === 1) this.players[1].isPause = false;
        this.npcPool.setResume();
    }

    gameOver() {
        this.setPause();
        this.gameOverEvent();
    }

    win() {
        this.setPause();
        this.winEvent();
    }

    reset() {
        this.uiFields.npc = levels[this.uiFields.currentLevel].npc.slice();
        this.players[0].setReset();
        if (this.uiFields.playersMode === 1) {
            this.players[1].setReset();
            this.uiFields.playersHealth[1] = 3;
        }
        this.npcPool.setReset();
        this.bulletPool.setReset();
        this.threeManager.reset();
        // this.bangPool.setReset();
        this.uiFields.playersHealth[0] = 3;
    }

    // Принимаем от танка игрока
    playerDead(playerId) {
        this.uiFields.playersHealth[playerId]--;
        if (this.uiFields.playersHealth[0] === 0
            && (this.uiFields.playersHealth[1] === 0 || this.uiFields.playersMode === 0)) {
            this.gameOver();
            return;
        }
        if (this.uiFields.playersHealth[playerId] === 0) return;
        setTimeout(() => {
            this.players[playerId].create(this.physicalCurrentMap, levels[this.uiFields.currentLevel].playerSpawnsPos[playerId]);
        }, 2000);
    }

    nextLevel() {
        this.uiFields.currentLevel = this.uiFields.currentLevel >= levels.length - 1 ? (this.uiFields.currentLevel = 0) : this.uiFields.currentLevel + 1;
    }

    destructionOfTheBase() {
        setTimeout(() => { // Уничтожение с задержкой
            this.gameOver();
        }, 200);
    }

    update(lag) {
        if (this.isPause) return;
        this.players[0].update(lag);
        if (this.uiFields.playersMode === 1) this.players[1].update(lag);
        this.bulletPool.update(lag);
        this.npcPool.update(lag);
        this.threeManager.update(lag);
        // this.bangPool.update(lag);
    }

    render() {
        this.threeManager.render();
    }
}
