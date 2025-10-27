import { drawImage, drawRect, isInside } from "./general.js";
import * as THREE from "three";
import { VisualBlocks as BB, Config } from "./config.js";
import UIFields from "./uiFields.js";

export default class Bullet {
    public posX: number = 0;
    public posY: number = 0;
    public isUse: boolean = false;
    
    private dirX: number = 0;
    private dirY: number = 0;
    private config: Config;
    private currentMap: Array<Array<Number>>;
    private basePos: {x: number, y: number};
    private id: number;
    private uiFields: UIFields;
    private checkerX: number;
    private checkerY: number;
    private checkerExtraX: number;
    private checkerExtraY: number;
    
    private readonly speed: number = 0.01 // 0.01 * this.config.grid
    private damage: number = 1;
    private bulletsPlayer: boolean = false;
    private removeTile: Function;

    constructor(){
         
    }

    setCurrentMap(map: Array<Array<Number>>){
        this.currentMap = map;
    }
    setBasePos(pos){
        this.basePos = pos;
    }
}