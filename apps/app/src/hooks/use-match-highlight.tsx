import { useContext } from 'react';
import { matchContext } from '@/components/bracket/core/match-context';
import { Match } from '@/lib/bracket-types';

type BracketSnippet = {
  currentMatch?: Match;
  previousTopMatch?: Match;
  previousBottomMatch?: Match;
};

const useMatchHighlightContext = ({ bracketSnippet = null }: { bracketSnippet?: BracketSnippet | null }) => {
  const { hoveredPartyId } = useContext(matchContext);
  const previousTopMatch = bracketSnippet?.previousTopMatch;
  const previousBottomMatch = bracketSnippet?.previousBottomMatch;
  const currentMatch = bracketSnippet?.currentMatch;

  const topHighlighted =
    currentMatch?.participants?.some(p => p.id === hoveredPartyId) &&
    previousTopMatch?.participants?.some(p => p.id === hoveredPartyId);

  const bottomHighlighted =
    currentMatch?.participants?.some(p => p.id === hoveredPartyId) &&
    previousBottomMatch?.participants?.some(p => p.id === hoveredPartyId);
  return { topHighlighted, bottomHighlighted };
};

export default useMatchHighlightContext;
