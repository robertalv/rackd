// Bracket package exports
export type { 
  Participant, 
  Match, 
  Options, 
  ComputedOptions, 
  MatchComponentProps, 
  Theme, 
  SingleElimLeaderboardProps, 
  DoubleElimLeaderboardProps 
} from "./types";
export { default as SingleEliminationBracket } from "./bracket-single/single-elim-bracket";
export { default as DoubleEliminationBracket } from "./bracket-double/double-elim-bracket";
export { default as MatchComponent } from "./components/match";
export { default as defaultTheme } from "./themes/themes";

