import React from 'react';
import MatchWrapper from '../core/match-wrapper';
import { getPreviousMatches } from '../core/match-functions';
import { calculatePositionOfMatchUpperBracket } from './calculate-match-position';
import ConnectorsUpper from './upper-connectors';
import { Match, ComputedOptions, MatchComponentProps } from '../types';

type UpperBracketProps = {
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
};

const UpperBracket = ({
  columns,
  calculatedStyles,
  gameHeight,
  gameWidth,
  onMatchClick,
  onPartyClick,
  matchComponent,
}: UpperBracketProps) => {
  const { canvasPadding = 0, columnWidth = 0, rowHeight = 0, roundHeader } =
    calculatedStyles;
  return columns.map((matchesColumn: Match[], columnIndex: number) =>
    matchesColumn.map((match: Match, rowIndex: number) => {
      const { x, y } = calculatePositionOfMatchUpperBracket(
        rowIndex,
        columnIndex,
        {
          canvasPadding,
          columnWidth,
          rowHeight,
        }
      );
      const previousBottomPosition = (rowIndex + 1) * 2 - 1;
      const { previousTopMatch, previousBottomMatch } = getPreviousMatches(
        columnIndex,
        columns,
        previousBottomPosition
      );
      return (
        <g key={x + y}>
          {columnIndex !== 0 && (
            <ConnectorsUpper
              {...{
                bracketSnippet: {
                  currentMatch: match,
                  previousTopMatch,
                  previousBottomMatch,
                },
                rowIndex,
                columnIndex,
                gameHeight,
                gameWidth,
                style: calculatedStyles,
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
export default UpperBracket;
