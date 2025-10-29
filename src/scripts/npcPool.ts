import { randomRange } from "./general";
import levels from "./levels.json";
import NpcTank from "./npcTank";
import Timer from "./timer.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import Config from "./config";
import UIFields from "./uiFields";
import PlayerTank from "./playerTank";
import ThreeManager from "./ThreeManager";

export default class NpcPool {
    private config: Config;
    private currentMap: Array<Array<number>>;
    private currentLevel: number;
    private uiFields: UIFields;
    private countNpcTanks = 0;
    private tanks: Array<NpcTank> = [];
    private npcModels: Array<THREE.Object3D> = [];
    private cooldown: number = 2;
    private timerSpawn = new Timer(this.cooldown, this.create.bind(this));
    private basePos: {x: number, y: number};
    private winEvent: Function;

    constructor(config: Config, createBullet: Function, players: PlayerTank, winEvent: Function, uiFields: UIFields, threeManager: ThreeManager, bangCreateEvent: Function) {
        this.config = config;
        this.uiFields = uiFields;
        this.uiFields.countReserveNpcTanks = 0;

        const pool_size = 5; // Одновременное кол-во нпс на карте
        
        let urlModels = [
            '/models/npcTank1.glb'    // 0
        ]
        //this.npcTank2;
        const gltfLoader = new GLTFLoader()
        gltfLoader.load(urlModels[0], (gltf) => {
            this.npcModels[0] = gltf.scene.children[0];
            this.npcModels[0].material.map.minFilter = THREE.LinearFilter;
        })
        // gltfLoader.load(urlModels[1], (gltf) => {
        //     this.npcTank2 = gltf.scene.children[0]
        //     this.npcTank2.material.map.minFilter = THREE.LinearFilter
        // })

        for (let i = 0; i < pool_size; i++) {
            this.tanks[i] = new NpcTank(this.config, createBullet, threeManager, players, this.deadNpcEvent.bind(this), i, bangCreateEvent);
        }
        for (let i = 0; i < pool_size; i++) {
            this.tanks[i].otherTanks.push(...this.tanks);
            this.tanks[i].otherTanks.splice(i, 1);
        }

        this.winEvent = winEvent;
    }

    init(currentMap: Array<Array<number>>, basePos: {x: number, y: number}) {
        this.currentMap = currentMap;
        this.currentLevel = this.uiFields.currentLevel;
        this.basePos = basePos;
        this.uiFields.countReserveNpcTanks = levels[this.currentLevel].npc.length;
        this.countNpcTanks = levels[this.currentLevel].npc.length;
        this.timerSpawn.reset();
        this.timerSpawn.start();
    }

    setOtherCollisionObject(obj: {x: number, y: number}) {
        for (let i = 0; i < this.tanks.length; i++) 
        {
            this.tanks[i].setOtherCollisionObject(obj);
        }
    }

    create() {
        if (this.uiFields.countReserveNpcTanks === 0) {
            this.timerSpawn.stop();
            this.timerSpawn.reset();
            return;
        }
        for (let i = 0; i < this.tanks.length; i++) {
            if (!this.tanks[i].isUse) 
            {
                let rand = randomRange(0, levels[this.currentLevel].spawnPoints.length);
                this.tanks[i].create(this.currentMap,
                                    { x: levels[this.currentLevel].spawnPoints[rand][0], y: levels[this.currentLevel].spawnPoints[rand][1] },
                                    this.basePos,
                                    this.uiFields.playersMode,
                                    this.uiFields.npc[0]); // Отправляем исходную модель

                this.uiFields.countReserveNpcTanks--;
                this.uiFields.npc.splice(0, 1);
                this.timerSpawn.reset();
                this.timerSpawn.start();
                return;
            }
        }
        this.timerSpawn.reset();
    }

    setPause() {
        this.timerSpawn.stop();
        for (let i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].isUse) {
                this.tanks[i].setPause();
            }
        }
    }
    setResume() {
        this.timerSpawn.start();
        for (let i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].isUse) {
                this.tanks[i].setResume();
            }
        }
    }

    setReset() {
        this.timerSpawn.stop();
        this.timerSpawn.reset();
        for (let i = 0; i < this.tanks.length; i++) {
            this.tanks[i].isUse = false;
            this.tanks[i].setReset();
        }
    }

    deadNpcEvent() {
        this.countNpcTanks--
        if (this.countNpcTanks === 0) {
            this.winEvent();
        }
    }

    update(lag: number) {
        for (let i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].isUse) {
                this.tanks[i].update(lag);
            }
        }
    }
}