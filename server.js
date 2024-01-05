require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet')
const nanoid = require('nanoid').nanoid
const nocache = require('nocache')
const http = require('http')

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const { default: getRandomPosition } = require('./public/utils/getRandomPosition.mjs');
const { default: getRandomIndex } = require('./public/utils/getRandomIndex.mjs');
const { default: Collectible } = require('./public/Collectible.mjs');
const { default: gameConfig } = require('./public/gameConfig.mjs');

const { canvasWidth, canvasHeight, padding, infoGame, avatar, collectible } = gameConfig

const app = express();
const server = http.createServer(app)
const io = socket(server)

app.use(
  helmet({
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: {
      setTo: 'PHP 7.4.3',
    },
  })
);
app.use(nocache());

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Create new collectible
const collectiblePosition = getRandomPosition(canvasWidth, canvasHeight, padding, infoGame, collectible)
const collectibleIndex = getRandomIndex(collectible.src)
const newCollectible = new Collectible({
  x: collectiblePosition.x,
  y: collectiblePosition.y,
  id: nanoid(),
  index: collectibleIndex
})
//Players
let players = []

//On connection
io.on('connection', (socket) => {
  socket.on('join', (player) => {
    //Send current players
    socket.emit('opponents', players)
    //send collectible
    socket.emit('collectible', newCollectible)
    //Add player to players
    players.push(player)
    // broadcast the player
    socket.broadcast.emit('newOpponent', player)
  })
  // Update player
  socket.on('updatePlayerState', (player) => {
    let updatedPlayer = players.find(el => el.id === player.id)
    
    updatedPlayer.x = player.x
    updatedPlayer.y = player.y
    updatedPlayer.dir = player.dir
    updatedPlayer.score = player.score
    // Emit updated player
    socket.broadcast.emit('updateOpponentState', updatedPlayer)
  })

  //Player collision
  socket.on('collision', (player) => {
    //Update player
    player.score += newCollectible.value
    let updatedPlayer = players.find(el => el.id === player.id)
    
    updatedPlayer.x = player.x
    updatedPlayer.y = player.y
    updatedPlayer.dir = player.dir
    updatedPlayer.score = player.score
    // Emit updated player
    socket.broadcast.emit('updateOpponentState', updatedPlayer)
    // Emit score
    socket.emit('score', player.score)
    // New collectible
    let newIndex = getRandomIndex(collectible.src)
    let newPosition = getRandomPosition(canvasWidth, canvasHeight, padding, infoGame, collectible)
    while (newCollectible.x === newPosition.x && newCollectible.y === newPosition.y) {
      newPosition = getRandomPosition(canvasWidth, canvasHeight, padding, infoGame, collectible)
    }
    newCollectible.update({
      x: newPosition.x,
      y: newPosition.y,
      id: nanoid(),
      index: newIndex
    })
    //Emit new collectible to everyone
    io.sockets.emit('collectible', newCollectible)
  })


  // Disconnect player
  socket.on('disconnect', () => {
    socket.broadcast.emit('opponentDisconnect', socket.id)
    players = players.filter(player => player.id != socket.id)
  })
})

const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
