import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchweekService } from '../../../core/services/matchweek.service';
import { Matchweek, CreateMatchweekDto, UpdateMatchweekDto } from '../../../core/models';

@Component({
  selector: 'app-admin-matchweeks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="admin-matchweeks-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Matchweek Management</h1>
          <p class="subtitle">Create, edit, and manage fantasy football matchweeks</p>
        </div>
        <div class="header-actions">
          <button 
            type="button" 
            class="btn-primary" 
            (click)="showCreateForm()">
            <span class="add-icon">+</span>
            Add New Matchweek
          </button>
        </div>
      </div>

      <!-- Create/Edit Form -->
      @if (showForm()) {
        <div class="form-card">
          <div class="form-header">
            <div class="form-title">
              <div class="form-icon">{{ isEditing() ? '✏️' : '➕' }}</div>
              <h3>{{ isEditing() ? 'Edit' : 'Create' }} Matchweek</h3>
            </div>
            <button 
              type="button" 
              class="form-close-btn"
              (click)="cancelForm()">
              ✕
            </button>
          </div>
          <div class="form-content">
            <form [formGroup]="matchweekForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Week Number</label>
                  <div class="input-wrapper">
                    <input 
                      type="number" 
                      class="form-input" 
                      placeholder="Enter week number (1-38)"
                      formControlName="weekNumber"
                      [class.error]="matchweekForm.get('weekNumber')?.invalid && matchweekForm.get('weekNumber')?.touched">
                    @if (matchweekForm.get('weekNumber')?.invalid && matchweekForm.get('weekNumber')?.touched) {
                      <div class="error-message">
                        <span class="error-icon">⚠️</span>
                        Week number is required and must be positive
                      </div>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Deadline Date & Time</label>
                  <div class="input-wrapper">
                    <input 
                      type="datetime-local" 
                      class="form-input" 
                      formControlName="deadlineDate"
                      [class.error]="matchweekForm.get('deadlineDate')?.invalid && matchweekForm.get('deadlineDate')?.touched">
                    @if (matchweekForm.get('deadlineDate')?.invalid && matchweekForm.get('deadlineDate')?.touched) {
                      <div class="error-message">
                        <span class="error-icon">⚠️</span>
                        Deadline date is required
                      </div>
                    }
                  </div>
                </div>

                @if (isEditing()) {
                  <div class="form-group">
                    <label class="form-label">Status Options</label>
                    <div class="checkbox-group">
                      <label class="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          class="checkbox-input"
                          formControlName="isActive">
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-label">Active Matchweek</span>
                      </label>

                      <label class="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          class="checkbox-input"
                          formControlName="isCompleted">
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-label">Completed Matchweek</span>
                      </label>
                    </div>
                  </div>
                }
              </div>

              @if (errorMessage()) {
                <div class="error-alert">
                  <div class="alert-icon">❌</div>
                  <div class="alert-content">
                    <strong>Error:</strong>
                    <p>{{ errorMessage() }}</p>
                  </div>
                </div>
              }

              <div class="form-actions">
                <button 
                  type="button" 
                  class="btn-secondary" 
                  (click)="cancelForm()"
                  [disabled]="matchweekService.isLoading()">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn-primary"
                  [disabled]="matchweekForm.invalid || matchweekService.isLoading()">
                  @if (matchweekService.isLoading()) {
                    <span class="loading-spinner"></span>
                  }
                  {{ isEditing() ? 'Update' : 'Create' }} Matchweek
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Filter Controls -->
      <div class="filter-section">
        <div class="filter-controls">
          <div class="filter-group">
            <label class="filter-label">Filter by Status</label>
            <div class="custom-select">
              <select 
                [(ngModel)]="statusFilter" 
                (ngModelChange)="onFilterChange()">
                <option value="all">All Matchweeks</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed Only</option>
                <option value="upcoming">Upcoming Only</option>
              </select>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Search</label>
            <div class="search-wrapper">
              <input 
                type="text" 
                class="search-input" 
                placeholder="Search by week number..."
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()">
              <span class="search-icon">🔍</span>
            </div>
          </div>

          <div class="filter-actions">
            <button 
              type="button" 
              class="refresh-btn"
              (click)="refreshMatchweeks()"
              [disabled]="matchweekService.isLoading()">
              @if (matchweekService.isLoading()) {
                <span class="spinner-small"></span>
              }
              Refresh
            </button>
            <button 
              type="button" 
              class="export-btn"
              (click)="exportMatchweeks()">
              Export
            </button>
            <button 
              type="button" 
              class="deactivate-btn"
              (click)="deactivateAll()"
              [disabled]="!hasActiveMatchweeks() || matchweekService.isLoading()">
              Deactivate All
            </button>
          </div>
        </div>
      </div>

      <!-- Matchweeks List -->
      <div class="data-section">
        <div class="section-header">
          <div class="section-title">
            <h3>All Matchweeks</h3>
            <div class="count-badge">{{ filteredMatchweeks().length }} of {{ matchweeks().length }}</div>
          </div>
        </div>

        <!-- Loading State -->
        @if (matchweekService.isLoading() && filteredMatchweeks().length === 0) {
          <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading matchweeks...</p>
          </div>
        } @else if (filteredMatchweeks().length === 0) {
          <!-- Empty State -->
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h4>No Matchweeks Found</h4>
            <p>No matchweeks found. Create your first matchweek to get started.</p>
            <button 
              type="button" 
              class="btn-primary"
              (click)="showCreateForm()">
              Create First Matchweek
            </button>
          </div>
        } @else {
          <!-- Matchweeks Grid -->
          <div class="matchweeks-grid">
            @for (matchweek of filteredMatchweeks(); track matchweek.id) {
              <div class="matchweek-card" 
                   [class.active]="matchweek.isActive" 
                   [class.completed]="matchweek.isCompleted">
                <div class="card-header">
                  <div class="week-info">
                    <div class="week-number">{{ matchweek.weekNumber }}</div>
                    <div class="week-label">Week</div>
                  </div>
                  <div class="status-badges">
                    @if (matchweek.isActive) {
                      <span class="status-badge active">Active</span>
                    } @else {
                      <span class="status-badge inactive">Inactive</span>
                    }
                    @if (matchweek.isCompleted) {
                      <span class="status-badge completed">Completed</span>
                    }
                  </div>
                </div>

                <div class="card-content">
                  <div class="deadline-info">
                    <div class="info-label">Deadline</div>
                    <div class="deadline-date">{{ formatDate(matchweek.deadlineDate) }}</div>
                    <div class="deadline-status">
                      @if (isDeadlinePassed(matchweek)) {
                        <span class="status-text expired">
                          <span class="status-icon">⏰</span>
                          Deadline passed
                        </span>
                      } @else {
                        <span class="status-text active">
                          <span class="status-icon">⏰</span>
                          {{ getTimeUntilDeadlineText(matchweek) }}
                        </span>
                      }
                    </div>
                  </div>

                  <div class="created-info">
                    <div class="info-label">Created</div>
                    <div class="created-date">{{ formatDate(matchweek.createdAt) }}</div>
                  </div>
                </div>

                <div class="card-actions">
                  <button 
                    type="button" 
                    class="action-btn edit"
                    (click)="editMatchweek(matchweek)"
                    [disabled]="matchweekService.isLoading()">
                    <span class="btn-icon">✏️</span>
                    Edit
                  </button>
                  <button 
                    type="button" 
                    class="action-btn delete"
                    (click)="confirmDelete(matchweek)"
                    [disabled]="matchweekService.isLoading()">
                    <span class="btn-icon">🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Confirm Delete</h3>
              <button type="button" class="close-btn" (click)="cancelDelete()">✕</button>
            </div>
            
            <div class="modal-content">
              <div class="warning-icon">⚠️</div>
              <p>Are you sure you want to delete <strong>Week {{ matchweekToDelete()?.weekNumber }}</strong>?</p>
              <p class="warning-text">This action cannot be undone and may affect user teams if the matchweek is active.</p>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="cancelDelete()" [disabled]="matchweekService.isLoading()">
                Cancel
              </button>
              <button 
                type="button" 
                class="btn-danger" 
                (click)="deleteMatchweek()" 
                [disabled]="matchweekService.isLoading()">
                @if (matchweekService.isLoading()) {
                  <span class="spinner-small"></span>
                }
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./admin-matchweeks.component.css']
})
export class AdminMatchweeksComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected matchweekService = inject(MatchweekService);

  // Signals
  showForm = signal(false);
  isEditing = signal(false);
  errorMessage = signal<string | null>(null);
  showDeleteModal = signal(false);
  matchweekToDelete = signal<Matchweek | null>(null);
  editingMatchweek = signal<Matchweek | null>(null);
  statusFilter = signal<'all' | 'active' | 'completed' | 'upcoming'>('all');
  searchTerm = signal<string>('');

  // Computed
  matchweeks = computed(() => this.matchweekService.matchweeks());
  
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
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(matchweek => 
        matchweek.weekNumber.toString().includes(search)
      );
    }
    
    // Sort by week number
    return filtered.sort((a, b) => a.weekNumber - b.weekNumber);
  });

  // Form
  matchweekForm = this.fb.nonNullable.group({
    weekNumber: [1, [Validators.required, Validators.min(1)]],
    deadlineDate: ['', [Validators.required]],
    isActive: [false],
    isCompleted: [false]
  });

  ngOnInit(): void {
    this.loadMatchweeks();
  }

  private loadMatchweeks(): void {
    this.matchweekService.getAllMatchweeks().subscribe({
      error: (error) => {
        console.error('Error loading matchweeks:', error);
        this.errorMessage.set('Failed to load matchweeks. Please try again.');
      }
    });
  }

  showCreateForm(): void {
    this.resetForm();
    this.showForm.set(true);
    this.isEditing.set(false);
    this.editingMatchweek.set(null);
    this.errorMessage.set(null);
  }

  editMatchweek(matchweek: Matchweek): void {
    this.isEditing.set(true);
    this.editingMatchweek.set(matchweek);
    this.showForm.set(true);
    this.errorMessage.set(null);

    // Convert ISO date to datetime-local format
    const deadlineDate = new Date(matchweek.deadlineDate);
    const formattedDate = deadlineDate.toISOString().slice(0, 16);

    this.matchweekForm.patchValue({
      weekNumber: matchweek.weekNumber,
      deadlineDate: formattedDate,
      isActive: matchweek.isActive,
      isCompleted: matchweek.isCompleted
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.editingMatchweek.set(null);
    this.resetForm();
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.matchweekForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.matchweekForm.value;
    
    if (this.isEditing()) {
      this.updateMatchweek(formValue);
    } else {
      this.createMatchweek(formValue);
    }
  }

  private createMatchweek(formValue: any): void {
    const createDto: CreateMatchweekDto = {
      weekNumber: formValue.weekNumber!,
      deadlineDate: new Date(formValue.deadlineDate!).toISOString()
    };

    this.matchweekService.createMatchweek(createDto).subscribe({
      next: () => {
        this.cancelForm();
      },
      error: (error) => {
        console.error('Error creating matchweek:', error);
        this.handleApiError(error);
      }
    });
  }

  private updateMatchweek(formValue: any): void {
    const matchweek = this.editingMatchweek();
    if (!matchweek) return;

    const updateDto: UpdateMatchweekDto = {
      weekNumber: formValue.weekNumber!,
      deadlineDate: new Date(formValue.deadlineDate!).toISOString(),
      isActive: formValue.isActive!,
      isCompleted: formValue.isCompleted!
    };

    this.matchweekService.updateMatchweek(matchweek.id, updateDto).subscribe({
      next: () => {
        this.cancelForm();
      },
      error: (error) => {
        console.error('Error updating matchweek:', error);
        this.handleApiError(error);
      }
    });
  }

  confirmDelete(matchweek: Matchweek): void {
    this.matchweekToDelete.set(matchweek);
    this.showDeleteModal.set(true);
  }

  deleteMatchweek(): void {
    const matchweek = this.matchweekToDelete();
    if (!matchweek) return;

    this.matchweekService.deleteMatchweek(matchweek.id).subscribe({
      next: () => {
        this.cancelDelete();
      },
      error: (error) => {
        console.error('Error deleting matchweek:', error);
        this.cancelDelete();
        this.errorMessage.set('Failed to delete matchweek. Please try again.');
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.matchweekToDelete.set(null);
  }

  private resetForm(): void {
    this.matchweekForm.reset({
      weekNumber: 1,
      deadlineDate: '',
      isActive: false,
      isCompleted: false
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.matchweekForm.controls).forEach(key => {
      const control = this.matchweekForm.get(key);
      control?.markAsTouched();
    });
  }

  private handleApiError(error: any): void {
    if (error.status === 400 && error.error?.message) {
      this.errorMessage.set(error.error.message);
    } else if (error.status === 409) {
      this.errorMessage.set('A matchweek with this week number already exists.');
    } else {
      this.errorMessage.set('An error occurred. Please try again.');
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  }

  // Filter and search methods
  onFilterChange(): void {
    // Filtering is handled by computed signal
  }

  onSearchChange(): void {
    // Search is handled by computed signal
  }

  refreshMatchweeks(): void {
    this.loadMatchweeks();
  }

  exportMatchweeks(): void {
    const matchweeks = this.filteredMatchweeks();
    const csvContent = this.generateCSV(matchweeks);
    this.downloadCSV(csvContent, 'matchweeks.csv');
  }

  deactivateAll(): void {
    const activeMatchweeks = this.matchweeks().filter(mw => mw.isActive);
    
    if (activeMatchweeks.length === 0) {
      return;
    }

    if (confirm(`Deactivate all ${activeMatchweeks.length} active matchweeks?`)) {
      activeMatchweeks.forEach(matchweek => {
        const updateDto: UpdateMatchweekDto = {
          weekNumber: matchweek.weekNumber,
          deadlineDate: matchweek.deadlineDate,
          isActive: false,
          isCompleted: matchweek.isCompleted
        };

        this.matchweekService.updateMatchweek(matchweek.id, updateDto).subscribe({
          error: (error) => {
            console.error(`Error deactivating matchweek ${matchweek.weekNumber}:`, error);
          }
        });
      });
    }
  }

  hasActiveMatchweeks(): boolean {
    return this.matchweeks().some(mw => mw.isActive);
  }

  private generateCSV(matchweeks: Matchweek[]): string {
    const headers = ['Week Number', 'Deadline Date', 'Is Active', 'Is Completed', 'Created At', 'Updated At'];
    const rows = matchweeks.map(mw => [
      mw.weekNumber.toString(),
      mw.deadlineDate,
      mw.isActive.toString(),
      mw.isCompleted.toString(),
      mw.createdAt,
      mw.updatedAt || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}