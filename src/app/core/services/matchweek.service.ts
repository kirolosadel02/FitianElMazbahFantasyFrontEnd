import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Matchweek, CreateMatchweekDto, UpdateMatchweekDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MatchweekService {
  private readonly apiUrl = `${environment.apiUrl}/matchweeks`;

  // Signals for reactive state
  matchweeks = signal<Matchweek[]>([]);
  selectedMatchweek = signal<Matchweek | null>(null);
  currentMatchweek = signal<Matchweek | null>(null);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * GET /api/matchweeks - Get all matchweeks (public access)
   */
  getAllMatchweeks(): Observable<Matchweek[]> {
    this.isLoading.set(true);

    return this.http.get<Matchweek[]>(this.apiUrl)
      .pipe(
        tap(matchweeks => {
          this.matchweeks.set(matchweeks);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * GET /api/matchweeks/current - Get current active matchweek (public access)
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
   * GET /api/matchweeks/{id} - Get matchweek by ID (public access)
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
   * POST /api/matchweeks - Create new matchweek (admin only)
   */
  createMatchweek(matchweekDto: CreateMatchweekDto): Observable<Matchweek> {
    this.isLoading.set(true);

    return this.http.post<Matchweek>(this.apiUrl, matchweekDto)
      .pipe(
        tap(matchweek => {
          const currentMatchweeks = this.matchweeks();
          this.matchweeks.set([...currentMatchweeks, matchweek]);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * PUT /api/matchweeks/{id} - Update matchweek (admin only)
   */
  updateMatchweek(id: number, matchweekDto: UpdateMatchweekDto): Observable<Matchweek> {
    this.isLoading.set(true);

    return this.http.put<Matchweek>(`${this.apiUrl}/${id}`, matchweekDto)
      .pipe(
        tap(updatedMatchweek => {
          const currentMatchweeks = this.matchweeks();
          const updatedMatchweeks = currentMatchweeks.map(mw => 
            mw.id === id ? updatedMatchweek : mw
          );
          this.matchweeks.set(updatedMatchweeks);
          
          if (this.selectedMatchweek()?.id === id) {
            this.selectedMatchweek.set(updatedMatchweek);
          }
          
          if (this.currentMatchweek()?.id === id) {
            this.currentMatchweek.set(updatedMatchweek);
          }
          
          this.isLoading.set(false);
        })
      );
  }

  /**
   * DELETE /api/matchweeks/{id} - Delete matchweek (admin only)
   */
  deleteMatchweek(id: number): Observable<void> {
    this.isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentMatchweeks = this.matchweeks();
          const filteredMatchweeks = currentMatchweeks.filter(mw => mw.id !== id);
          this.matchweeks.set(filteredMatchweeks);
          
          if (this.selectedMatchweek()?.id === id) {
            this.selectedMatchweek.set(null);
          }
          
          if (this.currentMatchweek()?.id === id) {
            this.currentMatchweek.set(null);
          }
          
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Utility methods for UI state management
   */

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
