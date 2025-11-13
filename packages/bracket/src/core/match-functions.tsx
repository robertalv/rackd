import { sortAlphanumerically } from '../utils/string';
import { Match, Participant } from '../types';

export const generatePreviousRound = (
  matchesColumn: Match[],
  listOfMatches: Match[]
): Match[] =>
  matchesColumn.reduce<Match[]>((result, match) => {
    return [
      ...result,
      ...listOfMatches
        .filter((m: Match) => m.nextMatchId === match.id)
        .sort((a: Match, b: Match) => sortAlphanumerically(a.name, b.name)),
    ];
  }, []);

export function getPreviousMatches(
  columnIndex: number,
  columns: Match[][],
  previousBottomPosition: number
): { previousTopMatch?: Match; previousBottomMatch?: Match } {
  const previousTopMatch =
    columnIndex !== 0 ? columns[columnIndex - 1]?.[previousBottomPosition - 1] : undefined;
  const previousBottomMatch =
    columnIndex !== 0 ? columns[columnIndex - 1]?.[previousBottomPosition] : undefined;
  return { previousTopMatch, previousBottomMatch };
}

export function sortTeamsSeedOrder(
  previousBottomMatch?: Match | null
): (partyA: Participant, partyB: Participant) => number {
  return (partyA: Participant, partyB: Participant) => {
    const partyAInBottomMatch = previousBottomMatch?.participants?.find(
      (p: Participant) => p.id === partyA.id
    );

    const partyBInBottomMatch = previousBottomMatch?.participants?.find(
      (p: Participant) => p.id === partyB.id
    );

    if (partyAInBottomMatch) {
      return 1;
    }
    if (partyBInBottomMatch) {
      return -1;
    }
    return 0;
  };
}
