import { useContext } from 'react';
import { matchContext } from '../core/match-context';
import { Match } from '../types';

type BracketSnippet = {
  currentMatch?: Match;
  previousTopMatch?: Match;
  previousBottomMatch?: Match;
} | null;

const useMatchHighlightContext = ({ bracketSnippet = null }: { bracketSnippet?: BracketSnippet }) => {
  const {
    state: { hoveredPartyId },
  } = useContext(matchContext);
  const previousTopMatch = bracketSnippet?.previousTopMatch;
  const previousBottomMatch = bracketSnippet?.previousBottomMatch;
  const currentMatch = bracketSnippet?.currentMatch;

  const topHighlighted =
    currentMatch?.participants?.some((p) => p.id === hoveredPartyId) &&
    previousTopMatch?.participants?.some((p) => p.id === hoveredPartyId);

  const bottomHighlighted =
    currentMatch?.participants?.some((p) => p.id === hoveredPartyId) &&
    previousBottomMatch?.participants?.some((p) => p.id === hoveredPartyId);
  return { topHighlighted, bottomHighlighted };
};

export default useMatchHighlightContext;
