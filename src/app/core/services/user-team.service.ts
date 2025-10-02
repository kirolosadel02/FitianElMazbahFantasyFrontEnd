import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  UserTeam,
  CreateUserTeamDto,
  UpdateUserTeamDto,
  UserTeamDetailsDto,
  PaginatedResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserTeamService {
  private readonly apiUrl = `${environment.apiUrl}/UserTeams`;

  // Signals for reactive state
  userTeams = signal<UserTeam[]>([]);
  selectedUserTeam = signal<UserTeamDetailsDto | null>(null);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Get user teams with pagination
   */
  getUserTeams(
    page: number = 1,
    pageSize: number = 20,
    userId?: number
  ): Observable<PaginatedResponse<UserTeam>> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (userId) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<PaginatedResponse<UserTeam>>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          this.userTeams.set(response.items);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get user team by ID with full details
   */
  getUserTeamById(id: number): Observable<UserTeamDetailsDto> {
    this.isLoading.set(true);

    return this.http.get<UserTeamDetailsDto>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(userTeam => {
          this.selectedUserTeam.set(userTeam);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get user teams by user ID
   */
  getUserTeamsByUserId(userId: number): Observable<UserTeam[]> {
    this.isLoading.set(true);

    return this.http.get<UserTeam[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        tap(userTeams => {
          this.userTeams.set(userTeams);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get user teams by matchweek
   */
  getUserTeamsByMatchweek(matchweekId: number): Observable<UserTeam[]> {
    this.isLoading.set(true);

    return this.http.get<UserTeam[]>(`${this.apiUrl}/matchweek/${matchweekId}`)
      .pipe(
        tap(userTeams => {
          this.userTeams.set(userTeams);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Create a new user team
   */
  createUserTeam(createDto: CreateUserTeamDto): Observable<UserTeam> {
    this.isLoading.set(true);

    return this.http.post<UserTeam>(this.apiUrl, createDto)
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Update user team
   */
  updateUserTeam(id: number, updateDto: UpdateUserTeamDto): Observable<UserTeam> {
    this.isLoading.set(true);

    return this.http.put<UserTeam>(`${this.apiUrl}/${id}`, updateDto)
      .pipe(
        tap(userTeam => {
          // Update the user team in the list
          const currentTeams = this.userTeams();
          const index = currentTeams.findIndex(ut => ut.id === id);
          if (index !== -1) {
            currentTeams[index] = userTeam;
            this.userTeams.set([...currentTeams]);
          }
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Delete user team
   */
  deleteUserTeam(id: number): Observable<void> {
    this.isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Remove from the list
          const currentTeams = this.userTeams();
          const filteredTeams = currentTeams.filter(ut => ut.id !== id);
          this.userTeams.set(filteredTeams);

          // Clear selected if it was deleted
          if (this.selectedUserTeam()?.id === id) {
            this.selectedUserTeam.set(null);
          }

          this.isLoading.set(false);
        })
      );
  }

  /**
   * Validate user team
   */
  validateUserTeam(id: number): Observable<any> {
    this.isLoading.set(true);

    return this.http.post<any>(`${this.apiUrl}/${id}/validate`, {})
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Submit user team for matchweek
   */
  submitUserTeam(id: number): Observable<UserTeam> {
    this.isLoading.set(true);

    return this.http.post<UserTeam>(`${this.apiUrl}/${id}/submit`, {})
      .pipe(
        tap(userTeam => {
          // Update the user team in the list
          const currentTeams = this.userTeams();
          const index = currentTeams.findIndex(ut => ut.id === id);
          if (index !== -1) {
            currentTeams[index] = userTeam;
            this.userTeams.set([...currentTeams]);
          }
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get user team leaderboard for matchweek
   */
  getLeaderboard(matchweekId: number): Observable<UserTeam[]> {
    this.isLoading.set(true);

    return this.http.get<UserTeam[]>(`${this.apiUrl}/leaderboard/${matchweekId}`)
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Get all user teams (Admin only)
   */
  getAllUserTeams(): Observable<UserTeam[]> {
    return this.http.get<UserTeam[]>(this.apiUrl);
  }

  /**
   * Unlock user team (Admin only)
   */
  unlockUserTeam(id: number): Observable<UserTeam> {
    return this.http.post<UserTeam>(`${this.apiUrl}/${id}/unlock`, {});
  }

  /**
   * Update user team points (Admin only)
   */
  updateUserTeamPoints(id: number, points: number): Observable<UserTeam> {
    return this.http.patch<UserTeam>(`${this.apiUrl}/${id}/points`, { totalPoints: points });
  }

  /**
   * Clear selected user team
   */
  clearSelectedUserTeam(): void {
    this.selectedUserTeam.set(null);
  }

  /**
   * Clear user teams list
   */
  clearUserTeams(): void {
    this.userTeams.set([]);
  }
}
