import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
    private router: Router,
    private http: HttpClient
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
    console.log('RegisterComponent: Submit button clicked');
    console.log('RegisterComponent: Form valid:', this.registerForm.valid);
    console.log(
      'RegisterComponent: Username available:',
      this.usernameAvailable
    );
    console.log(
      'RegisterComponent: Complete form value:',
      this.registerForm.value
    );

    if (this.registerForm.valid && this.usernameAvailable) {
      const { username, email, password, repeatPassword } =
        this.registerForm.value;

      console.log('RegisterComponent: Extracted form values:', {
        username,
        email,
        password: '[MASKED]',
        repeatPassword: '[MASKED]',
      });

      if (password !== repeatPassword) {
        console.log('RegisterComponent: Password mismatch detected');
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      const userData = {
        username: username,
        email: email,
        password: password,
      };

      console.log(
        'RegisterComponent: Calling authService.register with userData:',
        {
          ...userData,
          password: '[MASKED]',
        }
      );

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log(
            'RegisterComponent: Registration success response:',
            response
          );
          this.modalMessage = 'Registration successful! You can now log in.';
          this.showModal = true;
          this.registerForm.reset();
          console.log('RegisterComponent: Form reset and modal shown');

          setTimeout(() => {
            console.log('RegisterComponent: Initiating redirect to login');
            this.redirectToLogin();
          }, 2000);
        },
        error: (error) => {
          console.error(
            'RegisterComponent: Registration error full details:',
            error
          );
          console.error('RegisterComponent: Error type:', typeof error);
          console.error('RegisterComponent: Error keys:', Object.keys(error));
          this.errorMessage =
            'Registration failed: ' +
            (error.error?.message || error.message || 'Unknown error');
          console.error(
            'RegisterComponent: Set error message to:',
            this.errorMessage
          );
        },
      });
    } else {
      console.log('RegisterComponent: Form validation failed');
      console.log('RegisterComponent: Form errors:', this.registerForm.errors);
      console.log(
        'RegisterComponent: Username field errors:',
        this.registerForm.get('username')?.errors
      );

      if (this.registerForm.get('username')?.errors?.['maxlength']) {
        this.errorMessage = 'Username must be maximum 8 characters long';
      } else {
        this.errorMessage = 'Please fill in all required fields correctly';
      }
      console.log(
        'RegisterComponent: Set error message to:',
        this.errorMessage
      );
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
