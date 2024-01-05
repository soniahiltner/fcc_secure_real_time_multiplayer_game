import gameConfig from './gameConfig.mjs'
const { canvasHeight, canvasWidth, padding, infoGame, avatar, collectible } = gameConfig

class Player {
  constructor({ x, y, score = 0, id }) {
    this.x = x
    this.y = y
    this.score = score
    this.id = id
    this.speed = 5
    this.dir = null
  }

  draw(ctx, image) {
    if (this.dir) {
      this.movePlayer(this.dir, this.speed)
    }
    const x = this.x
    const y = this.y
    ctx.drawImage(image, x, y, avatar.width, avatar.height)
    
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        this.y = this.y - speed > infoGame ? this.y - speed : infoGame
        break
      case 'down':
        this.y = this.y + speed < canvasHeight - padding - avatar.height ? this.y + speed : canvasHeight - padding - avatar.height
        break
      case 'right':
        this.x = this.x + speed < canvasWidth - padding - avatar.width ? this.x + speed : canvasWidth - padding - avatar.width
        break
      case 'left':
        this.x = this.x - speed > padding ? this.x - speed : padding
        break
      default:
        this.x = this.x
        this.y = this.y
    }
  }

  collision(item) {
    //item coordinates
    const topItem = {
      x: item.x,
      y: item.y
    }
    const bottomItem = {
      x: item.x + collectible.width,
      y: item.y + collectible.height
    }
    // player coordinates
    const topPlayer = {
      x: this.x,
      y: this.y
    }
    const bottomPlayer = {
      x: this.x + avatar.width,
      y: this.y + avatar.height
    }
    // vertical check
    if (topPlayer.y >= bottomItem.y || topItem.y >= bottomPlayer.y) {
      return false
    }
    // Horizontal check
    if (bottomPlayer.x <= topItem.x || topPlayer.x >= bottomItem.x) {
      return false
    }
    return true
  }

  calculateRank(players) {
    let currentRanking
    let totalPlayers = players.length

    const sorted = players.sort((a, b) => b.score - a.score)
    currentRanking = sorted.findIndex(p => p.id === this.id) + 1

    return `Rank: ${currentRanking}/${totalPlayers}`
  }
}

export default Player;
