import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GameState {
  score: number;
  timeLeft: number;
  isGameOver: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState = new BehaviorSubject<GameState>({
    score: 0,
    timeLeft: 60,
    isGameOver: false
  });

  constructor() { }

  getGameState() {
    return this.gameState.asObservable();
  }

  updateScore(newScore: number) {
    const currentState = this.gameState.value;
    this.gameState.next({ ...currentState, score: newScore });
  }

  updateTime(newTime: number) {
    const currentState = this.gameState.value;
    this.gameState.next({ ...currentState, timeLeft: newTime });
  }

  setGameOver(finalScore: number) {
    const currentState = this.gameState.value;
    this.gameState.next({ ...currentState, isGameOver: true, score: finalScore });
  }

  resetGame() {
    const preferences = this.loadGamePreferences();
    this.gameState.next({
      score: 0,
      timeLeft: preferences.timeCount,
      isGameOver: false
    });
  }

  loadGamePreferences() {
    const stored = localStorage.getItem('gamePreferences');
    return stored ? JSON.parse(stored) : { ufoCount: 1, timeCount: 60 };
  }

  calculateFinalScore(score: number, ufoCount: number, gameTime: number): number {
    // Divide by minutes played
    let finalScore = score / (gameTime / 60);
    
    // Subtract 50 points per extra UFO
    finalScore -= ((ufoCount - 1) * 50);
    
    return Math.max(0, Math.floor(finalScore));
  }
}