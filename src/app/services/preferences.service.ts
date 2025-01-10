// preferences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Preferences {
  ufoCount: number;
  timeCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private apiUrl = 'http://localhost:10000'; // Node.js server URL

  constructor(private http: HttpClient) {}

  // Local Storage Methods
  saveLocalPreferences(preferences: Preferences): void {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }

  getLocalPreferences(): Preferences {
    const stored = localStorage.getItem('preferences');
    return stored ? JSON.parse(stored) : { ufoCount: 1, timeCount: 60 };
  }

  // Server Methods
  saveServerPreferences(username: string, preferences: Preferences): Observable<any> {
    const token = localStorage.getItem('Authorization');
    const headers = new HttpHeaders().set('Authorization', token || '');

    return this.http.patch(
      `${this.apiUrl}/users/${username}/options`,
      {
        numufos: preferences.ufoCount,
        time: preferences.timeCount
      },
      { headers }
    );
  }

  getServerPreferences(username: string): Observable<any> {
    const token = localStorage.getItem('Authorization');
    const headers = new HttpHeaders().set('Authorization', token || '');

    return this.http.get(
      `${this.apiUrl}/users/${username}/options`,
      { headers }
    );
  }
}