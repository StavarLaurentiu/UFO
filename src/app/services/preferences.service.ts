import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GamePreferences {
  ufoCount: number;
  timeCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private defaultPreferences: GamePreferences = {
    ufoCount: 1,
    timeCount: 60
  };

  private preferences = new BehaviorSubject<GamePreferences>(this.loadPreferences());

  constructor() { }

  loadPreferences(): GamePreferences {
    const stored = localStorage.getItem('gamePreferences');
    return stored ? JSON.parse(stored) : this.defaultPreferences;
  }

  savePreferences(preferences: GamePreferences): void {
    localStorage.setItem('gamePreferences', JSON.stringify(preferences));
    this.preferences.next(preferences);
  }

  getPreferences() {
    return this.preferences.asObservable();
  }

  getCurrentPreferences(): GamePreferences {
    return this.preferences.value;
  }
}