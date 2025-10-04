import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TeamService } from '../../../core/services';
import { Team } from '../../../core/models';

/**
 * Admin Teams Management Component
 *
 * This component provides CRUD operations for managing football teams.
 * Uses admin-only endpoints that require Admin role authorization:
 *
 * - GET /api/teams - View all teams
 * - POST /api/teams - Create new team
 * - PUT /api/teams/{id} - Update team
 * - DELETE /api/teams/{id} - Delete team (only if no players assigned)
 *
 * Protected by AdminGuard - only accessible to users with Admin role.
 */

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-teams.component.html',
  styleUrls: ['./admin-teams.component.css']
})
export class AdminTeamsComponent implements OnInit {
  // Signals for reactive state
  teams = signal<Team[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  showAddForm = signal(false);
  editingTeam = signal<Team | null>(null);

  // Forms
  teamForm: FormGroup;

  constructor(
    private teamService: TeamService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      logoUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  private loadTeams(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.error.set('Failed to load teams');
        this.isLoading.set(false);
      }
    });
  }

  openAddForm(): void {
    this.showAddForm.set(true);
    this.editingTeam.set(null);
    this.teamForm.reset();
  }

  closeForm(): void {
    this.showAddForm.set(false);
    this.editingTeam.set(null);
    this.teamForm.reset();
  }

  editTeam(team: Team): void {
    this.editingTeam.set(team);
    this.showAddForm.set(true);
    this.teamForm.patchValue({
      name: team.name,
      logoUrl: team.logoUrl || ''
    });
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      const formData = this.teamForm.value;
      const editing = this.editingTeam();

      if (editing) {
        // Update existing team
        this.teamService.updateTeam(editing.id, {
          name: formData.name,
          logoUrl: formData.logoUrl || undefined
        }).subscribe({
          next: () => {
            this.loadTeams();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating team:', error);

            // Handle specific API error responses
            if (error.status === 400) {
              this.error.set('Invalid team data. Please check your input and try again.');
            } else if (error.status === 404) {
              this.error.set('Team not found. It may have been deleted.');
              this.loadTeams(); // Refresh the list
            } else {
              this.error.set('Failed to update team. Please try again.');
            }
          }
        });
      } else {
        // Create new team
        this.teamService.createTeam({
          name: formData.name,
          logoUrl: formData.logoUrl || undefined
        }).subscribe({
          next: () => {
            this.loadTeams();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating team:', error);

            // Handle specific API error responses
            if (error.status === 400) {
              this.error.set('Invalid team data. Please check your input and try again.');
            } else {
              this.error.set('Failed to create team. Please try again.');
            }
          }
        });
      }
    }
  }

  deleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to delete ${team.name}? This action cannot be undone.`)) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => {
          this.loadTeams();
        },
        error: (error) => {
          console.error('Error deleting team:', error);

          // Handle specific API error responses
          if (error.status === 400) {
            this.error.set('Cannot delete team: This team has existing players. Remove all players first.');
          } else if (error.status === 404) {
            this.error.set('Team not found. It may have been already deleted.');
            this.loadTeams(); // Refresh the list
          } else {
            this.error.set('Failed to delete team. Please try again.');
          }
        }
      });
    }
  }
}
