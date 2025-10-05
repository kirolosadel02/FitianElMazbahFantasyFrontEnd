import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchweekService } from '../../../core/services/matchweek.service';
import { Matchweek } from '../../../core/models';

type FilterStatus = 'all' | 'active' | 'completed' | 'upcoming';
type SortOption = 'weekNumber' | 'deadlineDate';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-matchweek-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="matchweek-list">
      <div class="header">
        <h2>Fantasy Football Matchweeks</h2>
        <p class="text-muted">View all matchweeks and track your progress</p>
      </div>

      <!-- Filters and Search -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row align-items-end">
            <div class="col-md-3">
              <label for="statusFilter" class="form-label">Filter by Status</label>
              <select 
                id="statusFilter" 
                class="form-select" 
                [(ngModel)]="statusFilter" 
                (ngModelChange)="onFilterChange()">
                <option value="all">All Matchweeks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            <div class="col-md-3">
              <label for="sortBy" class="form-label">Sort By</label>
              <select 
                id="sortBy" 
                class="form-select" 
                [(ngModel)]="sortBy" 
                (ngModelChange)="onSortChange()">
                <option value="weekNumber">Week Number</option>
                <option value="deadlineDate">Deadline Date</option>
              </select>
            </div>

            <div class="col-md-2">
              <label for="sortDirection" class="form-label">Direction</label>
              <select 
                id="sortDirection" 
                class="form-select" 
                [(ngModel)]="sortDirection" 
                (ngModelChange)="onSortChange()">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div class="col-md-4">
              <div class="d-flex gap-2">
                <button 
                  type="button" 
                  class="btn btn-primary"
                  (click)="goToCurrentMatchweek()"
                  [disabled]="!currentMatchweek()">
                  <i class="fas fa-play-circle"></i>
                  Current Matchweek
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  (click)="refreshMatchweeks()">
                  <i class="fas fa-sync-alt" [class.fa-spin]="matchweekService.isLoading()"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Matchweeks Grid -->
      @if (matchweekService.isLoading() && filteredMatchweeks().length === 0) {
        <div class="text-center p-5">
          <div class="spinner-border spinner-border-lg text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading matchweeks...</p>
        </div>
      } @else if (filteredMatchweeks().length === 0) {
        <div class="text-center p-5">
          <i class="fas fa-calendar-times fa-4x text-muted mb-3"></i>
          <h4>No Matchweeks Found</h4>
          <p class="text-muted">
            @if (statusFilter() !== 'all') {
              No {{ statusFilter() }} matchweeks available. Try changing your filter.
            } @else {
              No matchweeks have been created yet.
            }
          </p>
        </div>
      } @else {
        <!-- Desktop View -->
        <div class="d-none d-lg-block">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Time Remaining</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (matchweek of filteredMatchweeks(); track matchweek.id) {
                  <tr [class.table-warning]="matchweek.isActive" [class.table-success]="matchweek.isCompleted">
                    <td>
                      <div class="d-flex align-items-center">
                        <strong class="fs-5">{{ matchweek.weekNumber }}</strong>
                        @if (matchweek.isActive) {
                          <span class="badge bg-primary ms-2">Current</span>
                        }
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{{ formatDate(matchweek.deadlineDate) }}</strong>
                        <small class="d-block text-muted">
                          {{ formatTime(matchweek.deadlineDate) }}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column gap-1">
                        @if (matchweek.isCompleted) {
                          <span class="badge bg-success">Completed</span>
                        } @else if (matchweek.isActive) {
                          <span class="badge bg-primary">Active</span>
                        } @else {
                          <span class="badge bg-secondary">Upcoming</span>
                        }
                      </div>
                    </td>
                    <td>
                      @if (isDeadlinePassed(matchweek)) {
                        <span class="text-danger">
                          <i class="fas fa-times-circle"></i>
                          Deadline passed
                        </span>
                      } @else {
                        <span class="text-success">
                          <i class="fas fa-clock"></i>
                          {{ getTimeUntilDeadlineText(matchweek) }}
                        </span>
                      }
                    </td>
                    <td>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-primary"
                        [routerLink]="['/matchweeks', matchweek.id]">
                        <i class="fas fa-eye"></i>
                        View Details
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile/Tablet View -->
        <div class="d-lg-none">
          <div class="row g-3">
            @for (matchweek of filteredMatchweeks(); track matchweek.id) {
              <div class="col-12 col-md-6">
                <div class="card h-100" 
                     [class.border-primary]="matchweek.isActive" 
                     [class.border-success]="matchweek.isCompleted">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h5 class="card-title mb-0">Week {{ matchweek.weekNumber }}</h5>
                      <div class="d-flex flex-column gap-1">
                        @if (matchweek.isCompleted) {
                          <span class="badge bg-success">Completed</span>
                        } @else if (matchweek.isActive) {
                          <span class="badge bg-primary">Active</span>
                        } @else {
                          <span class="badge bg-secondary">Upcoming</span>
                        }
                      </div>
                    </div>

                    <div class="mb-3">
                      <small class="text-muted">Deadline:</small>
                      <div class="fw-semibold">{{ formatDate(matchweek.deadlineDate) }}</div>
                      <div class="text-muted">{{ formatTime(matchweek.deadlineDate) }}</div>
                    </div>

                    <div class="mb-3">
                      @if (isDeadlinePassed(matchweek)) {
                        <div class="text-danger">
                          <i class="fas fa-times-circle"></i>
                          Deadline passed
                        </div>
                      } @else {
                        <div class="text-success">
                          <i class="fas fa-clock"></i>
                          {{ getTimeUntilDeadlineText(matchweek) }}
                        </div>
                      }
                    </div>

                    <button 
                      type="button" 
                      class="btn btn-outline-primary btn-sm w-100"
                      [routerLink]="['/matchweeks', matchweek.id]">
                      <i class="fas fa-eye"></i>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Summary Stats -->
      @if (filteredMatchweeks().length > 0) {
        <div class="card mt-4">
          <div class="card-body">
            <h6 class="card-title">Summary</h6>
            <div class="row text-center">
              <div class="col-6 col-md-3">
                <div class="stat-item">
                  <div class="stat-number text-primary">{{ totalMatchweeks() }}</div>
                  <div class="stat-label text-muted">Total</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="stat-item">
                  <div class="stat-number text-success">{{ completedMatchweeks() }}</div>
                  <div class="stat-label text-muted">Completed</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="stat-item">
                  <div class="stat-number text-warning">{{ activeMatchweeks() }}</div>
                  <div class="stat-label text-muted">Active</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="stat-item">
                  <div class="stat-number text-info">{{ upcomingMatchweeks() }}</div>
                  <div class="stat-label text-muted">Upcoming</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .matchweek-list {
      padding: 1rem;
    }

    .header h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .table th {
      background-color: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
    }

    .table-warning {
      --bs-table-bg: #fff3cd;
    }

    .table-success {
      --bs-table-bg: #d1e7dd;
    }

    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      transition: box-shadow 0.15s ease-in-out;
    }

    .card:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .spinner-border-lg {
      width: 3rem;
      height: 3rem;
    }

    .fa-4x {
      font-size: 4em;
    }

    .stat-item {
      padding: 1rem 0;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge {
      font-size: 0.75em;
    }

    @media (max-width: 768px) {
      .matchweek-list {
        padding: 0.5rem;
      }

      .header h2 {
        font-size: 1.5rem;
      }

      .stat-number {
        font-size: 1.5rem;
      }
    }
  `]
})
export class MatchweekListComponent implements OnInit {
  private router = inject(Router);
  protected matchweekService = inject(MatchweekService);

  // Filter and sort signals
  statusFilter = signal<FilterStatus>('all');
  sortBy = signal<SortOption>('weekNumber');
  sortDirection = signal<SortDirection>('asc');

  // Computed values
  matchweeks = computed(() => this.matchweekService.matchweeks());
  currentMatchweek = computed(() => this.matchweekService.currentMatchweek());

  filteredMatchweeks = computed(() => {
    let filtered = this.matchweeks();

    // Apply status filter
    const status = this.statusFilter();
    if (status !== 'all') {
      filtered = filtered.filter(matchweek => {
        switch (status) {
          case 'active':
            return matchweek.isActive;
          case 'completed':
            return matchweek.isCompleted;
          case 'upcoming':
            return !matchweek.isActive && !matchweek.isCompleted;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sortBy = this.sortBy();
    const direction = this.sortDirection();
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'weekNumber') {
        comparison = a.weekNumber - b.weekNumber;
      } else if (sortBy === 'deadlineDate') {
        comparison = new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  });

  // Statistics computed values
  totalMatchweeks = computed(() => this.matchweeks().length);
  completedMatchweeks = computed(() => this.matchweeks().filter(mw => mw.isCompleted).length);
  activeMatchweeks = computed(() => this.matchweeks().filter(mw => mw.isActive).length);
  upcomingMatchweeks = computed(() => 
    this.matchweeks().filter(mw => !mw.isActive && !mw.isCompleted).length
  );

  ngOnInit(): void {
    this.loadMatchweeks();
  }

  private loadMatchweeks(): void {
    this.matchweekService.getAllMatchweeks().subscribe({
      error: (error) => {
        console.error('Error loading matchweeks:', error);
      }
    });

    // Also load current matchweek
    this.matchweekService.getCurrentMatchweek().subscribe({
      error: (error) => {
        console.error('Error loading current matchweek:', error);
      }
    });
  }

  refreshMatchweeks(): void {
    this.loadMatchweeks();
  }

  onFilterChange(): void {
    // Filtering is handled by computed signal
  }

  onSortChange(): void {
    // Sorting is handled by computed signal
  }

  goToCurrentMatchweek(): void {
    const current = this.currentMatchweek();
    if (current) {
      this.router.navigate(['/matchweeks', 'current']);
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isDeadlinePassed(matchweek: Matchweek): boolean {
    return this.matchweekService.isDeadlinePassed(matchweek);
  }

  getTimeUntilDeadlineText(matchweek: Matchweek): string {
    const timeLeft = this.matchweekService.getTimeUntilDeadline(matchweek);
    
    if (timeLeft <= 0) {
      return 'Deadline passed';
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 7) {
      return `${days} days left`;
    } else if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  }
}