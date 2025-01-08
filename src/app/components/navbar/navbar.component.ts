import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust the path based on your project structure

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      // Extract the username from the token or store it separately
      const token = localStorage.getItem('Authorization');
      if (token) {
        // Assuming the username is stored in the token payload
        this.username = this.decodeUsernameFromToken(token);
      }
    }
  }

  decodeUsernameFromToken(token: string): string {
    // Decode the token to extract the username (if your token contains it)
    // This is a placeholder, adjust it based on your token structure
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      return payload.username || 'User';
    } catch (e) {
      return 'User'; // Fallback username
    }
  }

  logout(): void {
    this.authService.logout(); // Clear token
    this.isLoggedIn = false;
    this.username = '';
    this.router.navigate(['/home']); // Redirect to home
  }
}
