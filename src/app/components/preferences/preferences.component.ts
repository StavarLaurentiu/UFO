import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  preferencesForm: FormGroup;
  ufoCount: number = 1;
  timeCount: number = 60;

  constructor(
    private fb: FormBuilder,
    private preferencesService: PreferencesService,
    private router: Router
  ) {
    this.preferencesForm = this.fb.group({
      ufoCount: [1],
      timeCount: [60]
    });
  }

  ngOnInit(): void {
    const currentPreferences = this.preferencesService.getCurrentPreferences();
    this.preferencesForm.patchValue(currentPreferences);
    this.ufoCount = currentPreferences.ufoCount;
    this.timeCount = currentPreferences.timeCount;
  }

  updateUfoCount(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.ufoCount = parseInt(value);
  }

  updateTimeCount(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.timeCount = parseInt(value);
  }

  handleAccept(): void {
    const preferences = {
      ufoCount: this.ufoCount,
      timeCount: this.timeCount
    };
    
    this.preferencesService.savePreferences(preferences);
    this.router.navigate(['/game']);
  }
}