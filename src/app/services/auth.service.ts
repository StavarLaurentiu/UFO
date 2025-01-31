import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  currentUsername: string | null = null;

  // Add BehaviorSubject for auth state
  private authState = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    username: null,
  });

  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {
    // Initialize auth state from localStorage on service creation
    const token = localStorage.getItem('Authorization');
    const savedUsername = localStorage.getItem('username');

    // Check for both token and username
    if (token && savedUsername) {
      this.currentUsername = savedUsername;
      this.authState.next({
        isLoggedIn: true,
        username: savedUsername,
      });
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('Authorization');
  }

  getUsername(): string | null {
    return this.currentUsername;
  }

  checkUsername(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${username}`).pipe(
      map(() => {
        return { available: false };
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of({ available: true });
        }
        return throwError(() => ({
          available: false,
          error: 'Error checking username availability',
        }));
      })
    );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    // Create a clean object without any string quotes
    const cleanUserData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    };

    console.log('AuthService: Starting registration process');
    console.log('AuthService: API URL:', this.apiUrl);
    console.log('AuthService: Clean user data being sent:', cleanUserData);

    return this.http.post(`${this.apiUrl}/users`, cleanUserData).pipe(
      map((response) => {
        console.log('AuthService: Registration HTTP response:', response);
        return { success: true };
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthService: Registration error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url,
        });
        return throwError(() => error);
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const url = `${this.apiUrl}/users/login`;
    return this.http
      .get(url + '?' + params.toString(), {
        observe: 'response',
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            const token = response.headers.get('Authorization');
            this.saveToken(token);
            this.currentUsername = username;
            localStorage.setItem('username', username);

            this.authState.next({
              isLoggedIn: true,
              username: username,
            });
            return { success: true, code: response.status };
          }
          return { success: false, code: response.status };
        }),
        catchError((error) => {
          return of({
            success: false,
            message: 'Login failed',
            code: error.status,
          });
        })
      );
  }

  saveToken(token: string): void {
    localStorage.setItem('Authorization', token);
  }

  logout(): void {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('username');
    this.currentUsername = null;
    this.authState.next({
      isLoggedIn: false,
      username: null,
    });
  }
}
