import gameConfig from './gameConfig.mjs'

const { canvasWidth, canvasHeight, infoGame, padding } = gameConfig

export default function setUpCanvas(ctx, currentRanking) {
  //canvas
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // Gameboard
  ctx.strokeStyle = 'white'
  ctx.strokeRect(padding, infoGame, canvasWidth - 2 * padding, canvasHeight - padding - infoGame)
  //Controls
  ctx.fillStyle = 'white'
  ctx.font = `0.9rem 'Press Start 2P'`
  ctx.textAlign = 'start'
  ctx.fillText('Controls: WASD', padding, infoGame * 3 / 4)
  
  ctx.font = `1.2rem 'Press Start 2P'`
  ctx.textAlign = 'center'
  ctx.fillText('Coin Race', canvasWidth / 2, infoGame * 3 / 4)

  ctx.font = `1rem 'Press Start 2P'`
  ctx.textAlign = 'end'
  ctx.fillText(currentRanking, canvasWidth - padding, infoGame * 3 / 4)
}