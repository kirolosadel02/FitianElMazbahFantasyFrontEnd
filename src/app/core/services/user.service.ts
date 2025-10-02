import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  UpdateUserDto,
  PaginatedResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/Users`;

  // Signals for reactive state
  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Get all users with pagination
   */
  getUsers(
    page: number = 1,
    pageSize: number = 20,
    search?: string
  ): Observable<PaginatedResponse<User>> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          this.users.set(response.items);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<User> {
    this.isLoading.set(true);

    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(user => {
          this.selectedUser.set(user);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Update user profile
   */
  updateUser(id: number, updateDto: UpdateUserDto): Observable<User> {
    this.isLoading.set(true);

    return this.http.put<User>(`${this.apiUrl}/${id}`, updateDto)
      .pipe(
        tap(user => {
          // Update the user in the list
          const currentUsers = this.users();
          const index = currentUsers.findIndex(u => u.id === id);
          if (index !== -1) {
            currentUsers[index] = user;
            this.users.set([...currentUsers]);
          }

          // Update selected user if it's the same
          if (this.selectedUser()?.id === id) {
            this.selectedUser.set(user);
          }

          this.isLoading.set(false);
        })
      );
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<void> {
    this.isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Remove from the list
          const currentUsers = this.users();
          const filteredUsers = currentUsers.filter(u => u.id !== id);
          this.users.set(filteredUsers);

          // Clear selected if it was deleted
          if (this.selectedUser()?.id === id) {
            this.selectedUser.set(null);
          }

          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get user profile (current user)
   */
  getCurrentUserProfile(): Observable<User> {
    this.isLoading.set(true);

    return this.http.get<User>(`${this.apiUrl}/profile`)
      .pipe(
        tap(user => {
          this.selectedUser.set(user);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Update current user profile
   */
  updateCurrentUserProfile(updateDto: UpdateUserDto): Observable<User> {
    this.isLoading.set(true);

    return this.http.put<User>(`${this.apiUrl}/profile`, updateDto)
      .pipe(
        tap(user => {
          this.selectedUser.set(user);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    this.isLoading.set(true);

    const changePasswordDto = {
      currentPassword,
      newPassword
    };

    return this.http.post<any>(`${this.apiUrl}/change-password`, changePasswordDto)
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<User[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('q', query);

    return this.http.get<User[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        tap(users => {
          this.users.set(users);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<User[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('role', role);

    return this.http.get<User[]>(`${this.apiUrl}/role`, { params })
      .pipe(
        tap(users => {
          this.users.set(users);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get user statistics
   */
  getUserStatistics(id: number): Observable<any> {
    this.isLoading.set(true);

    return this.http.get<any>(`${this.apiUrl}/${id}/statistics`)
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Get all users (Admin only)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Update user role (Admin only)
   */
  updateUserRole(id: number, role: 'User' | 'Admin'): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role });
  }

  /**
   * Clear selected user
   */
  clearSelectedUser(): void {
    this.selectedUser.set(null);
  }

  /**
   * Clear users list
   */
  clearUsers(): void {
    this.users.set([]);
  }
}
