import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchweekService } from '../../../core/services/matchweek.service';
import { Matchweek, CreateMatchweekDto, UpdateMatchweekDto } from '../../../core/models';

@Component({
  selector: 'app-admin-matchweeks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-matchweeks">
      <div class="header">
        <h2>Matchweek Management</h2>
        <button 
          type="button" 
          class="btn btn-primary" 
          (click)="showCreateForm()">
          <i class="fas fa-plus"></i>
          Add New Matchweek
        </button>
      </div>

      <!-- Create/Edit Form -->
      @if (showForm()) {
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">{{ isEditing() ? 'Edit' : 'Create' }} Matchweek</h5>
          </div>
          <div class="card-body">
            <form [formGroup]="matchweekForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="weekNumber" class="form-label">Week Number</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="weekNumber"
                      formControlName="weekNumber"
                      [class.is-invalid]="matchweekForm.get('weekNumber')?.invalid && matchweekForm.get('weekNumber')?.touched">
                    @if (matchweekForm.get('weekNumber')?.invalid && matchweekForm.get('weekNumber')?.touched) {
                      <div class="invalid-feedback">
                        Week number is required and must be positive
                      </div>
                    }
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="deadlineDate" class="form-label">Deadline Date & Time</label>
                    <input 
                      type="datetime-local" 
                      class="form-control" 
                      id="deadlineDate"
                      formControlName="deadlineDate"
                      [class.is-invalid]="matchweekForm.get('deadlineDate')?.invalid && matchweekForm.get('deadlineDate')?.touched">
                    @if (matchweekForm.get('deadlineDate')?.invalid && matchweekForm.get('deadlineDate')?.touched) {
                      <div class="invalid-feedback">
                        Deadline date is required
                      </div>
                    }
                  </div>
                </div>
              </div>

              @if (isEditing()) {
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="isActive" 
                          formControlName="isActive">
                        <label class="form-check-label" for="isActive">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="isCompleted" 
                          formControlName="isCompleted">
                        <label class="form-check-label" for="isCompleted">
                          Completed
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              }

              @if (errorMessage()) {
                <div class="alert alert-danger" role="alert">
                  {{ errorMessage() }}
                </div>
              }

              <div class="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  (click)="cancelForm()"
                  [disabled]="matchweekService.isLoading()">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="matchweekForm.invalid || matchweekService.isLoading()">
                  @if (matchweekService.isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  {{ isEditing() ? 'Update' : 'Create' }} Matchweek
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Matchweeks List -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">All Matchweeks</h5>
        </div>
        <div class="card-body">
          @if (matchweekService.isLoading() && matchweeks().length === 0) {
            <div class="text-center p-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading matchweeks...</p>
            </div>
          } @else if (matchweeks().length === 0) {
            <div class="text-center p-4">
              <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
              <p class="text-muted">No matchweeks found. Create your first matchweek to get started.</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Week #</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (matchweek of matchweeks(); track matchweek.id) {
                    <tr>
                      <td>
                        <strong>{{ matchweek.weekNumber }}</strong>
                      </td>
                      <td>
                        {{ formatDate(matchweek.deadlineDate) }}
                        @if (isDeadlinePassed(matchweek)) {
                          <small class="text-danger d-block">
                            <i class="fas fa-clock"></i> Deadline passed
                          </small>
                        } @else {
                          <small class="text-success d-block">
                            <i class="fas fa-clock"></i> {{ getTimeUntilDeadlineText(matchweek) }}
                          </small>
                        }
                      </td>
                      <td>
                        <div class="d-flex flex-column gap-1">
                          @if (matchweek.isActive) {
                            <span class="badge bg-success">Active</span>
                          } @else {
                            <span class="badge bg-secondary">Inactive</span>
                          }
                          @if (matchweek.isCompleted) {
                            <span class="badge bg-info">Completed</span>
                          }
                        </div>
                      </td>
                      <td>
                        {{ formatDate(matchweek.createdAt) }}
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            type="button" 
                            class="btn btn-outline-primary"
                            (click)="editMatchweek(matchweek)"
                            [disabled]="matchweekService.isLoading()">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-outline-danger"
                            (click)="confirmDelete(matchweek)"
                            [disabled]="matchweekService.isLoading()">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Confirm Delete</h5>
                <button type="button" class="btn-close" (click)="cancelDelete()"></button>
              </div>
              <div class="modal-body">
                <p>Are you sure you want to delete <strong>Week {{ matchweekToDelete()?.weekNumber }}</strong>?</p>
                <p class="text-danger">
                  <i class="fas fa-exclamation-triangle"></i>
                  This action cannot be undone and may affect user teams if the matchweek is active.
                </p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="cancelDelete()" [disabled]="matchweekService.isLoading()">
                  Cancel
                </button>
                <button type="button" class="btn btn-danger" (click)="deleteMatchweek()" [disabled]="matchweekService.isLoading()">
                  @if (matchweekService.isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Delete Matchweek
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-matchweeks {
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .table th {
      background-color: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
    }

    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }

    .badge {
      font-size: 0.75em;
    }

    .modal.show {
      display: block !important;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    .fa-3x {
      font-size: 3em;
    }

    .form-check {
      padding-left: 1.5em;
    }

    .invalid-feedback {
      display: block;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .btn-group {
        flex-direction: column;
      }

      .table-responsive {
        font-size: 0.875rem;
      }
    }
  `]
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

  // Computed
  matchweeks = computed(() => this.matchweekService.matchweeks());

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
}