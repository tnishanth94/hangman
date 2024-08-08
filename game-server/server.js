const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.get('/', (req, res) => {
  res.send('Welcome to Hangman!');
});
const path = require('path');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js server!');
});

// Example route
app.get('/hangman', (req, res) => {
  res.send('Hangman!');
});
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:4200'] // Allow connections from localhost:4200
  }
});

let gameState = {
  movieName: '',
  clue: '',
  guesses: [],
  wrongGuesses: []
};

io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle startGame event
  socket.on('startGame', (data) => {
    console.log('Starting game:', data);
    gameState = data; // Initialize game state
    io.emit('gameState', gameState); // Broadcast game state to all clients
  });

  // Handle guessMovie event
  socket.on('guessMovie', (guess) => {
    console.log('Guess received:', guess);
    const { movieName, guesses, wrongGuesses } = gameState;

    if (movieName.toLowerCase().includes(guess.toLowerCase())) {
      movieName.split('').forEach((char, index) => {
        if (char.toLowerCase() === guess.toLowerCase()) {
          guesses[index] = char;
        }
      });
    } else {
      wrongGuesses.push(guess);
    }

    // Update game state and broadcast to all clients
    io.emit('gameState', { movieName, clue: gameState.clue, guesses, wrongGuesses });
  });

  // Handle updateGameState event
  socket.on('updateGameState', (gameStateUpdate) => {
    console.log('Updating game state:', gameStateUpdate);
    gameState = gameStateUpdate; // Update game state
    io.emit('gameState', gameState); // Broadcast updated game state to all clients
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
