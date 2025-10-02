import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Matchweek,
  PaginatedResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MatchweekService {
  private readonly apiUrl = `${environment.apiUrl}/Matchweeks`;

  // Signals for reactive state
  matchweeks = signal<Matchweek[]>([]);
  selectedMatchweek = signal<Matchweek | null>(null);
  currentMatchweek = signal<Matchweek | null>(null);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Get all matchweeks with pagination
   */
  getMatchweeks(
    page: number = 1,
    pageSize: number = 20
  ): Observable<PaginatedResponse<Matchweek>> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<Matchweek>>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          this.matchweeks.set(response.items);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get all matchweeks (without pagination)
   */
  getAllMatchweeks(): Observable<Matchweek[]> {
    this.isLoading.set(true);

    return this.http.get<Matchweek[]>(`${this.apiUrl}/all`)
      .pipe(
        tap(matchweeks => {
          this.matchweeks.set(matchweeks);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get matchweek by ID
   */
  getMatchweekById(id: number): Observable<Matchweek> {
    this.isLoading.set(true);

    return this.http.get<Matchweek>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(matchweek => {
          this.selectedMatchweek.set(matchweek);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get current matchweek
   */
  getCurrentMatchweek(): Observable<Matchweek> {
    this.isLoading.set(true);

    return this.http.get<Matchweek>(`${this.apiUrl}/current`)
      .pipe(
        tap(matchweek => {
          this.currentMatchweek.set(matchweek);
          this.selectedMatchweek.set(matchweek);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get next matchweek
   */
  getNextMatchweek(): Observable<Matchweek> {
    this.isLoading.set(true);

    return this.http.get<Matchweek>(`${this.apiUrl}/next`)
      .pipe(
        tap(matchweek => {
          this.selectedMatchweek.set(matchweek);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get previous matchweek
   */
  getPreviousMatchweek(): Observable<Matchweek> {
    this.isLoading.set(true);

    return this.http.get<Matchweek>(`${this.apiUrl}/previous`)
      .pipe(
        tap(matchweek => {
          this.selectedMatchweek.set(matchweek);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get matchweeks by status
   */
  getMatchweeksByStatus(isActive: boolean): Observable<Matchweek[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('isActive', isActive.toString());

    return this.http.get<Matchweek[]>(`${this.apiUrl}/status`, { params })
      .pipe(
        tap(matchweeks => {
          this.matchweeks.set(matchweeks);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get matchweeks by date range
   */
  getMatchweeksByDateRange(startDate: string, endDate: string): Observable<Matchweek[]> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<Matchweek[]>(`${this.apiUrl}/daterange`, { params })
      .pipe(
        tap(matchweeks => {
          this.matchweeks.set(matchweeks);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get upcoming matchweeks
   */
  getUpcomingMatchweeks(limit: number = 5): Observable<Matchweek[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<Matchweek[]>(`${this.apiUrl}/upcoming`, { params })
      .pipe(
        tap(matchweeks => {
          this.matchweeks.set(matchweeks);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get completed matchweeks
   */
  getCompletedMatchweeks(limit: number = 10): Observable<Matchweek[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<Matchweek[]>(`${this.apiUrl}/completed`, { params })
      .pipe(
        tap(matchweeks => {
          this.matchweeks.set(matchweeks);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Check if matchweek is currently active
   */
  isMatchweekActive(matchweek: Matchweek): boolean {
    return matchweek.isActive && !matchweek.isCompleted;
  }

  /**
   * Check if deadline has passed for matchweek
   */
  isDeadlinePassed(matchweek: Matchweek): boolean {
    const now = new Date();
    const deadline = new Date(matchweek.deadlineDate);

    return now > deadline;
  }

  /**
   * Get time until deadline
   */
  getTimeUntilDeadline(matchweek: Matchweek): number {
    const now = new Date();
    const deadline = new Date(matchweek.deadlineDate);

    return deadline.getTime() - now.getTime();
  }

  /**
   * Create new matchweek (Admin only)
   */
  createMatchweek(matchweekData: {
    weekNumber: number;
    deadlineDate: string;
  }): Observable<Matchweek> {
    return this.http.post<Matchweek>(this.apiUrl, matchweekData);
  }

  /**
   * Update matchweek (Admin only)
   */
  updateMatchweek(id: number, matchweekData: {
    weekNumber?: number;
    deadlineDate?: string;
    isActive?: boolean;
    isCompleted?: boolean;
  }): Observable<Matchweek> {
    return this.http.put<Matchweek>(`${this.apiUrl}/${id}`, matchweekData);
  }

  /**
   * Delete matchweek (Admin only)
   */
  deleteMatchweek(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activate matchweek (Admin only)
   */
  activateMatchweek(id: number): Observable<Matchweek> {
    return this.http.post<Matchweek>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * Complete matchweek (Admin only)
   */
  completeMatchweek(id: number): Observable<Matchweek> {
    return this.http.post<Matchweek>(`${this.apiUrl}/${id}/complete`, {});
  }

  /**
   * Clear selected matchweek
   */
  clearSelectedMatchweek(): void {
    this.selectedMatchweek.set(null);
  }

  /**
   * Clear matchweeks list
   */
  clearMatchweeks(): void {
    this.matchweeks.set([]);
  }
}
