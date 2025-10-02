import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService, UserTeamService, MatchweekService } from '../../../core/services';
import { UserTeamDetailsDto, Matchweek } from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser = computed(() => this.authService.currentUser());
  
  // Fantasy team data
  userTeam = signal<UserTeamDetailsDto | null>(null);
  currentMatchweek = signal<Matchweek | null>(null);
  isLoading = signal(true);
  
  // Computed stats
  totalPoints = computed(() => this.userTeam()?.totalPoints || 0);
  playerCount = computed(() => this.userTeam()?.players?.length || 0);
  teamName = computed(() => this.userTeam()?.teamName || 'No Team Created');
  isTeamLocked = computed(() => this.userTeam()?.isLocked || false);

  constructor(
    private authService: AuthService,
    private userTeamService: UserTeamService,
    private matchweekService: MatchweekService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      const userId = this.currentUser()?.id;
      if (!userId) return;

      // Load current matchweek and user team
      const [matchweek, userTeams] = await Promise.all([
        this.matchweekService.getCurrentMatchweek().toPromise(),
        this.userTeamService.getUserTeamsByUserId(userId).toPromise()
      ]);

      this.currentMatchweek.set(matchweek || null);

      if (userTeams && userTeams.length > 0) {
        // Get detailed team info
        const teamDetails = await this.userTeamService.getUserTeamById(userTeams[0].id).toPromise();
        this.userTeam.set(teamDetails || null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getTimeUntilDeadline(): string {
    const matchweek = this.currentMatchweek();
    if (!matchweek) return 'N/A';
    
    const now = new Date();
    const deadline = new Date(matchweek.deadlineDate);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Deadline passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }
}
