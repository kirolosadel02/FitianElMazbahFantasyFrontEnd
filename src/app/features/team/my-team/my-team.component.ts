import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserTeamService, MatchweekService, AuthService } from '../../../core/services';
import { UserTeam, UserTeamDetailsDto, Matchweek, Player } from '../../../core/models';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css']
})
export class MyTeamComponent implements OnInit {
  // Signals for reactive state
  currentUserTeam = signal<UserTeamDetailsDto | null>(null);
  currentMatchweek = signal<Matchweek | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed properties
  hasTeam = computed(() => !!this.currentUserTeam());
  isTeamValid = computed(() => {
    const team = this.currentUserTeam();
    return team?.players?.length === 4; // Backend requires exactly 4 players
  });

  constructor(
    private userTeamService: UserTeamService,
    public matchweekService: MatchweekService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentMatchweek();
    this.loadUserTeam();
  }

  private loadCurrentMatchweek(): void {
    this.isLoading.set(true);
    this.matchweekService.getCurrentMatchweek().subscribe({
      next: (matchweek) => {
        this.currentMatchweek.set(matchweek);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading current matchweek:', error);
        this.error.set('Failed to load current matchweek');
        this.isLoading.set(false);
      }
    });
  }

  loadUserTeam(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.isLoading.set(true);
    this.userTeamService.getUserTeamsByUserId(userId).subscribe({
      next: (teams) => {
        if (teams.length > 0) {
          // Load detailed team info
          this.userTeamService.getUserTeamById(teams[0].id).subscribe({
            next: (teamDetails) => {
              this.currentUserTeam.set(teamDetails);
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('Error loading team details:', error);
              this.error.set('Failed to load team details');
              this.isLoading.set(false);
            }
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading user teams:', error);
        this.error.set('Failed to load user teams');
        this.isLoading.set(false);
      }
    });
  }

  createNewTeam(): void {
    const matchweek = this.currentMatchweek();
    if (!matchweek) {
      this.error.set('No active matchweek found');
      return;
    }

    const createDto = {
      matchweekId: matchweek.id,
      teamName: `${this.authService.currentUser()?.username}'s Team`,
      playerIds: [],
      captainId: 0,
      viceCaptainId: 0
    };

    this.isLoading.set(true);
    this.userTeamService.createUserTeam(createDto).subscribe({
      next: (newTeam) => {
        // Load the detailed team info
        this.userTeamService.getUserTeamById(newTeam.id).subscribe({
          next: (teamDetails) => {
            this.currentUserTeam.set(teamDetails);
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Error creating team:', error);
        this.error.set('Failed to create team');
        this.isLoading.set(false);
      }
    });
  }

  getPlayersByPosition(position: string): Player[] {
    const team = this.currentUserTeam();
    if (!team?.players) return [];
    return team.players.filter(player => player.position.toString() === position);
  }

  removePlayer(playerId: number): void {
    const team = this.currentUserTeam();
    if (!team) return;

    const updatedPlayerIds = team.players
      .filter(p => p.id !== playerId)
      .map(p => p.id);

    const updateDto = {
      playerIds: updatedPlayerIds,
      teamName: team.teamName
    };

    this.isLoading.set(true);
    this.userTeamService.updateUserTeam(team.id, updateDto).subscribe({
      next: () => {
        this.loadUserTeam();
      },
      error: (error) => {
        console.error('Error removing player:', error);
        this.error.set('Failed to remove player');
        this.isLoading.set(false);
      }
    });
  }

  validateTeam(): void {
    const team = this.currentUserTeam();
    if (!team) return;

    this.isLoading.set(true);
    this.userTeamService.validateUserTeam(team.id).subscribe({
      next: (validation) => {
        console.log('Team validation:', validation);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error validating team:', error);
        this.error.set('Team validation failed');
        this.isLoading.set(false);
      }
    });
  }

  submitTeam(): void {
    const team = this.currentUserTeam();
    if (!team) return;

    this.isLoading.set(true);
    this.userTeamService.submitUserTeam(team.id).subscribe({
      next: (submittedTeam) => {
        this.loadUserTeam();
      },
      error: (error) => {
        console.error('Error submitting team:', error);
        this.error.set('Failed to submit team');
        this.isLoading.set(false);
      }
    });
  }
}
