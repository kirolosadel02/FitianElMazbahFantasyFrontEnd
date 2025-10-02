import { Player } from './player.interface';

// User Team interface (basic info)
export interface UserTeam {
  id: number;
  userId: number;
  username: string;
  teamName: string;
  totalPoints: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt?: string;
  playerCount: number;
}

// User Team Player (for detailed team view)
export interface UserTeamPlayer {
  id: number;
  playerId: number;
  playerName: string;
  position: string;
  teamName: string;
  addedAt: string;
}

// User Team with players (detailed view)
export interface UserTeamWithPlayers extends Omit<UserTeam, 'playerCount'> {
  players: UserTeamPlayer[];
}

// Team composition stats
export interface TeamComposition {
  totalPlayers: number;
  goalkeepers: number;
  defenders: number;
  midfielders: number;
  forwards: number;
  representedTeamIds: number[];
  hasDuplicateTeams: boolean;
  meetsGoalkeeperRequirement: boolean;
  meetsPlayerCountRequirement: boolean;
  meetsUniqueTeamRequirement: boolean;
  isValidForLocking: boolean;
}

// Check team status response
export interface CheckTeamStatusResponse {
  hasTeam: boolean;
  teamId?: number;
  teamName?: string;
}

// Team creation request
export interface CreateUserTeamRequest {
  teamName: string;
}

// Team update request
export interface UpdateUserTeamRequest {
  teamName?: string;
  totalPoints?: number; // Admin only
  isLocked?: boolean; // Admin only
}

// Create user team DTO
export interface CreateUserTeamDto {
  matchweekId: number;
  teamName: string;
  playerIds: number[];
  captainId: number;
  viceCaptainId: number;
}

// Update user team DTO
export interface UpdateUserTeamDto {
  teamName?: string;
  playerIds?: number[];
  captainId?: number;
  viceCaptainId?: number;
  isSubmitted?: boolean;
}

// User team details DTO with populated data
export interface UserTeamDetailsDto extends UserTeam {
  players: Player[];
  captain?: Player;
  viceCaptain?: Player;
}
