export interface RaceCalculationResponse {
  hot: number;
  medium: number;
  mild: number;
}

export interface MatchOddsResponse {
  playerOneWinProbability: number;
  playerTwoWinProbability: number;
  [key: string]: any;
}
