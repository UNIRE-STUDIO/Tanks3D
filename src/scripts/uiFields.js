import levels from './levels.json'

export default class UIFields {
    constructor() {
        this.currentScreen = 0
        this.playersHealth = [0, 0]
        this.countReserveNpcTanks = 0 // Количество вражеских танков в резерве
        this.currentLevel = 0
        this.npc = levels[this.currentLevel].npc
        this.playersMode = 0 // 0 - 1 игрок // 1 - 2 игрока
        this.numDestroyedType0 = [0, 0]
        this.numDestroyedType1 = [0, 0]
    }
}
