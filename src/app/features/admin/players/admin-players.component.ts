import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PlayerService, TeamService } from '../../../core/services';
import { Player, Team } from '../../../core/models';

/**
 * Admin Players Management Component
 *
 * This component provides CRUD operations for managing football players.
 * Uses admin-only endpoints that require Admin role authorization:
 *
 * - GET /api/players - View all players with filtering
 * - POST /api/players - Create new player
 * - PUT /api/players/{id} - Update player
 * - DELETE /api/players/{id} - Delete player
 *
 * Protected by AdminGuard - only accessible to users with Admin role.
 */

@Component({
  selector: 'app-admin-players',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-players.component.html',
  styleUrls: ['./admin-players.component.css']
})
export class AdminPlayersComponent implements OnInit {
  // Signals for reactive state
  players = signal<Player[]>([]);
  teams = signal<Team[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  showAddForm = signal(false);
  editingPlayer = signal<Player | null>(null);

  // Pagination
  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 20;

  // Forms
  playerForm: FormGroup;

  // Position options matching backend API (1-4: Goalkeeper, Defender, Midfielder, Forward)
  positions = [
    { id: 1, name: 'Goalkeeper' },
    { id: 2, name: 'Defender' },
    { id: 3, name: 'Midfielder' },
    { id: 4, name: 'Forward' }
  ];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService,
    private fb: FormBuilder
  ) {
    this.playerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      position: ['', Validators.required],
      teamId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTeams();
    this.loadPlayers();
  }

  private loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.error.set('Failed to load teams');
      }
    });
  }

  private loadPlayers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.playerService.getPlayers(
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (players: Player[]) => {
        this.players.set(players);
        // Note: API returns array directly, not paginated response
        // Calculate total pages based on returned data length
        this.totalPages.set(Math.ceil(players.length / this.pageSize) || 1);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.error.set('Failed to load players. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPlayers();
  }

  openAddForm(): void {
    this.showAddForm.set(true);
    this.editingPlayer.set(null);
    this.playerForm.reset();
  }

  closeForm(): void {
    this.showAddForm.set(false);
    this.editingPlayer.set(null);
    this.playerForm.reset();
  }

  editPlayer(player: Player): void {
    this.editingPlayer.set(player);
    this.showAddForm.set(true);

    // Convert position string to numeric value for form
    const positionValue = this.getPositionValue(player.position);

    this.playerForm.patchValue({
      name: player.name,
      position: positionValue,
      teamId: player.teamId
    });
  }

  private getPositionValue(positionName: string): number {
    const positionMap: { [key: string]: number } = {
      'Goalkeeper': 1,
      'Defender': 2,
      'Midfielder': 3,
      'Forward': 4
    };
    return positionMap[positionName] || 1;
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      const formData = this.playerForm.value;
      const editing = this.editingPlayer();

      if (editing) {
        // Update existing player
        this.playerService.updatePlayer(editing.id, {
          name: formData.name,
          position: parseInt(formData.position),
          teamId: parseInt(formData.teamId)
        }).subscribe({
          next: () => {
            this.loadPlayers();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating player:', error);

            // Handle specific API error responses
            if (error.status === 400) {
              this.error.set('Invalid player data. Please check position (1-4) and team selection.');
            } else if (error.status === 404) {
              this.error.set('Player not found. It may have been deleted.');
              this.loadPlayers(); // Refresh the list
            } else {
              this.error.set('Failed to update player. Please try again.');
            }
            this.error.set('Failed to update player');
          }
        });
      } else {
        // Create new player
        this.playerService.createPlayer({
          name: formData.name,
          position: this.getPositionNumber(formData.position),
          teamId: formData.teamId
        }).subscribe({
          next: () => {
            this.loadPlayers();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating player:', error);
            this.error.set('Failed to create player');
          }
        });
      }
    }
  }

  deletePlayer(player: Player): void {
    if (confirm(`Are you sure you want to delete ${player.name}?`)) {
      this.playerService.deletePlayer(player.id).subscribe({
        next: () => {
          this.loadPlayers();
        },
        error: (error) => {
          console.error('Error deleting player:', error);
          this.error.set('Failed to delete player');
        }
      });
    }
  }

  private getPositionNumber(positionString: string): number {
    switch (positionString) {
      case 'Goalkeeper': return 1;
      case 'Defender': return 2;
      case 'Midfielder': return 3;
      case 'Forward': return 4;
      default: return 1;
    }
  }

  getTeamName(teamId: number): string {
    const team = this.teams().find(t => t.id === teamId);
    return team?.name || 'Unknown Team';
  }

  get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1); // Ellipsis
    }
    if (current + delta < total - 1) {
      range.push(-1); // Ellipsis
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range.filter((item, pos) => range.indexOf(item) === pos);
  }
}
