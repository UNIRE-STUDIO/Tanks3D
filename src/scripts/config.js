import levels from './levels.json'

export default class Config {
  constructor() {
    this.grid = 32
    this.grid2 = this.grid * 2
    this.viewSize = {
      x: levels[0].map[0].length,
      y: levels[0].map.length
    }
  }
}
