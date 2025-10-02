// Matchweek interface
export interface Matchweek {
  id: number;
  weekNumber: number;
  deadlineDate: string;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Matchweek creation request
export interface CreateMatchweekRequest {
  weekNumber: number;
  deadlineDate: string;
  isActive?: boolean;
}

// Update matchweek request
export interface UpdateMatchweekRequest {
  weekNumber?: number;
  deadlineDate?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}
