import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  showModal: boolean = false;
  modalMessage: string = '';
  usernameAvailable: boolean = false;
  checkingUsername: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(8)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Clear error message when any form field changes
    this.registerForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });

    // Check username availability when username field changes
    this.registerForm
      .get('username')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((username) => {
          if (username.length < 3) {
            return of(null);
          }
          this.checkingUsername = true;
          return this.authService.checkUsername(username);
        })
      )
      .subscribe({
        next: (result) => {
          this.checkingUsername = false;
          if (result) {
            this.usernameAvailable = result.available;
            if (!result.available) {
              this.errorMessage = 'Username already exists';
            }
          }
        },
        error: () => {
          this.checkingUsername = false;
        },
      });
  }

  onSubmit(): void {
    console.log('Submit button clicked');
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form values:', this.registerForm.value);

    if (this.registerForm.valid) {
      const { username, email, password, repeatPassword } =
        this.registerForm.value;

      console.log('Form data:', { username, email, password, repeatPassword });

      if (password !== repeatPassword) {
        console.log('Passwords do not match');
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      if (!this.usernameAvailable) {
        console.log('Username not available');
        this.errorMessage = 'Please choose a different username.';
        return;
      }

      console.log('Attempting registration...');
      this.authService.register({ username, email, password }).subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          if (response.success) {
            console.log('Registration successful');
            this.modalMessage = 'Registration successful! You can now log in.';
            this.showModal = true;
            this.registerForm.reset();
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.message;
        },
      });
    } else {
      console.log('Form invalid');
      console.log('Form errors:', this.registerForm.errors);
      console.log(
        'Username errors:',
        this.registerForm.get('username')?.errors
      );

      if (this.registerForm.get('username')?.errors?.['maxlength']) {
        this.errorMessage = 'Username must be maximum 8 characters long';
      } else {
        this.errorMessage = 'Please fill in all required fields correctly';
      }
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
