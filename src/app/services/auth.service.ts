import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  currentUsername: string | null = null; // Store the username in memory

  constructor(private http: HttpClient) {}

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
    const body = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    };
  
    console.log("Request body: ", body);
  
    return new Observable((observer) => {
      this.http.post(`${this.apiUrl}/users`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
        observe: 'response',
      }).subscribe({
        next: (response) => {
          console.log("HTTP POST successful: ", response);
  
          if (response.status === 201) {
            console.log("User registered successfully.");
            observer.next({ success: true });
            observer.complete();
          } else {
            console.warn("Unexpected response status: ", response.status);
            observer.next(response);
            observer.complete();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("HTTP POST failed:", error);
  
          let errorMessage = 'Registration failed';
          if (error.status === 400) {
            errorMessage = 'Please fill in all required fields';
          } else if (error.status === 409) {
            errorMessage = 'Username already exists';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later';
          }
  
          console.warn("Error message prepared: ", errorMessage);
          observer.error({ success: false, message: errorMessage });
        }
      });
    });
  }  

  login(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/users/login?username=${username}&password=${password}`;
    return this.http.get(url, { observe: 'response' }).pipe(
      map((response: any) => {
        if (response.status === 200) {
          const token = response.headers.get('Authorization');
          this.saveToken(token);
          this.currentUsername = username; // Save the username
          return { success: true };
        }
        return { success: false };
      }),
      catchError((error) => {
        return of({ success: false, message: 'Login failed' });
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('Authorization', token);
  }

  logout(): void {
    localStorage.removeItem('Authorization');
    this.currentUsername = null; // Clear the username
  }
}
