import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Player,
  PaginatedResponse,
  PlayerPosition
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly apiUrl = `${environment.apiUrl}/Players`;

  // Signals for reactive state
  players = signal<Player[]>([]);
  selectedPlayer = signal<Player | null>(null);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Get all players with pagination and filtering
   */
  getPlayers(
    page: number = 1,
    pageSize: number = 20,
    position?: string,
    teamId?: number,
    name?: string
  ): Observable<PaginatedResponse<Player>> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (position) {
      // Convert position string to backend enum value
      const positionMap: { [key: string]: number } = {
        'Goalkeeper': 1,
        'Defender': 2,
        'Midfielder': 3,
        'Forward': 4
      };
      if (positionMap[position]) {
        params = params.set('position', positionMap[position].toString());
      }
    }

    if (teamId) {
      params = params.set('teamId', teamId.toString());
    }

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<PaginatedResponse<Player>>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          this.players.set(response.items);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get player by ID
   */
  getPlayerById(id: number): Observable<Player> {
    this.isLoading.set(true);

    return this.http.get<Player>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(player => {
          this.selectedPlayer.set(player);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get players by team
   */
  getPlayersByTeam(teamId: number): Observable<Player[]> {
    this.isLoading.set(true);

    return this.http.get<Player[]>(`${this.apiUrl}/team/${teamId}`)
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Get players by position
   */
  getPlayersByPosition(position: PlayerPosition): Observable<Player[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('position', position);

    return this.http.get<Player[]>(`${this.apiUrl}/position`, { params })
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Search players by name
   */
  searchPlayers(query: string): Observable<Player[]> {
    this.isLoading.set(true);

    const params = new HttpParams().set('q', query);

    return this.http.get<Player[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Get top players by position
   */
  getTopPlayers(position: PlayerPosition, limit: number = 10): Observable<Player[]> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('position', position)
      .set('limit', limit.toString());

    return this.http.get<Player[]>(`${this.apiUrl}/top`, { params })
      .pipe(
        tap(() => this.isLoading.set(false))
      );
  }

  /**
   * Create new player (Admin only)
   */
  createPlayer(playerData: {
    name: string;
    position: number;
    teamId: number;
  }): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, playerData);
  }

  /**
   * Update player (Admin only)
   */
  updatePlayer(id: number, playerData: {
    name: string;
    position: string;
    teamId: number;
  }): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${id}`, playerData);
  }

  /**
   * Delete player (Admin only)
   */
  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Clear selected player
   */
  clearSelectedPlayer(): void {
    this.selectedPlayer.set(null);
  }

  /**
   * Clear players list
   */
  clearPlayers(): void {
    this.players.set([]);
  }
}
