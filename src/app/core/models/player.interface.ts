import { PlayerPosition } from './player-position.enum';

// Player DTO from backend - matches API specification exactly
export interface PlayerDto {
  id: number;
  name: string;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward"; // Exact API values
  teamId: number;
  teamName: string;
  teamLogoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// Player model for frontend use - extends PlayerDto
export interface Player extends PlayerDto {
  positionEnum?: PlayerPosition; // Converted for internal use
  isAvailable?: boolean; // Frontend state
}

// Player creation request
export interface CreatePlayerRequest {
  name: string;
  position: PlayerPosition;
  teamId: number;
}

// Player filters for API requests
export interface PlayerFilters {
  position?: PlayerPosition;
  teamId?: number;
  name?: string;
  pageNumber?: number;
  pageSize?: number;
}
