import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  showModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
  
      this.authService.login(username, password).subscribe({
        next: (response) => {
          console.log('Login response:', response);
          
          if (response.success) {
            this.authService.currentUsername = username; // Store username in AuthService
              
            // Show success modal
            this.showModal = true;
            this.loginForm.reset();
          } else if (response.code === 401) {
            this.errorMessage = 'Invalid username or password. Please try again.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
  
          // Handle error messages
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password. Please try again.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        },
      });
    }
  }  

  redirectToHome(): void {
    this.router.navigate(['/home']);
  }
}
