import React from 'react';
import MatchWrapper from '../core/match-wrapper';
import { calculatePositionOfFinalGame } from './calculate-match-position';
import Connectors from './extra-final-connectors';
import { Match, ComputedOptions, MatchComponentProps } from '../types';

type ExtraFinalProps = {
  match: Match;
  rowIndex: number;
  columnIndex: number;
  gameHeight: number;
  gameWidth: number;
  calculatedStyles: ComputedOptions;
  onMatchClick?: (args: {
    match: Match;
    topWon: boolean;
    bottomWon: boolean;
  }) => void;
  onPartyClick?: (party: any, partyWon: boolean) => void;
  matchComponent: (props: MatchComponentProps) => React.ReactElement;
  bracketSnippet: {
    previousBottomMatch?: Match;
    currentMatch: Match;
  };
  numOfUpperRounds: number;
  numOfLowerRounds: number;
  upperBracketHeight: number;
  lowerBracketHeight: number;
};

const ExtraFinal = ({
  match,
  rowIndex,
  columnIndex,
  gameHeight,
  gameWidth,
  calculatedStyles,
  onMatchClick,
  onPartyClick,
  matchComponent,
  bracketSnippet,
  numOfUpperRounds,
  numOfLowerRounds,
  upperBracketHeight,
  lowerBracketHeight,
}: ExtraFinalProps) => {
  const { canvasPadding = 0, columnWidth = 0, rowHeight = 0, roundHeader } =
    calculatedStyles;
  const { x, y } = calculatePositionOfFinalGame(rowIndex, columnIndex, {
    canvasPadding,
    columnWidth,
    rowHeight,
    gameHeight,
    upperBracketHeight,
    lowerBracketHeight,
  });

  return (
    <>
      {columnIndex !== 0 && (
        <Connectors
          {...{
            numOfUpperRounds,
            numOfLowerRounds,
            rowIndex,
            columnIndex,
            gameWidth,
            gameHeight,
            lowerBracketHeight,
            upperBracketHeight,
            style: calculatedStyles,
            bracketSnippet,
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
          previousBottomMatch={bracketSnippet.previousBottomMatch ?? null}
          topText={match.startTime}
          bottomText={match.name}
          teams={match.participants}
          onMatchClick={onMatchClick}
          onPartyClick={onPartyClick}
          style={calculatedStyles}
          matchComponent={matchComponent}
        />
      </g>
    </>
  );
};

export default ExtraFinal;
