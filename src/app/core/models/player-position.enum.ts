// Position enum to match backend
export enum PlayerPosition {
  Goalkeeper = 1,
  Defender = 2,
  Midfielder = 3,
  Forward = 4
}

// Helper function to convert position number to string
export function getPositionString(position: PlayerPosition): string {
  switch (position) {
    case PlayerPosition.Goalkeeper:
      return 'Goalkeeper';
    case PlayerPosition.Defender:
      return 'Defender';
    case PlayerPosition.Midfielder:
      return 'Midfielder';
    case PlayerPosition.Forward:
      return 'Forward';
    default:
      return 'Unknown';
  }
}

// Helper function to convert position string to enum
export function getPositionEnum(positionString: string): PlayerPosition {
  switch (positionString.toLowerCase()) {
    case 'goalkeeper':
      return PlayerPosition.Goalkeeper;
    case 'defender':
      return PlayerPosition.Defender;
    case 'midfielder':
      return PlayerPosition.Midfielder;
    case 'forward':
      return PlayerPosition.Forward;
    default:
      throw new Error(`Unknown position: ${positionString}`);
  }
}
