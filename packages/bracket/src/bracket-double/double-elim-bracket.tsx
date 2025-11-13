import React from 'react';
import { ThemeProvider } from 'styled-components';
import { generatePreviousRound } from '../core/match-functions';
import { calculateSVGDimensions } from '../core/calculate-svg-dimensions';
import { MatchContextProvider } from '../core/match-context';

import { DoubleElimLeaderboardProps, Match } from '../types';
import { defaultStyle, getCalculatedStyles } from '../settings';

import defaultTheme from '../themes/themes';

import UpperBracket from './upper-bracket';
import LowerBracket from './lower-bracket';
import RoundHeaders from './round-headers';
import FinalGame from './final-game';
import ExtraFinal from './extra-final';

function findTheFinals(matches: { upper: Match[]; lower: Match[] }): {
  convergingMatch: Match | undefined;
  finalsArray: Match[];
} {
  const isFinalInUpper = matches.upper.some(match => !match.nextMatchId);
  const isFinalInLower = matches.lower.some(match => !match.nextMatchId);
  let convergingMatch: Match | undefined;
  let finalsArray: Match[] = [];

  if (isFinalInLower) {
    const lastUpper = matches.upper.find(match => {
      const hasNextMatchInUpper = matches.upper.some(
        m => m.id === match.nextMatchId
      );
      return !hasNextMatchInUpper;
    });
    if (lastUpper?.nextMatchId) {
      const foundMatch = matches.lower.find(
        match => match.id === lastUpper.nextMatchId
      );
      if (foundMatch) {
        convergingMatch = foundMatch;
        const nextMatch = foundMatch.nextMatchId 
          ? matches.lower.find(m => m.id === foundMatch.nextMatchId)
          : undefined;
        finalsArray = [
          foundMatch,
          nextMatch,
        ].filter((m): m is Match => m !== undefined && m.id !== null && m.id !== undefined);
      }
    }
  }
  if (isFinalInUpper) {
    const lastLower = matches.lower.find(match => {
      const hasNextMatchInLower = matches.lower.some(
        m => m.id === match.nextMatchId
      );
      return !hasNextMatchInLower;
    });
    if (lastLower?.nextMatchId) {
      const foundMatch = matches.upper.find(
        match => match.id === lastLower.nextMatchId
      );
      if (foundMatch) {
        convergingMatch = foundMatch;
        const nextMatch = foundMatch.nextMatchId
          ? matches.upper.find(m => m.id === foundMatch.nextMatchId)
          : undefined;
        finalsArray = [
          foundMatch,
          nextMatch,
        ].filter((m): m is Match => m !== undefined && m.id !== null && m.id !== undefined);
      }
    }
  }

  return { convergingMatch, finalsArray };
}
const DoubleEliminationBracket = ({
  matches,
  matchComponent,
  currentRound,
  onMatchClick,
  onPartyClick,
  svgWrapper: SvgWrapper = ({ children }) => <div>{children}</div>,
  theme = defaultTheme,
  options: { style: inputStyle } = {
    style: defaultStyle,
  },
}: DoubleElimLeaderboardProps) => {
  const style = {
    ...defaultStyle,
    ...inputStyle,
    roundHeader: {
      ...defaultStyle.roundHeader,
      ...inputStyle.roundHeader,
    },
    lineInfo: {
      ...defaultStyle.lineInfo,
      ...inputStyle.lineInfo,
    },
  };

  const calculatedStyles = getCalculatedStyles(style);

  const { roundHeader, columnWidth, canvasPadding, rowHeight } =
    calculatedStyles;
  const { convergingMatch, finalsArray } = findTheFinals(matches);

  const hasMultipleFinals = finalsArray?.length > 1;

  const generateColumn = (
    matchesColumn: Match[],
    listOfMatches: Match[]
  ): Match[][] => {
    const previousMatchesColumn = generatePreviousRound(
      matchesColumn,
      listOfMatches
    );

    if (previousMatchesColumn.length > 0) {
      return [
        ...generateColumn(previousMatchesColumn, listOfMatches),
        previousMatchesColumn,
      ];
    }
    return [previousMatchesColumn];
  };
  const generate2DBracketArray = (final: Match, listOfMatches: Match[]) => {
    return final
      ? [...generateColumn([final], listOfMatches), []].filter(
          arr => arr.length > 0
        )
      : [];
  };

  if (!convergingMatch) {
    // Return empty bracket if no converging match found
    return (
      <ThemeProvider theme={theme}>
        <div>No bracket data available</div>
      </ThemeProvider>
    );
  }

  const upperColumns = generate2DBracketArray(convergingMatch, matches.upper);
  const lowerColumns = generate2DBracketArray(convergingMatch, matches.lower);
  // [
  //   [ First column ]
  //   [ 2nd column ]
  //   [ 3rd column ]
  //   [ lastGame ]
  // ]

  if (upperColumns.length === 0 || lowerColumns.length === 0 || !upperColumns[0] || !lowerColumns[0]) {
    return (
      <ThemeProvider theme={theme}>
        <div>No bracket data available</div>
      </ThemeProvider>
    );
  }

  const totalNumOfRounds =
    lowerColumns.length + 1 + (hasMultipleFinals ? finalsArray.length - 1 : 0);
  const upperBracketDimensions = calculateSVGDimensions(
    upperColumns[0].length,
    upperColumns.length,
    rowHeight ?? 0,
    columnWidth ?? 0,
    canvasPadding ?? 0,
    roundHeader ?? defaultStyle.roundHeader!,
    currentRound ?? ''
  );
  const lowerBracketDimensions = calculateSVGDimensions(
    lowerColumns[0].length,
    lowerColumns.length,
    rowHeight ?? 0,
    columnWidth ?? 0,
    canvasPadding ?? 0,
    roundHeader ?? defaultStyle.roundHeader!,
    currentRound ?? ''
  );
  const fullBracketDimensions = calculateSVGDimensions(
    lowerColumns[0].length,
    totalNumOfRounds,
    rowHeight ?? 0,
    columnWidth ?? 0,
    canvasPadding ?? 0,
    roundHeader ?? defaultStyle.roundHeader!,
    currentRound ?? ''
  );

  const { gameWidth } = fullBracketDimensions;
  const gameHeight =
    upperBracketDimensions.gameHeight + lowerBracketDimensions.gameHeight;
  const { startPosition } = upperBracketDimensions;

  return (
    <ThemeProvider theme={theme}>
      <SvgWrapper
        bracketWidth={gameWidth}
        bracketHeight={gameHeight}
        startAt={startPosition}
      >
        <svg
          height={gameHeight}
          width={gameWidth}
          viewBox={`0 0 ${gameWidth} ${gameHeight}`}
        >
          <MatchContextProvider>
            <g>
              <RoundHeaders
                {...{
                  numOfRounds: totalNumOfRounds,
                  calculatedStyles,
                }}
              />
              <UpperBracket
                {...{
                  columns: upperColumns,
                  calculatedStyles,

                  gameHeight,
                  gameWidth,
                  onMatchClick,
                  onPartyClick,
                  matchComponent,
                }}
              />
              <LowerBracket
                {...{
                  columns: lowerColumns,
                  calculatedStyles,
                  gameHeight,
                  gameWidth,
                  onMatchClick,
                  onPartyClick,
                  matchComponent,
                  upperBracketHeight: upperBracketDimensions.gameHeight,
                }}
              />
              <FinalGame
                {...{
                  match: convergingMatch,
                  numOfUpperRounds: upperColumns.length,
                  numOfLowerRounds: lowerColumns.length,
                  bracketSnippet: {
                    previousTopMatch: upperColumns[upperColumns.length - 1]?.[0],
                    previousBottomMatch:
                      lowerColumns[lowerColumns.length - 1]?.[0],
                    currentMatch: convergingMatch,
                  },
                  upperBracketHeight: upperBracketDimensions.gameHeight,
                  lowerBracketHeight: lowerBracketDimensions.gameHeight,
                  calculatedStyles,
                  columnIndex: lowerColumns.length,
                  rowIndex: 0,
                  gameHeight,
                  gameWidth,
                  matchComponent,
                  onMatchClick,
                  onPartyClick,
                }}
              />
              {finalsArray?.length > 1 && finalsArray[1] && (
                <ExtraFinal
                  {...{
                    match: finalsArray[1],
                    numOfUpperRounds: upperColumns.length,
                    numOfLowerRounds: lowerColumns.length,
                    bracketSnippet: {
                      previousBottomMatch: finalsArray[0],
                      currentMatch: finalsArray[1],
                    },
                    upperBracketHeight: upperBracketDimensions.gameHeight,
                    lowerBracketHeight: lowerBracketDimensions.gameHeight,
                    calculatedStyles,
                    columnIndex: lowerColumns.length + 1,
                    rowIndex: 0,
                    gameHeight,
                    gameWidth,
                    matchComponent,
                    onMatchClick,
                    onPartyClick,
                  }}
                />
              )}
            </g>
          </MatchContextProvider>
        </svg>
      </SvgWrapper>
    </ThemeProvider>
  );
};

export default DoubleEliminationBracket;
