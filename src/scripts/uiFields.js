import levels from './levels.json'

export default class UIFields {
    constructor() {
        this.currentScreen = 0
        this.playersHealth = [0, 0]
        this.countReserveNpcTanks = 0 // Количество вражеских танков в резерве
        this.currentLevel = 0
        this.npc = levels[this.currentLevel].npc
        this.playersMode = 0 // 0 - 1 игрок // 1 - 2 игрока
        this.numDestroyedTypes = [0, 0]
    }

    reset()
    {
        this.numDestroyedTypes = [[0,0],[0,0]];
    }

    getScoreForType(type, playerId)
    {
        return this.numDestroyedTypes[type][playerId] * 100 + this.numDestroyedTypes[type][playerId] * type * 50; //type0 - 100, type1 - 150, type2 - 200
    }

    getSumScore(playerId)
    {
        return (this.getScoreForType(0, playerId) + this.getScoreForType(1, playerId) + this.getScoreForType(2, playerId));
    }
}
