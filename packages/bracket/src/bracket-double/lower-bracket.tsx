import React from 'react';
import MatchWrapper from '../core/match-wrapper';
import { getPreviousMatches } from '../core/match-functions';
import { calculatePositionOfMatchLowerBracket } from './calculate-match-position';
import ConnectorsLower from './lower-connectors';
import { Match, ComputedOptions, MatchComponentProps } from '../types';

type LowerBracketProps = {
  columns: Match[][];
  calculatedStyles: ComputedOptions;
  gameHeight: number;
  gameWidth: number;
  onMatchClick?: (args: {
    match: Match;
    topWon: boolean;
    bottomWon: boolean;
  }) => void;
  onPartyClick?: (party: any, partyWon: boolean) => void;
  matchComponent: (props: MatchComponentProps) => React.ReactElement;
  upperBracketHeight: number;
};

const LowerBracket = ({
  columns,
  calculatedStyles,
  gameHeight,
  gameWidth,
  onMatchClick,
  onPartyClick,
  matchComponent,
  upperBracketHeight,
}: LowerBracketProps) => {
  const { canvasPadding = 0, columnWidth = 0, rowHeight = 0, roundHeader } =
    calculatedStyles;
  return columns.map((matchesColumn: Match[], columnIndex: number) =>
    matchesColumn.map((match: Match, rowIndex: number) => {
      const { x, y } = calculatePositionOfMatchLowerBracket(
        rowIndex,
        columnIndex,
        {
          canvasPadding,
          columnWidth,
          rowHeight,
          offsetY: upperBracketHeight,
        }
      );
      const isUpperSeedingRound = columnIndex % 2 !== 0;

      const previousBottomPosition = isUpperSeedingRound
        ? rowIndex
        : (rowIndex + 1) * 2 - 1;
      const { previousTopMatch, previousBottomMatch } = getPreviousMatches(
        columnIndex,
        columns,
        previousBottomPosition
      );
      return (
        <g key={x + y}>
          {columnIndex !== 0 && (
            <ConnectorsLower
              {...{
                bracketSnippet: {
                  currentMatch: match,
                  previousTopMatch: !isUpperSeedingRound ? previousTopMatch : undefined,
                  previousBottomMatch,
                },
                rowIndex,
                columnIndex,
                gameHeight,
                gameWidth,
                style: calculatedStyles,
                offsetY: upperBracketHeight,
              }}
            />
          )}
          <g>
            <MatchWrapper
              x={x}
              y={
                y +
                (roundHeader?.isShown
                  ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0)
                  : 0)
              }
              rowIndex={rowIndex}
              columnIndex={columnIndex}
              match={match}
              previousBottomMatch={previousBottomMatch}
              topText={match.startTime}
              bottomText={match.name}
              teams={match.participants}
              onMatchClick={onMatchClick}
              onPartyClick={onPartyClick}
              style={calculatedStyles}
              matchComponent={matchComponent}
            />
          </g>
        </g>
      );
    })
  );
};
export default LowerBracket;
