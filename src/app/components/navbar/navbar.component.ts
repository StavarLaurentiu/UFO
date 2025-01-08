import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  username: string = '';
  private authSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.authSubscription = this.authService.authState$.subscribe(
      (authState) => {
        this.isLoggedIn = authState.isLoggedIn;
        this.username = authState.username || '';
      }
    );
  }

  ngOnInit(): void {
    // Initial auth check is now handled by the subscription
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}