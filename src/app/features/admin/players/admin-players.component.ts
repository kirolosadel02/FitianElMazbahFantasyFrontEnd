import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PlayerService, TeamService } from '../../../core/services';
import { Player, Team, PaginatedResponse, PlayerDto } from '../../../core/models';

@Component({
  selector: 'app-admin-players',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
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

  // Position options matching backend
  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

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
      next: (response: PaginatedResponse<Player>) => {
        this.players.set(response.items);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.error.set('Failed to load players');
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
    this.playerForm.patchValue({
      name: player.name,
      position: player.position,
      teamId: player.teamId
    });
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      const formData = this.playerForm.value;
      const editing = this.editingPlayer();

      if (editing) {
        // Update existing player
        this.playerService.updatePlayer(editing.id, {
          name: formData.name,
          position: formData.position,
          teamId: formData.teamId
        }).subscribe({
          next: () => {
            this.loadPlayers();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating player:', error);
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
