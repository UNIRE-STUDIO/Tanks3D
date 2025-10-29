import levels from './levels.json'

export default class UIFields {
    public currentScreen: number = 0
    public playersHealth         = [0, 0]
    public countReserveNpcTanks: number = 0 // Количество вражеских танков в резерве
    public currentLevel: number  = 0
    public npc: Array<number>    = levels[this.currentLevel].npc
    public playersMode: number   = 0 // 0 - 1 игрок // 1 - 2 игрока
    public numDestroyedTypes     = [[], []]

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
