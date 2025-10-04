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

  // ========================================
  // USER METHODS - Available to all authenticated users
  // ========================================

  /**
   * Get all players with filtering and pagination
   * API: GET /api/players
   * Query Parameters: position?, teamId?, name?, pageNumber?, pageSize?
   * Returns: Array of PlayerDto objects (200 OK)
   * Authorization: Required (JWT Token)
   */
  getPlayers(
    pageNumber: number = 1,
    pageSize: number = 10,
    position?: number,
    teamId?: number,
    name?: string
  ): Observable<Player[]> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (position) {
      params = params.set('position', position.toString());
    }

    if (teamId) {
      params = params.set('teamId', teamId.toString());
    }

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<Player[]>(this.apiUrl, { params })
      .pipe(
        tap(players => {
          this.players.set(players);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get player by ID
   * API: GET /api/players/{id}
   * Returns: PlayerDto object (200 OK)
   * Errors: 404 Not Found, 500 Internal Server Error
   * Authorization: Required (JWT Token)
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
   * API: GET /api/players/team/{teamId}
   * Returns: Array of PlayerDto objects (200 OK)
   * Errors: 500 Internal Server Error
   * Authorization: Required (JWT Token)
   */
  getPlayersByTeam(teamId: number): Observable<Player[]> {
    this.isLoading.set(true);

    return this.http.get<Player[]>(`${this.apiUrl}/team/${teamId}`)
      .pipe(
        tap(players => {
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get players by position
   * API: GET /api/players/position/{position}
   * Returns: Array of PlayerDto objects (200 OK)
   * Errors: 400 Bad Request (invalid position), 500 Internal Server Error
   * Authorization: Required (JWT Token)
   * Position: 1-4 (Goalkeeper, Defender, Midfielder, Forward)
   */
  getPlayersByPosition(position: number): Observable<Player[]> {
    this.isLoading.set(true);

    return this.http.get<Player[]>(`${this.apiUrl}/position/${position}`)
      .pipe(
        tap(players => {
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Get total count of players
   * API: GET /api/players/count
   * Returns: Integer count (200 OK)
   * Errors: 500 Internal Server Error
   * Authorization: Required (JWT Token)
   */
  getPlayersCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  // Search and top players functionality not available in current API specification

  // ========================================
  // ADMIN METHODS - Require Admin role authorization
  // ========================================

  /**
   * Create new player (Admin only)
   * API: POST /api/players
   * Body: CreatePlayerDto { name: string, position: number (1-4), teamId: number }
   * Returns: PlayerDto object with Location header (201 Created)
   * Errors: 400 Bad Request (validation/invalid position/team), 500 Internal Server Error
   * Authorization: Required (Admin role)
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
   * API: PUT /api/players/{id}
   * Body: UpdatePlayerDto { name: string, position: number (1-4), teamId: number }
   * Returns: Updated PlayerDto object (200 OK)
   * Errors: 400 Bad Request (validation/invalid position/team), 404 Not Found, 500 Internal Server Error
   * Authorization: Required (Admin role)
   */
  updatePlayer(id: number, playerData: {
    name: string;
    position: number;
    teamId: number;
  }): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${id}`, playerData);
  }

  /**
   * Delete player (Admin only)
   * API: DELETE /api/players/{id}
   * Returns: 204 No Content (success)
   * Errors: 400 Bad Request (business rule violation), 404 Not Found, 500 Internal Server Error
   * Authorization: Required (Admin role)
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
