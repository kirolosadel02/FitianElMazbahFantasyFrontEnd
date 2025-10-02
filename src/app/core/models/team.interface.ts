import { Player } from './player.interface';

// Team interface
export interface Team {
  id: number;
  name: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// Team with players (detailed view)
export interface TeamWithPlayers extends Team {
  players: Omit<Player, 'teamId' | 'teamName' | 'teamLogoUrl'>[];
}

// Team creation request
export interface CreateTeamRequest {
  name: string;
  logoUrl?: string;
}
