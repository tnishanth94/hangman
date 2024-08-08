import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private socket;
  public currentGame = new BehaviorSubject<any>(null);

  constructor() {
    this.socket = io('http://localhost:4000'); // Replace with your Socket.io server URL
    this.socket.on('gameState', gameState => {
      this.currentGame.next(gameState);
    });
  }

  // Method to handle guesses
  guessMovie(guess: string) {
    this.socket.emit('guessMovie', guess);
  }

  // Method to update the game state
  updateGameState(gameState: any) {
    this.socket.emit('updateGameState', gameState);
  }
}
