import gameConfig from './gameConfig.mjs'

const { collectible } = gameConfig

class Collectible {
  constructor({x, y, value = 1, id, index}) {
    this.x = x
    this.y = y
    this.value = value
    this.id = id
    this.index = index
  }

  draw(ctx, images) {
    const x = this.x
    const y = this.y
    const image = images[this.index]
    ctx.drawImage(image, x, y, collectible.width, collectible.height)
  }

  update({ x, y, value = 1, id, index }) {
    this.x = x
    this.y = y
    this.value = value
    this.id = id
    this.index = index
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/

/* try {
  module.exports = Collectible;
} catch(e) {}
 */
export default Collectible;
