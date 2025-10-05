import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatchweekService } from '../../../core/services/matchweek.service';
import { Matchweek } from '../../../core/models';

@Component({
  selector: 'app-matchweek-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="matchweek-detail">
      <!-- Header -->
      <div class="header">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a [routerLink]="['/matchweeks']">Matchweeks</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              @if (selectedMatchweek()) {
                Week {{ selectedMatchweek()!.weekNumber }}
              } @else {
                Matchweek Details
              }
            </li>
          </ol>
        </nav>
      </div>

      @if (matchweekService.isLoading() && !selectedMatchweek()) {
        <!-- Loading State -->
        <div class="text-center p-5">
          <div class="spinner-border spinner-border-lg text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading matchweek details...</p>
        </div>
      } @else if (!selectedMatchweek()) {
        <!-- Matchweek Not Found -->
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <h4>Matchweek Not Found</h4>
          <p>The requested matchweek could not be found.</p>
          <button 
            type="button" 
            class="btn btn-primary"
            [routerLink]="['/matchweeks']">
            Back to All Matchweeks
          </button>
        </div>
      } @else {
        <!-- Matchweek Details -->
        <div class="row g-4">
          <!-- Main Info Card -->
          <div class="col-12">
            <div class="card" 
                 [class.border-primary]="selectedMatchweek()!.isActive"
                 [class.border-success]="selectedMatchweek()!.isCompleted">
              <div class="card-header" 
                   [class.bg-primary]="selectedMatchweek()!.isActive"
                   [class.text-white]="selectedMatchweek()!.isActive"
                   [class.bg-success]="selectedMatchweek()!.isCompleted && !selectedMatchweek()!.isActive"
                   [class.text-white]="selectedMatchweek()!.isCompleted && !selectedMatchweek()!.isActive">
                <div class="d-flex justify-content-between align-items-center">
                  <h2 class="card-title mb-0">
                    <i class="fas fa-calendar-alt"></i>
                    Matchweek {{ selectedMatchweek()!.weekNumber }}
                  </h2>
                  <div class="d-flex gap-2">
                    @if (selectedMatchweek()!.isActive) {
                      <span class="badge bg-light text-primary fs-6">Active</span>
                    }
                    @if (selectedMatchweek()!.isCompleted) {
                      <span class="badge bg-light text-success fs-6">Completed</span>
                    }
                    @if (!selectedMatchweek()!.isActive && !selectedMatchweek()!.isCompleted) {
                      <span class="badge bg-secondary fs-6">Upcoming</span>
                    }
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-4">
                  <div class="col-md-8">
                    <div class="matchweek-info">
                      <div class="info-section">
                        <h5 class="section-title">
                          <i class="fas fa-clock text-primary"></i>
                          Deadline Information
                        </h5>
                        <div class="deadline-card">
                          <div class="deadline-main">
                            <div class="deadline-date">
                              {{ formatDate(selectedMatchweek()!.deadlineDate) }}
                            </div>
                            <div class="deadline-time">
                              {{ formatTime(selectedMatchweek()!.deadlineDate) }}
                            </div>
                          </div>
                          <div class="deadline-status">
                            @if (isDeadlinePassed()) {
                              <div class="alert alert-danger mb-0">
                                <i class="fas fa-times-circle"></i>
                                <strong>Deadline has passed</strong>
                              </div>
                            } @else {
                              <div class="alert alert-success mb-0">
                                <i class="fas fa-clock"></i>
                                <strong>{{ getTimeUntilDeadlineText() }}</strong>
                              </div>
                            }
                          </div>
                        </div>
                      </div>

                      <div class="info-section">
                        <h5 class="section-title">
                          <i class="fas fa-info-circle text-info"></i>
                          Status Details
                        </h5>
                        <div class="status-grid">
                          <div class="status-card">
                            <div class="status-icon">
                              <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="status-content">
                              <div class="status-label">Status</div>
                              <div class="status-value">
                                @if (selectedMatchweek()!.isCompleted) {
                                  <span class="text-success">Completed</span>
                                } @else if (selectedMatchweek()!.isActive) {
                                  <span class="text-primary">Active</span>
                                } @else {
                                  <span class="text-secondary">Upcoming</span>
                                }
                              </div>
                            </div>
                          </div>

                          <div class="status-card">
                            <div class="status-icon">
                              <i class="fas fa-plus-circle"></i>
                            </div>
                            <div class="status-content">
                              <div class="status-label">Created</div>
                              <div class="status-value">{{ formatDate(selectedMatchweek()!.createdAt) }}</div>
                            </div>
                          </div>

                          @if (selectedMatchweek()!.updatedAt) {
                            <div class="status-card">
                              <div class="status-icon">
                                <i class="fas fa-edit"></i>
                              </div>
                              <div class="status-content">
                                <div class="status-label">Updated</div>
                                <div class="status-value">{{ formatDate(selectedMatchweek()!.updatedAt!) }}</div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="actions-sidebar">
                      <h5 class="section-title">
                        <i class="fas fa-bolt text-warning"></i>
                        Quick Actions
                      </h5>
                      
                      <div class="d-grid gap-2">
                        @if (selectedMatchweek()!.isActive) {
                          <button 
                            type="button" 
                            class="btn btn-primary"
                            [routerLink]="['/team/my-team']"
                            [disabled]="isDeadlinePassed()">
                            <i class="fas fa-users"></i>
                            Manage Your Team
                          </button>
                        }

                        <button 
                          type="button" 
                          class="btn btn-success"
                          [routerLink]="['/players']">
                          <i class="fas fa-search"></i>
                          Browse Players
                        </button>

                        @if (selectedMatchweek()!.isActive) {
                          <button 
                            type="button" 
                            class="btn btn-info"
                            [routerLink]="['/matchweeks/current']">
                            <i class="fas fa-tachometer-alt"></i>
                            Current Dashboard
                          </button>
                        }

                        <button 
                          type="button" 
                          class="btn btn-outline-secondary"
                          [routerLink]="['/matchweeks']">
                          <i class="fas fa-list"></i>
                          All Matchweeks
                        </button>
                      </div>

                      <!-- Navigation -->
                      <div class="navigation-section mt-4">
                        <h6 class="text-muted mb-3">Navigate</h6>
                        <div class="d-flex justify-content-between">
                          <button 
                            type="button" 
                            class="btn btn-outline-primary btn-sm"
                            [disabled]="!hasPreviousMatchweek()"
                            (click)="goToPreviousMatchweek()">
                            <i class="fas fa-chevron-left"></i>
                            Previous
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-outline-primary btn-sm"
                            [disabled]="!hasNextMatchweek()"
                            (click)="goToNextMatchweek()">
                            Next
                            <i class="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Performance Placeholder -->
          <div class="col-12 col-lg-6">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-line"></i>
                  Your Team Performance
                </h5>
              </div>
              <div class="card-body">
                <div class="text-center p-4">
                  <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                  <h6>Performance tracking coming soon</h6>
                  <p class="text-muted mb-3">
                    This section will show your team's performance for this matchweek, 
                    including points scored, player stats, and rank changes.
                  </p>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm"
                    [routerLink]="['/team/my-team']">
                    View Your Team
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Fixtures Placeholder -->
          <div class="col-12 col-lg-6">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-futbol"></i>
                  Fixtures & Results
                </h5>
              </div>
              <div class="card-body">
                <div class="text-center p-4">
                  <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                  <h6>Fixtures integration coming soon</h6>
                  <p class="text-muted mb-3">
                    This section will display all fixtures for this matchweek, 
                    including match results, scores, and key statistics.
                  </p>
                  <small class="text-muted">
                    Integration with fixtures API pending
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Placeholder -->
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-trophy"></i>
                  Matchweek Statistics
                </h5>
              </div>
              <div class="card-body">
                <div class="text-center p-4">
                  <i class="fas fa-poll fa-3x text-muted mb-3"></i>
                  <h6>Statistics dashboard coming soon</h6>
                  <p class="text-muted mb-0">
                    This section will include detailed statistics for the matchweek, 
                    such as top scorers, most transferred players, average points, and league standings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .matchweek-detail {
      padding: 1rem;
    }

    .spinner-border-lg {
      width: 3rem;
      height: 3rem;
    }

    .fa-3x {
      font-size: 3em;
    }

    .section-title {
      margin-bottom: 1.5rem;
      color: #495057;
      font-weight: 600;
    }

    .section-title i {
      margin-right: 0.5rem;
    }

    .info-section {
      margin-bottom: 2rem;
    }

    .deadline-card {
      background-color: #f8f9fa;
      border-radius: 0.5rem;
      padding: 1.5rem;
      text-align: center;
    }

    .deadline-main {
      margin-bottom: 1rem;
    }

    .deadline-date {
      font-size: 1.25rem;
      font-weight: 700;
      color: #212529;
      margin-bottom: 0.5rem;
    }

    .deadline-time {
      font-size: 1rem;
      color: #6c757d;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .status-card {
      display: flex;
      align-items: center;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 0.5rem;
      transition: transform 0.2s ease-in-out;
    }

    .status-card:hover {
      transform: translateY(-2px);
    }

    .status-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
      color: #6c757d;
    }

    .status-content {
      flex: 1;
    }

    .status-label {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-value {
      font-weight: 600;
      color: #212529;
    }

    .actions-sidebar {
      background-color: #f8f9fa;
      border-radius: 0.5rem;
      padding: 1.5rem;
      height: 100%;
    }

    .navigation-section {
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      transition: box-shadow 0.15s ease-in-out, transform 0.15s ease-in-out;
    }

    .card:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .btn {
      transition: all 0.2s ease-in-out;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .badge {
      font-size: 0.75em;
    }

    @media (max-width: 768px) {
      .matchweek-detail {
        padding: 0.5rem;
      }

      .deadline-card {
        padding: 1rem;
      }

      .deadline-date {
        font-size: 1.1rem;
      }

      .status-grid {
        grid-template-columns: 1fr;
      }

      .actions-sidebar {
        padding: 1rem;
      }

      .card:hover {
        transform: none;
      }

      .btn:hover:not(:disabled) {
        transform: none;
      }
    }
  `]
})
export class MatchweekDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected matchweekService = inject(MatchweekService);

  // Computed values
  selectedMatchweek = computed(() => this.matchweekService.selectedMatchweek());
  allMatchweeks = computed(() => this.matchweekService.matchweeks());

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadMatchweek(id);
      }
    });
  }

  private loadMatchweek(id: number): void {
    this.matchweekService.getMatchweekById(id).subscribe({
      error: (error) => {
        console.error('Error loading matchweek:', error);
      }
    });

    // Also load all matchweeks for navigation
    if (this.allMatchweeks().length === 0) {
      this.matchweekService.getAllMatchweeks().subscribe({
        error: (error) => {
          console.error('Error loading all matchweeks:', error);
        }
      });
    }
  }

  isDeadlinePassed(): boolean {
    const matchweek = this.selectedMatchweek();
    return matchweek ? this.matchweekService.isDeadlinePassed(matchweek) : false;
  }

  getTimeUntilDeadlineText(): string {
    const matchweek = this.selectedMatchweek();
    if (!matchweek) return '';

    const timeLeft = this.matchweekService.getTimeUntilDeadline(matchweek);
    
    if (timeLeft <= 0) {
      return 'Deadline passed';
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 7) {
      return `${days} days remaining`;
    } else if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes} minutes remaining`;
    }
  }

  hasPreviousMatchweek(): boolean {
    const current = this.selectedMatchweek();
    const all = this.allMatchweeks();
    
    if (!current || all.length === 0) return false;
    
    const currentIndex = all.findIndex(mw => mw.id === current.id);
    return currentIndex > 0;
  }

  hasNextMatchweek(): boolean {
    const current = this.selectedMatchweek();
    const all = this.allMatchweeks();
    
    if (!current || all.length === 0) return false;
    
    const currentIndex = all.findIndex(mw => mw.id === current.id);
    return currentIndex < all.length - 1 && currentIndex !== -1;
  }

  goToPreviousMatchweek(): void {
    const current = this.selectedMatchweek();
    const all = this.allMatchweeks();
    
    if (!current || all.length === 0) return;
    
    const currentIndex = all.findIndex(mw => mw.id === current.id);
    if (currentIndex > 0) {
      const previousMatchweek = all[currentIndex - 1];
      this.router.navigate(['/matchweeks', previousMatchweek.id]);
    }
  }

  goToNextMatchweek(): void {
    const current = this.selectedMatchweek();
    const all = this.allMatchweeks();
    
    if (!current || all.length === 0) return;
    
    const currentIndex = all.findIndex(mw => mw.id === current.id);
    if (currentIndex < all.length - 1 && currentIndex !== -1) {
      const nextMatchweek = all[currentIndex + 1];
      this.router.navigate(['/matchweeks', nextMatchweek.id]);
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
}