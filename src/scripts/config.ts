import levels from './levels.json'

export const VisualBlocks = { FLOOR: 0, BRICK: 1, STONE: 2, WATER: 3, COVER: 4, BORDER1: 5, BORDER2: 6, GRASS: 7, BASE: 9}
export const PhysicsBlocks = { FLOOR: 0, BRICK: 1, STONE: 2, WATER: 3, BASE: 9}
export const VisualAndPhysics = {0: 0, 
                                 1: 1, 
                                 2: 2, 
                                 3: 3,
                                 4: 0,
                                 5: 2,
                                 6: 2,
                                 7: 0,
                                 9: 9}
export default class Config {
    public grid: number;
    public grid2: number;
    public arenaSize: {x: number, y: number};
    public mapSize: {x: number, y: number};

    constructor() {
        this.grid = 1
        this.grid2 = 2
        this.arenaSize = {
            x: 34,    // 34
            y: 20     // 20
        }
        this.mapSize = {
            x: 0,
            y: 0
        }

    }
}

/*          X
    —————————▶
    |
    |
    |
    ▼ Z (Y)
    Координаты карты
*/