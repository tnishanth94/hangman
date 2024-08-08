import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-board',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  imports: [CommonModule, FormsModule]
})
export class GameBoardComponent implements OnInit {
  guess: string = '';
  currentGame$: Observable<any>;
  movieName: string = '';
  displayWord: string[] = [];
  wrongGuesses: string[] = [];
  showModal: boolean = true;
  gameStatus: 'playing' | 'won' | 'lost' = 'playing';

  constructor(private gameService: GameService) {
    this.currentGame$ = gameService.currentGame.asObservable();
  }

  ngOnInit(): void {
    this.currentGame$.subscribe(gameState => {
      if (gameState) {
        this.movieName = gameState.movieName;
        this.displayWord = gameState.guesses || Array(this.movieName.length).fill('_');
        this.wrongGuesses = gameState.wrongGuesses || [];
        this.checkGameStatus();
      }
    });
  }

  onGuess(event: Event) {
    event.preventDefault();
    const guess = this.guess.toLowerCase();
    this.guess = ''; // Reset input field

    // Check if the guess is the whole movie name
    if (guess === this.movieName.toLowerCase()) {
      this.gameStatus = 'won';
      this.gameService.updateGameState({
        movieName: this.movieName,
        clue: 'Congratulations!',
        guesses: this.movieName.split(''),
        wrongGuesses: this.wrongGuesses
      });
    } else {
      // Emit the guess to the server
      this.gameService.guessMovie(guess);
    }
  }

  startGame() {
    this.showModal = false;
    this.gameStatus = 'playing';
    this.gameService.updateGameState({
      movieName: this.movieName,
      clue: 'Guess the movie name!',
      guesses: Array(this.movieName.length).fill('_'),
      wrongGuesses: []
    });
  }

  resetGame() {
    this.showModal = true;
    this.gameStatus = 'playing';
    this.movieName = '';
    this.displayWord = [];
    this.wrongGuesses = [];
  }

  checkGameStatus() {
    const correctGuesses = this.displayWord.join('');
    if (correctGuesses === this.movieName) {
      this.gameStatus = 'won';
    } else if (this.wrongGuesses.length >= 9) { // assuming 9 is the maximum number of wrong guesses
      this.gameStatus = 'lost';
    }
  }
}
