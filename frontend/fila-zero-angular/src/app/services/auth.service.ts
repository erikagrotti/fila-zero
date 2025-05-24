import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User, UserLogin, UserRegister } from '../models/user.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadToken();
    }
  }

  private loadToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      const userJson = localStorage.getItem(this.userKey);
      
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          this.logout();
        }
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
          
          // Buscar o perfil do usuário
          this.http.get<User>(`${this.apiUrl}/users/me`, {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${response.access_token}`,
              'Content-Type': 'application/json'
            })
          }).subscribe({
            next: (user) => {
              this.currentUserSubject.next(user);
              localStorage.setItem(this.userKey, JSON.stringify(user));
            },
            error: (err) => console.error('Erro ao obter perfil:', err)
          });
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
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.userKey, JSON.stringify(user));
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      return !!token;
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