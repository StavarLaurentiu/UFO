import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface GamePreferences {
  ufoCount: number;
  timeCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = environment.apiUrl;
  private readonly DEFAULT_UFO_COUNT = 3;
  private readonly DEFAULT_TIME_COUNT = 60;
  private readonly STORAGE_KEY = 'gamePreferences';

  constructor(private http: HttpClient) {}

  loadGamePreferences(): GamePreferences {
    const storedPreferences = localStorage.getItem(this.STORAGE_KEY);
    if (storedPreferences) {
      return JSON.parse(storedPreferences);
    }

    // Return default values if no preferences are stored
    return {
      ufoCount: this.DEFAULT_UFO_COUNT,
      timeCount: this.DEFAULT_TIME_COUNT,
    };
  }

  saveGamePreferences(preferences: GamePreferences): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }

  calculateFinalScore(
    score: number,
    ufoCount: number,
    timeCount: number
  ): number {
    // Calculate time-based division factor
    let timeDivisor = 1;
    if (timeCount === 120) {
      timeDivisor = 2;
    } else if (timeCount === 180) {
      timeDivisor = 3;
    }

    // Calculate UFO penalty (50 points per extra UFO beyond 1)
    const ufoDeduction = ufoCount > 1 ? (ufoCount - 1) * 50 : 0;

    // Calculate final score: (base score / time divisor) - UFO penalty
    const finalScore = Math.round(score / timeDivisor - ufoDeduction);

    // Log the calculations for debugging
    console.log('Time Divisor:', timeDivisor);
    console.log('UFO Deduction:', ufoDeduction);
    console.log('Base Score:', score);
    console.log('Final Score:', finalScore);

    return finalScore;
  }

  recordScore(
    score: number,
    ufos: number,
    disposedTime: number
  ): Observable<any> {
    const token = localStorage.getItem('Authorization');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });

    const payload = {
      punctuation: score,
      ufos: ufos,
      disposedTime: disposedTime,
    };

    return this.http.post(`${this.apiUrl}/records`, payload, { headers });
  }

  // Method to get default values
  getDefaultValues(): { ufoCount: number; timeCount: number } {
    return {
      ufoCount: this.DEFAULT_UFO_COUNT,
      timeCount: this.DEFAULT_TIME_COUNT,
    };
  }

  // Method to validate preferences
  validatePreferences(preferences: GamePreferences): boolean {
    return (
      preferences.ufoCount >= 1 &&
      preferences.ufoCount <= 5 &&
      preferences.timeCount >= 30 &&
      preferences.timeCount <= 120
    );
  }

  // Method to reset preferences to default
  resetPreferences(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
