import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Team,
  PaginatedResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly apiUrl = `${environment.apiUrl}/Teams`;

  // Signals for reactive state
  teams = signal<Team[]>([]);
  selectedTeam = signal<Team | null>(null);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  // ========================================
  // USER METHODS - Available to all authenticated users
  // ========================================

  // Note: The API only provides GET /api/teams (all teams) - no pagination or search endpoints

  /**
   * Get all teams (without pagination) - User endpoint
   * API: GET /api/teams
   * Returns: Array of TeamDto objects (200 OK)
   * Authorization: Required (JWT Token)
   */
  getAllTeams(): Observable<Team[]> {
    this.isLoading.set(true);

    return this.http.get<Team[]>(this.apiUrl)
      .pipe(
        tap(teams => {
          this.teams.set(teams);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get team by ID - Returns team with players
   * API: GET /api/teams/{id}
   * Returns: TeamWithPlayersDto object (200 OK)
   * Errors: 404 Not Found, 500 Internal Server Error
   * Authorization: Required (JWT Token)
   */
  getTeamById(id: number): Observable<Team> {
    this.isLoading.set(true);

    return this.http.get<Team>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(team => {
          this.selectedTeam.set(team);
          this.isLoading.set(false);
        })
      );
  }

  // Search functionality not available in current API specification

  // Note: getTeamById already returns team with players (TeamWithPlayersDto)

  // ========================================
  // ADMIN METHODS - Require Admin role authorization
  // ========================================

  /**
   * Create new team (Admin only)
   * API: POST /api/teams
   * Body: CreateTeamDto { name: string, logoUrl?: string }
   * Returns: TeamDto object with Location header (201 Created)
   * Errors: 400 Bad Request (validation), 500 Internal Server Error
   * Authorization: Required (Admin role)
   */
  createTeam(teamData: {
    name: string;
    logoUrl?: string;
  }): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, teamData);
  }

  /**
   * Update team (Admin only)
   * API: PUT /api/teams/{id}
   * Body: UpdateTeamDto { name: string, logoUrl?: string }
   * Returns: Updated TeamDto object (200 OK)
   * Errors: 400 Bad Request (validation), 404 Not Found, 500 Internal Server Error
   * Authorization: Required (Admin role)
   */
  updateTeam(id: number, teamData: {
    name: string;
    logoUrl?: string;
  }): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, teamData);
  }

  /**
   * Delete team (Admin only)
   * API: DELETE /api/teams/{id}
   * Returns: 204 No Content (success)
   * Errors: 400 Bad Request (team has players), 404 Not Found, 500 Internal Server Error
   * Authorization: Required (Admin role)
   * Note: Can only delete teams with no existing players
   */
  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Clear selected team
   */
  clearSelectedTeam(): void {
    this.selectedTeam.set(null);
  }

  /**
   * Clear teams list
   */
  clearTeams(): void {
    this.teams.set([]);
  }
}
