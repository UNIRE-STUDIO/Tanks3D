import levels from './levels.json'

export const VisualBlocks = { FLOOR: 0, BRICK: 1, STONE: 2, WATER: 3, COVER: 4, BORDER: 5, BASE: 9}
export const PhysicsBlocks = { FLOOR: 0, BRICK: 1, STONE: 2, WATER: 3, BASE: 9}
export const VisualAndPhysics = {0: 0, 
                                 1: 1, 
                                 2: 2, 
                                 3: 3,
                                 4: 0,
                                 5: 2,
                                 9: 9}
export default class Config {
    constructor() {
        this.grid = 1
        this.grid2 = 2
        this.viewSize = {
            x: 36, // 34
            y: 20     // 20
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