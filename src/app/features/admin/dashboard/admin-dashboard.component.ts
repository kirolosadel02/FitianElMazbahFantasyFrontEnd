import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PlayerService, TeamService, UserTeamService, MatchweekService, UserService } from '../../../core/services';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Stats signals
  totalPlayers = signal(0);
  totalTeams = signal(0);
  totalUsers = signal(0);
  totalUserTeams = signal(0);
  activeMatchweeks = signal(0);
  isLoading = signal(true);

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService,
    private userTeamService: UserTeamService,
    private matchweekService: MatchweekService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private async loadStats(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Load all stats in parallel
      const [players, teams, users, userTeams, matchweeks] = await Promise.all([
        this.playerService.getPlayers(1, 1).toPromise(),
        this.teamService.getAllTeams().toPromise(),
        this.userService.getAllUsers().toPromise(),
        this.userTeamService.getAllUserTeams().toPromise(),
        this.matchweekService.getAllMatchweeks().toPromise()
      ]);

      if (players) this.totalPlayers.set(players.totalItems || 0);
      if (teams) this.totalTeams.set(teams.length);
      if (users) this.totalUsers.set(users.length);
      if (userTeams) this.totalUserTeams.set(userTeams.length);
      if (matchweeks) {
        this.activeMatchweeks.set(matchweeks.filter(m => m.isActive).length);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
