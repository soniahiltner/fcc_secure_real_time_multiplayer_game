import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import gameConfig from './gameConfig.mjs'
import setUpCanvas from './setUpCanvas.mjs';
import getRandomPosition from './utils/getRandomPosition.mjs';
import loadImage from './utils/loadImage.mjs';

const { canvasWidth, canvasHeight, padding, infoGame, avatar, collectible } = gameConfig

const socket = io()
const canvas = document.getElementById('game-window')
const ctx = canvas.getContext('2d')


let player
let currentCollectible
let collision = false
let currentOpponents = []
let currentRanking = 'Rank: 1/1'


//Load images
const playerAvatar = loadImage(avatar.playerSrc)
const opponentAvatar = loadImage(avatar.opponentSrc)
const collectibles = collectible.src.map(src => loadImage(src))

//On connection
socket.on('connect', () => {
  // Get coordinates
  const { x, y } = getRandomPosition(canvasWidth, canvasHeight, padding, infoGame, avatar)
  // Create player
  player = new Player({ x, y, id: socket.id })
  //Emit
  socket.emit('join', player)
})
//Receiving the collectible 
socket.on('collectible', (newCollectible) => {
  if (currentCollectible) {
    currentCollectible.update(newCollectible)
    collision = false
  } else {
    currentCollectible = new Collectible(newCollectible)
    collision = false
  }
})
// Receiving opponents
socket.on('opponents', (opponents) => {
  opponents.forEach(opponent => {
    currentOpponents.push(new player(opponent))
  })
  //Calculate rank
  currentRanking = player.calculateRank([player, ...currentOpponents])
})

// Receiving a New opponent
socket.on('newOpponent', opponent => {
  currentOpponents.push(new Player(opponent))
  //Calculate rank
  currentRanking = player.calculateRank([player, ...currentOpponents])
})

// Receiving updated opponent
socket.on('updateOpponentState', ({ x, y, score, id, dir }) => {
  let opponent = currentOpponents.find(opponent => opponent.id === id)
  opponent.x = x
  opponent.y = y
  opponent.score = score
  opponent.dir = dir
  //Update rank
  currentRanking = player.calculateRank([player, ...currentOpponents])
})
//Score
socket.on('score', (score) => {
  player.score = score
  //Update rank
  currentRanking = player.calculateRank([player, ...currentOpponents])
})
// Opponent disconnect
socket.on('opponentDisconnect', (socketId) => {
  // Update opponents
  currentOpponents = currentOpponents.filter(opponent => opponent.id != socketId)
  // update rank
  currentRanking = player.calculateRank([player, ...currentOpponents])

})

// keydown and keydown Event listeners
document.addEventListener('keydown', (e) => {
  if (player) {
    if (e.key === 'a' || e.key === 'ArrowLeft') {
      player.dir = 'left'
    }
    if (e.key === 'd' || e.key === 'ArrowRight') {
      player.dir = 'right'
    }
    if (e.key === 'w' || e.key === 'ArrowUp') {
      player.dir = 'up'
    }
    if (e.key === 's' || e.key === 'ArrowDown') {
      player.dir = 'down'
    }
    socket.emit('updatePlayerState', player)
  }
  
})
document.addEventListener('keyup', (e) => {
  if (player && (e.key === 'a' || e.key === 'ArrowLeft' || e.key === 'd' || e.key === 'ArrowRight' || e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown')) {
    player.dir = null
    socket.emit('updatePlayerState', player)
  }
})

//Render canvas
function render() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  //Draw canvas
  setUpCanvas(ctx, currentRanking)

  //Draw player
  if (player) {
    player.draw(ctx, playerAvatar);
  }

  //Draw opponents
  for (const opponent of currentOpponents) {
    opponent.draw(ctx, opponentAvatar)
  }
  

  //Draw collectible
  if (currentCollectible) {
    currentCollectible.draw(ctx, collectibles)
  }

  // Collision
  if (currentCollectible && player) {
    if (player.collision(currentCollectible) && !collision) {
      // Emit collision
      socket.emit('collision', player)
      collision = true
    }
  }
  
  requestAnimationFrame(render)
}

requestAnimationFrame(render)