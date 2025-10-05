import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatchweekService } from '../../../core/services/matchweek.service';
import { Matchweek } from '../../../core/models';

@Component({
  selector: 'app-current-matchweek',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="current-matchweek">
      <!-- Header -->
      <div class="header">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a [routerLink]="['/matchweeks']">Matchweeks</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Current Matchweek</li>
          </ol>
        </nav>
      </div>

      @if (matchweekService.isLoading() && !currentMatchweek()) {
        <!-- Loading State -->
        <div class="text-center p-5">
          <div class="spinner-border spinner-border-lg text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading current matchweek...</p>
        </div>
      } @else if (!currentMatchweek()) {
        <!-- No Current Matchweek -->
        <div class="alert alert-warning text-center">
          <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <h4>No Active Matchweek</h4>
          <p class="mb-0">There is currently no active matchweek. Please check back later.</p>
          <button 
            type="button" 
            class="btn btn-primary mt-3"
            [routerLink]="['/matchweeks']">
            View All Matchweeks
          </button>
        </div>
      } @else {
        <!-- Current Matchweek Dashboard -->
        <div class="row g-4">
          <!-- Main Matchweek Card -->
          <div class="col-12">
            <div class="card border-primary shadow-sm">
              <div class="card-header bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                  <h3 class="card-title mb-0">
                    <i class="fas fa-calendar-check"></i>
                    Matchweek {{ currentMatchweek()!.weekNumber }}
                  </h3>
                  <span class="badge bg-light text-primary fs-6">Current</span>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-4">
                  <!-- Deadline Info -->
                  <div class="col-md-6">
                    <div class="deadline-section">
                      <h5 class="text-muted mb-3">
                        <i class="fas fa-clock"></i>
                        Deadline Information
                      </h5>
                      <div class="deadline-info">
                        <div class="deadline-date">
                          <span class="fw-bold fs-4">{{ formatDate(currentMatchweek()!.deadlineDate) }}</span>
                        </div>
                        <div class="deadline-time text-muted">
                          {{ formatTime(currentMatchweek()!.deadlineDate) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Countdown Timer -->
                  <div class="col-md-6">
                    <div class="countdown-section">
                      <h5 class="text-muted mb-3">
                        <i class="fas fa-hourglass-half"></i>
                        Time Remaining
                      </h5>
                      @if (isDeadlinePassed()) {
                        <div class="alert alert-danger mb-0">
                          <i class="fas fa-times-circle"></i>
                          <strong>Deadline has passed</strong>
                          <div class="small">No more changes can be made to your team</div>
                        </div>
                      } @else {
                        <div class="countdown-display">
                          <div class="countdown-timer">
                            @if (timeRemaining().days > 0) {
                              <div class="time-unit">
                                <span class="time-value">{{ timeRemaining().days }}</span>
                                <span class="time-label">Days</span>
                              </div>
                            }
                            <div class="time-unit">
                              <span class="time-value">{{ timeRemaining().hours }}</span>
                              <span class="time-label">Hours</span>
                            </div>
                            <div class="time-unit">
                              <span class="time-value">{{ timeRemaining().minutes }}</span>
                              <span class="time-label">Minutes</span>
                            </div>
                          </div>
                          @if (timeRemaining().total < (24 * 60 * 60 * 1000)) {
                            <div class="alert alert-warning mt-2 mb-0">
                              <i class="fas fa-exclamation-triangle"></i>
                              <strong>Deadline approaching!</strong> Less than 24 hours remaining.
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-bolt"></i>
                  Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-6 col-md-3">
                    <button 
                      type="button" 
                      class="btn btn-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      [routerLink]="['/team/my-team']"
                      [disabled]="isDeadlinePassed()">
                      <i class="fas fa-users fa-2x mb-2"></i>
                      <span>Manage Team</span>
                    </button>
                  </div>
                  
                  <div class="col-6 col-md-3">
                    <button 
                      type="button" 
                      class="btn btn-success w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      [routerLink]="['/players']">
                      <i class="fas fa-search fa-2x mb-2"></i>
                      <span>Browse Players</span>
                    </button>
                  </div>
                  
                  <div class="col-6 col-md-3">
                    <button 
                      type="button" 
                      class="btn btn-info w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      [routerLink]="['/matchweeks', currentMatchweek()!.id]">
                      <i class="fas fa-chart-line fa-2x mb-2"></i>
                      <span>View Details</span>
                    </button>
                  </div>
                  
                  <div class="col-6 col-md-3">
                    <button 
                      type="button" 
                      class="btn btn-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      [routerLink]="['/matchweeks']">
                      <i class="fas fa-list fa-2x mb-2"></i>
                      <span>All Matchweeks</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Information -->
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-info-circle"></i>
                  Status Information
                </h5>
              </div>
              <div class="card-body">
                <div class="status-info">
                  <div class="status-item">
                    <div class="status-label">Matchweek Status:</div>
                    <div class="status-value">
                      @if (currentMatchweek()!.isCompleted) {
                        <span class="badge bg-success">Completed</span>
                      } @else {
                        <span class="badge bg-primary">Active</span>
                      }
                    </div>
                  </div>
                  
                  <div class="status-item">
                    <div class="status-label">Created On:</div>
                    <div class="status-value">{{ formatDate(currentMatchweek()!.createdAt) }}</div>
                  </div>
                  
                  @if (currentMatchweek()!.updatedAt) {
                    <div class="status-item">
                      <div class="status-label">Last Updated:</div>
                      <div class="status-value">{{ formatDate(currentMatchweek()!.updatedAt!) }}</div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Team Management Placeholder -->
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-users"></i>
                  Your Team Status
                </h5>
              </div>
              <div class="card-body">
                <div class="text-center p-3">
                  <i class="fas fa-cogs fa-3x text-muted mb-3"></i>
                  <p class="text-muted mb-3">Team management integration coming soon</p>
                  <p class="small text-muted">
                    This section will show your current team lineup, recent transfers, 
                    and points for this matchweek.
                  </p>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm"
                    [routerLink]="['/team/my-team']">
                    Go to Team Management
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .current-matchweek {
      padding: 1rem;
    }

    .spinner-border-lg {
      width: 3rem;
      height: 3rem;
    }

    .fa-3x {
      font-size: 3em;
    }

    .deadline-info {
      text-align: center;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 0.5rem;
    }

    .deadline-date {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .countdown-display {
      text-align: center;
    }

    .countdown-timer {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .time-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 0.5rem;
      min-width: 60px;
    }

    .time-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #007bff;
      line-height: 1;
    }

    .time-label {
      font-size: 0.75rem;
      color: #6c757d;
      text-transform: uppercase;
      margin-top: 0.25rem;
    }

    .status-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      justify-content: between;
      align-items: center;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 0.375rem;
    }

    .status-label {
      font-weight: 600;
      color: #495057;
      flex: 1;
    }

    .status-value {
      font-weight: 500;
    }

    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      transition: box-shadow 0.15s ease-in-out;
    }

    .card:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .btn {
      transition: all 0.2s ease-in-out;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn:disabled {
      transform: none;
    }

    @media (max-width: 768px) {
      .current-matchweek {
        padding: 0.5rem;
      }

      .countdown-timer {
        gap: 0.5rem;
      }

      .time-unit {
        min-width: 50px;
        padding: 0.5rem;
      }

      .time-value {
        font-size: 1.25rem;
      }

      .status-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .status-label {
        flex: none;
      }
    }
  `]
})
export class CurrentMatchweekComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  protected matchweekService = inject(MatchweekService);
  
  private countdownInterval?: number;
  private refreshSignal = signal(0);

  // Computed values
  currentMatchweek = computed(() => this.matchweekService.currentMatchweek());

  timeRemaining = computed(() => {
    // Force recomputation by reading refreshSignal
    this.refreshSignal();
    
    const matchweek = this.currentMatchweek();
    if (!matchweek) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const now = new Date().getTime();
    const deadline = new Date(matchweek.deadlineDate).getTime();
    const total = deadline - now;

    if (total <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    return { total, days, hours, minutes, seconds };
  });

  ngOnInit(): void {
    this.loadCurrentMatchweek();
    this.startCountdownTimer();
  }

  ngOnDestroy(): void {
    this.stopCountdownTimer();
  }

  private loadCurrentMatchweek(): void {
    this.matchweekService.getCurrentMatchweek().subscribe({
      error: (error) => {
        console.error('Error loading current matchweek:', error);
      }
    });
  }

  private startCountdownTimer(): void {
    // Update countdown every minute
    this.countdownInterval = window.setInterval(() => {
      this.refreshSignal.update(v => v + 1);
    }, 60000);
  }

  private stopCountdownTimer(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  isDeadlinePassed(): boolean {
    const matchweek = this.currentMatchweek();
    return matchweek ? this.matchweekService.isDeadlinePassed(matchweek) : false;
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