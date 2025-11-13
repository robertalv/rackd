import React, { useContext } from 'react';
import { matchContext } from './match-context';
import { MATCH_STATES } from './match-states';
import { defaultStyle, getCalculatedStyles } from '../settings';
import { sortTeamsSeedOrder } from './match-functions';
import type { Match } from '../types';
import { Options, Participant, MatchComponentProps } from '../types';

type MatchWrapperProps = {
  rowIndex: number;
  columnIndex: number;
  match: Match;
  previousBottomMatch?: Match | null;
  teams: Participant[];
  topText?: string;
  bottomText?: string;
  style?: Options;
  matchComponent: (props: MatchComponentProps) => React.ReactElement;
  onMatchClick?: (args: {
    match: Match;
    topWon: boolean;
    bottomWon: boolean;
  }) => void;
  onPartyClick?: (party: Participant, partyWon: boolean) => void;
  x?: number;
  y?: number;
};

// Create a default empty participant
const createEmptyParticipant = (): Participant => ({
  id: '',
  name: '',
  isWinner: false,
  status: null,
  resultText: null,
});

function MatchComponent({
  rowIndex,
  columnIndex,
  match,
  previousBottomMatch = null,
  teams,
  topText = '',
  bottomText = '',
  style = defaultStyle,
  matchComponent: MatchComponentRenderer,
  onMatchClick,
  onPartyClick,
  x = 0,
  y = 0,
  ...rest
}: MatchWrapperProps) {
  const {
    state: { hoveredPartyId },
    dispatch,
  } = useContext(matchContext);
  const computedStyles = getCalculatedStyles(style);
  const { width = 300, boxHeight = 70, connectorColor = '' } = computedStyles;
  const sortedTeams = teams.sort(sortTeamsSeedOrder(previousBottomMatch ?? undefined));

  const topParty: Participant = sortedTeams?.[0] ?? createEmptyParticipant();
  const bottomParty: Participant = sortedTeams?.[1] ?? createEmptyParticipant();

  const topHovered =
    hoveredPartyId !== null &&
    hoveredPartyId !== undefined &&
    topParty?.id !== undefined &&
    hoveredPartyId === topParty.id;
  const bottomHovered =
    hoveredPartyId !== null &&
    hoveredPartyId !== undefined &&
    bottomParty?.id !== undefined &&
    hoveredPartyId === bottomParty.id;

  const participantWalkedOver = (participant: Participant): boolean =>
    match.state === MATCH_STATES.WALK_OVER &&
    teams.filter(team => !!team.id).length < 2 &&
    !!participant.id;

  // Lower placement is better
  const topWon =
    topParty.status === MATCH_STATES.WALK_OVER ||
    participantWalkedOver(topParty) ||
    !!topParty.isWinner;
  const bottomWon =
    bottomParty.status === MATCH_STATES.WALK_OVER ||
    participantWalkedOver(bottomParty) ||
    !!bottomParty.isWinner;

  const matchState = MATCH_STATES[match.state as keyof typeof MATCH_STATES] ?? match.state;

  const teamNameFallback =
    {
      [MATCH_STATES.WALK_OVER]: '',
      [MATCH_STATES.NO_SHOW]: '',
      [MATCH_STATES.DONE]: '',
      [MATCH_STATES.SCORE_DONE]: '',
      [MATCH_STATES.NO_PARTY]: '',
    }[matchState] ?? 'TBD';

  const resultFallback = (participant: Participant): string => {
    if (participant.status) {
      return (
        {
          WALKOVER: computedStyles.wonBywalkOverText,
          [MATCH_STATES.WALK_OVER]: computedStyles.wonBywalkOverText,
          [MATCH_STATES.NO_SHOW]: computedStyles.lostByNoShowText,
          [MATCH_STATES.NO_PARTY]: '',
        }[participant.status] ?? ''
      );
    }

    if (participantWalkedOver(participant)) {
      return computedStyles.wonBywalkOverText ?? '';
    }
    return '';
  };

  const onMouseEnter = (partyId: string | number) => {
    dispatch({
      type: 'SET_HOVERED_PARTYID',
      payload: {
        partyId,
        matchId: match.id,
        rowIndex,
        columnIndex,
      },
    });
  };
  const onMouseLeave = () => {
    dispatch({ type: 'SET_HOVERED_PARTYID', payload: undefined });
  };

  const wrappedOnMatchClick: MatchComponentProps['onMatchClick'] = (args) => {
    if (onMatchClick) {
      onMatchClick({
        match: args.match,
        topWon: args.topWon,
        bottomWon: args.bottomWon,
      });
    }
  };

  const finalTopParty: Participant = {
    ...topParty,
    name: topParty.name || teamNameFallback,
    resultText: topParty.resultText || resultFallback(topParty),
  };
  const finalBottomParty: Participant = {
    ...bottomParty,
    name: bottomParty.name || teamNameFallback,
    resultText: bottomParty.resultText || resultFallback(bottomParty),
  };

  return (
    <svg
      width={width}
      height={boxHeight}
      viewBox={`0 0 ${width} ${boxHeight}`}
      x={x}
      y={y}
      {...rest}
    >
      <foreignObject x={0} y={0} width={width} height={boxHeight}>
        {/* TODO: Add OnClick Match handler */}
        {MatchComponentRenderer && (
          <MatchComponentRenderer
            {...{
              match,
              onMatchClick: wrappedOnMatchClick,
              onPartyClick: onPartyClick ?? (() => {}),
              onMouseEnter,
              onMouseLeave,
              topParty: finalTopParty,
              bottomParty: finalBottomParty,
              topWon,
              bottomWon,
              topHovered,
              bottomHovered,
              topText: topText ?? '',
              bottomText: bottomText ?? '',
              connectorColor,
              computedStyles,
              teamNameFallback,
              resultFallback,
            }}
          />
        )}
      </foreignObject>
    </svg>
  );
}

export default MatchComponent;
