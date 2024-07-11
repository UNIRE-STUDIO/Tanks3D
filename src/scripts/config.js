import levels from './levels.json'

export default class Config {
  constructor(canvas) {
    this.grid = 32
    this.grid2 = this.grid * 2
    this.viewSize = {
      x: levels[0].map[0].length,
      y: levels[0].map.length
    }
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = this.viewSize.x * this.grid
    this.canvas.height = this.viewSize.y * this.grid
  }
}
