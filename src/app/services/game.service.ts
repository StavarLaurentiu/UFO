import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface GamePreferences {
  ufoCount: number;
  timeCount: number;
}

@Injectable({
  providedIn: 'root'
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
      timeCount: this.DEFAULT_TIME_COUNT
    };
  }

  saveGamePreferences(preferences: GamePreferences): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }

  calculateFinalScore(score: number, ufoCount: number, timeCount: number): number {
    // Base multiplier starts at 1
    let multiplier = 1;

    // Adjust multiplier based on UFO count
    if (ufoCount > this.DEFAULT_UFO_COUNT) {
      multiplier += (ufoCount - this.DEFAULT_UFO_COUNT) * 0.1;
    }

    // Adjust multiplier based on time
    if (timeCount < this.DEFAULT_TIME_COUNT) {
      multiplier += (this.DEFAULT_TIME_COUNT - timeCount) * 0.01;
    }

    // Calculate and round the final score
    return Math.round(score * multiplier);
  }

  recordScore(score: number, ufos: number, disposedTime: number): Observable<any> {
    const token = localStorage.getItem('Authorization');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    const payload = {
      punctuation: score,
      ufos: ufos,
      disposedTime: disposedTime
    };

    return this.http.post(`${this.apiUrl}/records`, payload, { headers });
  }

  // Method to get default values
  getDefaultValues(): { ufoCount: number; timeCount: number } {
    return {
      ufoCount: this.DEFAULT_UFO_COUNT,
      timeCount: this.DEFAULT_TIME_COUNT
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