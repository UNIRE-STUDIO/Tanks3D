import levels from './levels.json'

export const VisualBlocks = { FLOOR: 0, BRICK: 1, STONE: 2, WATER: 3, COVER: 4 }
export const PhysicsBlocks = { FLOOR: 0, BRICK: 1, STONE: 2, WATER: 3 }
export const VisualAndBlocks = { 0: 0, 
                                 1: 1, 
                                 2: 2, 
                                 3: 3,
                                 4: 0}
export default class Config {
    constructor() {
        this.grid = 1
        this.grid2 = 2
        this.viewSize = {
            x: levels[0].map[0].length, // 34
            y: levels[0].map.length     // 20
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