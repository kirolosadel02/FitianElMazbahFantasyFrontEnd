import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  User,
  ErrorResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  // Reactive state using signals
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  // Public computed signals
  public readonly currentUser = computed(() => this.currentUserSignal());
  public readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  public readonly isAdmin = computed(() =>
    this.currentUserSignal()?.role === 'Admin' || false
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuthState();
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Login user with credentials
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/users/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/users/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };

    return this.http.post<AuthResponse>(`${this.API_URL}/users/refresh-token`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          this.logout();
          return this.handleAuthError(error);
        })
      );
  }

  /**
   * Logout user (current device)
   */
  logout(): Observable<any> {
    const refreshToken = this.getStoredRefreshToken();

    if (refreshToken) {
      return this.http.post(`${this.API_URL}/users/logout`, { refreshToken })
        .pipe(
          tap(() => this.handleLogoutSuccess()),
          catchError(error => {
            // Even if logout fails on server, clear local data
            this.handleLogoutSuccess();
            return throwError(() => error);
          })
        );
    } else {
      this.handleLogoutSuccess();
      return new Observable(observer => {
        observer.next({});
        observer.complete();
      });
    }
  }

  /**
   * Logout from all devices
   */
  logoutAll(): Observable<any> {
    return this.http.post(`${this.API_URL}/users/logout-all`, {})
      .pipe(
        tap(() => this.handleLogoutSuccess()),
        catchError(error => {
          this.handleLogoutSuccess();
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user profile from server
   */
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/profile`)
      .pipe(
        tap(user => this.currentUserSignal.set(user)),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Check if user needs to refresh token soon
   */
  shouldRefreshToken(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;

    // Refresh if token expires within buffer time
    return timeUntilExpiry <= environment.tokenExpirationBuffer;
  }

  /**
   * Get stored access token
   */
  getStoredToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getStoredRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      // Store tokens and user data
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }

    // Update reactive state
    this.currentUserSignal.set(response.user);
    this.isAuthenticatedSignal.set(true);
  }

  /**
   * Handle logout success
   */
  private handleLogoutSuccess(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }

    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred during authentication';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({
      message: errorMessage,
      violations: error.error?.violations || [],
      statusCode: error.status
    } as ErrorResponse));
  }
}
