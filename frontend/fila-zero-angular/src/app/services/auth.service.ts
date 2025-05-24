import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User, UserLogin, UserRegister } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadToken();
    }
  }

  private loadToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        this.getUserProfile().subscribe({
          error: () => {
            // Se houver erro ao obter o perfil, limpar o token
            this.logout();
          }
        });
      }
    }
  }

  register(user: UserRegister): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: true
    });
  }

  login(credentials: UserLogin): Observable<AuthResponse> {
    // FastAPI espera os dados em formato de formulário para o endpoint de token
    const formData = new URLSearchParams();
    formData.set('username', credentials.email);
    formData.set('password', credentials.password);

    return this.http.post<AuthResponse>(`${this.apiUrl}/token`, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      withCredentials: true
    }).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.tokenKey, response.access_token);
          this.getUserProfile().subscribe();
        }
      })
    );
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
}