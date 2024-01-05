export default function getRandomPosition(width, height, padding, infoGame, avatar) {
  let minX = padding
  let maxX = width - padding - avatar.width
  let minY = infoGame
  let maxY = height - padding - avatar.height
  let x = Math.floor(Math.random() * (maxX - minX) + minX)
  let y = Math.floor(Math.random() * (maxY - minY) + minY)
  return { x, y }
}