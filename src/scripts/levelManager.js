import BulletPool from "./bulletPool.js";
import ThreeManager from "./threeManager.js";
//import SaveManager from "./saveManager.js";
import levels from "./levels.json";
import NpcPool from "./npcPool.js";
import PlayerTank from "./playerTank.js";
//import BangPool from "./bangPool.js";
import { BuildBlocks as BB} from "./config.js";

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
        this.currentMap = null;
        this.config = config;
        this.threeManager = new ThreeManager(uiFields, config);
        this.initAsync(input);

        this.timerStart;
    }

    async initAsync(input)
    {
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
        this.currentMap = [];

        // Поскольку Object.assign делает только поверхностную копию мы присваиваем каждую полосу отдельно
        for (let i = 0; i < levels[this.uiFields.currentLevel].map.length; i++) {
            this.currentMap.push(levels[this.uiFields.currentLevel].map[i].slice());
        }
        let floor1 = [];
        for (let i = 0; i < this.config.viewSize.y; i++) {
            for (let j = 0; j < this.config.viewSize.x; j++) { 
                let toRight = this.currentMap[i][j + 1];
                let above = i - 1 < 0 ? -1 : this.currentMap[i - 1][j];
                if (this.currentMap[i][j] === BB.WATER) { // Вода
                    let waterDepth = 0.8;
                    this.threeManager.createWater(j, -waterDepth, i);
                    // if (this.currentMap[i + 1] === undefined || this.currentMap[i + 1][j] !== 3)    // Ниже блока воды
                    // {
                    //     this.threeManager.createWallForWater(j, 0, i + this.config.grid);
                    // }
                    if ((i - 1) < 0 || above !== BB.WATER)                                                    // Выше блока воды
                    {
                        this.threeManager.createWallForWater(j, 0, i);
                    }
                    if (toRight !== BB.WATER)                                                                      // Правее блока воды
                    {
                        this.threeManager.createWallForWater(j + this.config.grid, 0, i, false, true);
                    }
                    if (j - 1 < 0 || this.currentMap[i][j - 1] !== BB.WATER)                                           // Левее блока воды
                    {
                        this.threeManager.createWallForWater(j, 0, i + this.config.grid, true);
                    }
                    continue;
                }
                this.threeManager.createFloor(j, 0, i);             // Пол
                if (this.currentMap[i][j] === BB.COVER) {                  // Маскировка
                    this.threeManager.createCover(j, 1.4, i);
                    continue;
                }
                if (this.currentMap[i][j] === BB.BRICK) {                  // Кирпич
                    this.threeManager.createBrick(j, 0, i, this.currentMap[0].length);

                    // Если нет препятствий справа то ставим тень
                    if (toRight !== undefined && (toRight === BB.FLOOR || toRight === BB.WATER || toRight === BB.COVER)) { 
                        this.threeManager.createShadowRight(j, i);
                    }

                    // Если нет препятствий сверху то ставим тень
                    if (above === BB.FLOOR || above === BB.WATER || above === BB.COVER) { 
                        this.threeManager.createShadowAbove(j, i);
                    }
                } else if (this.currentMap[i][j] === 2) {           // Блок
                    this.threeManager.createStone(j, 0, i, this.currentMap[0].length);

                    // Если нет препятствий справа то ставим тень
                    if (toRight !== undefined && (toRight === BB.FLOOR || toRight === BB.WATER || toRight === BB.COVER)) { 
                        this.threeManager.createShadowRight(j, i);
                    }

                    // Если нет препятствий сверху то ставим тень
                    if (above === BB.FLOOR || above === BB.WATER || above === BB.COVER) { 
                        this.threeManager.createShadowAbove(j, i);
                    }
                }
            }
        }
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
        this.bulletPool.init(this.currentMap, base);
        this.isPause = false;
        this.players[0].create(this.currentMap, levels[this.uiFields.currentLevel].playerSpawnsPos[0]);

        this.players[0].setOtherCollisionObject(base);
        this.players[0].isPause = false;
        if (this.uiFields.playersMode === 1) {
            this.players[1].create(
                this.currentMap,
                levels[this.uiFields.currentLevel].playerSpawnsPos[1]);
            this.players[1].setOtherCollisionObject(base);
            this.players[1].isPause = false;
        }
        this.npcPool.init(this.currentMap, base);
        this.isPlay = true; // Для того что-бы коректно ставить на паузу до появления игроков
    }

    removeTile(posX, posY) {
        this.currentMap[posY][posX] = 0;
        this.threeManager.removeBlock(posX, posY, this.currentMap[0].length)
        
        let toLeft = this.currentMap[posY][posX - 1];
        
        // Если слева есть блок то создаём от него тень
        if (toLeft === BB.BRICK || toLeft === BB.STONE) { 
            this.threeManager.createShadowRight(posX - 1, posY);
        }

        let below = this.currentMap[posY + 1] === undefined ? undefined : this.currentMap[posY + 1][posX];

        // Если снизу есть блок то создаём от него тень  остановился тут <-------------------
        if (below === BB.BRICK || below === BB.STONE) { 
            this.threeManager.createShadowAbove(posX, posY + 1);
        }
    }

    setPause() {
        this.isPause = true;
        if (!this.isPlay)
        {
            clearTimeout(this.timerStart);
            return;
        }
        this.players[0].setPause();
        if (this.uiFields.playersMode === 1) this.players[1].setPause();
        this.npcPool.setPause();
    }

    setResume() {
        this.isPause = false;
        if (!this.isPlay)
        {
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
            && (this.uiFields.playersHealth[1] === 0 || this.uiFields.playersMode === 0))
        {
            this.gameOver();
            return;
        }
        if (this.uiFields.playersHealth[playerId] === 0) return;
        setTimeout(() =>
        {
            this.players[playerId].create(this.currentMap, levels[this.uiFields.currentLevel].playerSpawnsPos[playerId]);
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
