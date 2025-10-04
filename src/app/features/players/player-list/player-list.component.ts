import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PlayerService, TeamService, UserTeamService, AuthService } from '../../../core/services';
import { Player, Team } from '../../../core/models';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  // Signals for reactive state
  players = signal<Player[]>([]);
  teams = signal<Team[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Filter signals
  selectedPosition = signal<string>('');
  selectedTeam = signal<number | null>(null);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  totalPages = signal<number>(1);

  // Computed properties
  filteredPlayers = computed(() => {
    let result = this.players();

    const position = this.selectedPosition();
    if (position) {
      result = result.filter(player => player.position === position);
    }

    const teamId = this.selectedTeam();
    if (teamId) {
      result = result.filter(player => player.teamId === teamId);
    }

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(player =>
        player.name.toLowerCase().includes(query) ||
        player.teamName?.toLowerCase().includes(query)
      );
    }

    return result;
  });

  // Available positions - match backend API
  readonly positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService,
    private userTeamService: UserTeamService,
    private authService: AuthService
  ) {}

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
      }
    });
  }

  private loadPlayers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const positionNumber = this.getPositionNumber(this.selectedPosition());
    const teamId = this.selectedTeam() || undefined;
    const name = this.searchQuery() || undefined;

    this.playerService.getPlayers(
      this.currentPage(),
      this.pageSize(),
      positionNumber,
      teamId,
      name
    ).subscribe({
      next: (players: Player[]) => {
        this.players.set(players);
        // Calculate total pages based on returned data length
        this.totalPages.set(Math.ceil(players.length / this.pageSize()) || 1);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.error.set('Failed to load players. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onPositionChange(position: string): void {
    this.selectedPosition.set(position || '');
    this.currentPage.set(1);
    this.loadPlayers();
  }

  private getPositionNumber(positionName: string): number | undefined {
    const positionMap: { [key: string]: number } = {
      'Goalkeeper': 1,
      'Defender': 2,
      'Midfielder': 3,
      'Forward': 4
    };
    return positionName ? positionMap[positionName] : undefined;
  }

  onTeamChange(teamId: string): void {
    this.selectedTeam.set(teamId ? parseInt(teamId) : null);
    this.currentPage.set(1);
    this.loadPlayers();
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.loadPlayers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPlayers();
    // Scroll to top
    window.scrollTo(0, 0);
  }

  addPlayerToTeam(player: Player): void {
    // This would typically get the user's current team and add the player
    // For now, we'll show a simple success message
    console.log('Adding player to team:', player);

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      this.error.set('User not authenticated');
      return;
    }

    // Get user's current team
    this.userTeamService.getUserTeamsByUserId(userId).subscribe({
      next: (teams) => {
        if (teams.length === 0) {
          this.error.set('No team found. Please create a team first.');
          return;
        }

        const team = teams[0];

        // Get current team details to add the player
        this.userTeamService.getUserTeamById(team.id).subscribe({
          next: (teamDetails) => {
            const currentPlayerIds = teamDetails.players?.map(p => p.id) || [];

            // Check if player is already in team
            if (currentPlayerIds.includes(player.id)) {
              this.error.set('Player is already in your team');
              return;
            }

            // Check team size limit (4 players as per backend requirement)
            if (currentPlayerIds.length >= 4) {
              this.error.set('Team is full (4 players maximum)');
              return;
            }

            // Add player to team
            const updatedPlayerIds = [...currentPlayerIds, player.id];
            const updateDto = {
              playerIds: updatedPlayerIds,
              teamName: team.teamName
            };

            this.userTeamService.updateUserTeam(team.id, updateDto).subscribe({
              next: () => {
                this.error.set(null);
                // Show success message or navigate back to team
                console.log('Player added successfully!');
              },
              error: (error) => {
                console.error('Error adding player:', error);
                this.error.set('Failed to add player to team');
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error loading user team:', error);
        this.error.set('Failed to load your team');
      }
    });
  }

  getPositionClass(position: string): string {
    switch (position) {
      case 'Goalkeeper': return 'goalkeeper';
      case 'Defender': return 'defender';
      case 'Midfielder': return 'midfielder';
      case 'Forward': return 'forward';
      default: return '';
    }
  }

  clearFilters(): void {
    this.selectedPosition.set('');
    this.selectedTeam.set(null);
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadPlayers();
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
