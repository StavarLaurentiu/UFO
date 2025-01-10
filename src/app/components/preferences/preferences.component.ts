import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PreferencesService } from '../../services/preferences.service';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';

interface AlertInfo {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  preferencesForm: FormGroup;
  ufoCount: number = 1;
  timeCount: number = 60;
  isLoggedIn: boolean = false;
  alertInfo: AlertInfo = {
    show: false,
    message: '',
    type: 'success'
  };

  constructor(
    private fb: FormBuilder,
    private preferencesService: PreferencesService,
    private authService: AuthService,
    private gameService: GameService,
    private router: Router
  ) {
    this.preferencesForm = this.fb.group({
      ufoCount: [1],
      timeCount: [60]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const preferences = this.preferencesService.getLocalPreferences();
    this.preferencesForm.patchValue(preferences);
    this.ufoCount = preferences.ufoCount;
    this.timeCount = preferences.timeCount;
  }

  updateUfoCount(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.ufoCount = parseInt(value);
  }

  updateTimeCount(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.timeCount = parseInt(value);
  }

  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertInfo = {
      show: true,
      message,
      type
    };

    // Hide alert after 3 seconds
    setTimeout(() => {
      this.alertInfo.show = false;
    }, 3000);
  }

  saveLocal(): void {
    const preferences = {
      ufoCount: this.ufoCount,
      timeCount: this.timeCount
    };
    this.preferencesService.saveLocalPreferences(preferences);
    this.showAlert('Preferences saved locally', 'success');
  }

  saveServer(): void {
    if (!this.isLoggedIn) {
      this.showAlert('You must be logged in to save preferences to server', 'error');
      return;
    }

    const username = this.authService.getUsername();
    if (!username) {
      this.showAlert('Username not found', 'error');
      return;
    }

    const preferences = {
      ufoCount: this.ufoCount,
      timeCount: this.timeCount
    };

    this.preferencesService.saveServerPreferences(username, preferences)
      .subscribe({
        next: () => this.showAlert('Preferences saved to server successfully', 'success'),
        error: (error) => this.showAlert('Error saving preferences to server: ' + error.message, 'error')
      });
  }

  getLocal(): void {
    const preferences = this.preferencesService.getLocalPreferences();
    this.ufoCount = preferences.ufoCount;
    this.timeCount = preferences.timeCount;
    this.preferencesForm.patchValue({
      ufoCount: this.ufoCount,
      timeCount: this.timeCount
    });
    this.showAlert('Preferences loaded from local storage', 'success');
  }

  getFromServer(): void {
    if (!this.isLoggedIn) {
      this.showAlert('You must be logged in to get preferences from server', 'error');
      return;
    }

    const username = this.authService.getUsername();
    if (!username) {
      this.showAlert('Username not found', 'error');
      return;
    }

    this.preferencesService.getServerPreferences(username)
      .subscribe({
        next: (data) => {
          this.ufoCount = data.ufos;
          this.timeCount = data.disposedTime;
          this.preferencesForm.patchValue({
            ufoCount: this.ufoCount,
            timeCount: this.timeCount
          });
          this.showAlert('Preferences loaded from server', 'success');
        },
        error: (error) => this.showAlert('Error getting preferences from server: ' + error.message, 'error')
      });
  }

  handleAccept(): void {
    // Save current preferences to game service
    const gamePreferences = {
      ufoCount: this.ufoCount,
      timeCount: this.timeCount
    };
    
    this.gameService.saveGamePreferences(gamePreferences);
    this.router.navigate(['/game']);
  }
}