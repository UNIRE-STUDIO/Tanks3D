import BulletPool from "./bulletPool.js";
import ThreeManager from "./threeManager.js";
import { idToCoordinates, coordinatesToId } from "./general.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
//import SaveManager from "./saveManager.js";
import levels from "./levels.json";
import NpcPool from "./npcPool.js";
import PlayerTank from "./playerTank.js";
//import BangPool from "./bangPool.js";
import * as THREE from "three";

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
        this.threeManager = new ThreeManager(uiFields);

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
            this.threeManager
        );
        this.players[1] = new PlayerTank(
            this.config,
            this.bulletPool.create.bind(this.bulletPool),
            this.playerDead.bind(this),
            1,
            this.threeManager);
            
        this.npcPool = new NpcPool(this.config, this.bulletPool.create.bind(this.bulletPool), this.players, this.win.bind(this), uiFields, this.threeManager);

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

        this.timerStart;
    }

    start(playersMode = 0) {
        this.uiFields.playersMode = playersMode;
        this.uiFields.numDestroyedType0[0] = 0;
        this.uiFields.numDestroyedType0[1] = 0;
        this.uiFields.numDestroyedType1[0] = 0;
        this.uiFields.numDestroyedType1[1] = 0;
        this.reset();
        this.currentMap = [];

        // Поскольку Object.assign делает только поверхностную копию мы присваиваем каждую полосу отдельно
        for (let i = 0; i < levels[this.uiFields.currentLevel].map.length; i++) {
            this.currentMap.push(levels[this.uiFields.currentLevel].map[i].slice());
        }
        let floor1 = [];
        for (let i = 0; i < this.config.viewSize.y; i++) {
            for (let j = 0; j < this.config.viewSize.x; j++) { // Вода
                let posX = j * this.config.grid + 0.5;
                let posZ = i * this.config.grid + 0.5;
                if (this.currentMap[i][j] === 3) {
                    this.threeManager.createWater(posX, 0, posZ);
                    continue;
                }
                this.threeManager.createWater(posX, 0, posZ);
                if (this.currentMap[i][j] === 4) { // Маскировка
                    this.threeManager.createCover(posX, 1.4, posZ);
                    continue;
                }
                if (this.currentMap[i][j] === 1) {
                    this.threeManager.createBrick(posX, 0.7, posZ, j, i, this.currentMap[0].length);
                } else if (this.currentMap[i][j] === 2) {
                    this.threeManager.createBlock(posX, 0.7, posZ, j, i, this.currentMap[0].length);
                }
            }
        }

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
        this.players[0].create(
            this.currentMap,
            levels[this.uiFields.currentLevel].playerSpawnsPos[0]
        );

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
        this.uiFields.currentLevel =
            this.uiFields.currentLevel >= levels.length - 1
                ? (this.uiFields.currentLevel = 0)
                : this.uiFields.currentLevel + 1;
    }

    destructionOfTheBase() {
        this.gameOver();
    }

    update(lag) {
        if (this.isPause) return;
        this.players[0].update(lag);
        if (this.uiFields.playersMode === 1) this.players[1].update(lag);
        this.bulletPool.update(lag);
        this.npcPool.update(lag);
        // this.bangPool.update(lag);
    }

    render() {
        this.threeManager.render();
    }
}
