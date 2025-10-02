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

  /**
   * Get all teams with pagination
   */
  getTeams(
    page: number = 1,
    pageSize: number = 20,
    name?: string
  ): Observable<PaginatedResponse<Team>> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<PaginatedResponse<Team>>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          this.teams.set(response.items);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get all teams (without pagination)
   */
  getAllTeams(): Observable<Team[]> {
    this.isLoading.set(true);

    return this.http.get<Team[]>(`${this.apiUrl}/all`)
      .pipe(
        tap(teams => {
          this.teams.set(teams);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get team by ID
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

  /**
   * Search teams by name
   */
  searchTeams(query: string): Observable<Team[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('q', query);

    return this.http.get<Team[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        tap(teams => {
          this.teams.set(teams);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get team with players
   */
  getTeamWithPlayers(id: number): Observable<Team> {
    this.isLoading.set(true);

    return this.http.get<Team>(`${this.apiUrl}/${id}/players`)
      .pipe(
        tap(team => {
          this.selectedTeam.set(team);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Create new team (Admin only)
   */
  createTeam(teamData: {
    name: string;
    logoUrl?: string;
  }): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, teamData);
  }

  /**
   * Update team (Admin only)
   */
  updateTeam(id: number, teamData: {
    name: string;
    logoUrl?: string;
  }): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, teamData);
  }

  /**
   * Delete team (Admin only)
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
