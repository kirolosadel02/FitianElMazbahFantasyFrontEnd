import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, EMPTY } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);

  // Skip interceptor for auth endpoints
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Get the access token
  const token = tokenStorage.getToken();

  // Clone request and add Authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Check if token needs refresh before making the request
  if (token && authService.shouldRefreshToken()) {
    return authService.refreshToken().pipe(
      switchMap(() => {
        // Get the new token and retry the original request
        const newToken = tokenStorage.getToken();
        if (newToken) {
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next(retryReq);
        }
        return next(authReq);
      }),
      catchError((error) => {
        // If refresh fails, proceed with original request
        return next(authReq);
      })
    );
  }

  // Proceed with the request and handle 401 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !isRefreshTokenEndpoint(req.url)) {
        // Token is invalid, try to refresh
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with new token
            const newToken = tokenStorage.getToken();
            if (newToken) {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            // Refresh failed, logout user
            authService.logout().subscribe();
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

/**
 * Check if the request is to an authentication endpoint
 */
function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/users/login',
    '/users/register',
    '/users/refresh-token'
  ];

  return authEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Check if the request is to the refresh token endpoint
 */
function isRefreshTokenEndpoint(url: string): boolean {
  return url.includes('/users/refresh-token');
}
