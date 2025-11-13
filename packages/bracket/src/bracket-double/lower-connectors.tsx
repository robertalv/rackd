import React from 'react';
import Connectors from '../components/connector';

import { getCalculatedStyles } from '../settings';
import { calculatePositionOfMatchLowerBracket } from './calculate-match-position';
import { Options, Match } from '../types';

type ConnectorsLowerProps = {
  bracketSnippet: {
    currentMatch: Match;
    previousTopMatch?: Match;
    previousBottomMatch?: Match;
  };
  rowIndex: number;
  columnIndex: number;
  style: Options;
  offsetY?: number;
};

const ConnectorsLower = ({
  bracketSnippet,
  rowIndex,
  columnIndex,
  style,
  offsetY = 0,
}: ConnectorsLowerProps) => {
  const calculatedStyles = getCalculatedStyles(style);
  const { columnWidth = 0, rowHeight = 0, canvasPadding = 0 } = calculatedStyles;

  const isUpperSeedingRound = columnIndex % 2 !== 0;

  const currentMatchPosition = calculatePositionOfMatchLowerBracket(
    rowIndex,
    columnIndex,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
    }
  );
  const previousBottomPosition = isUpperSeedingRound
    ? rowIndex
    : (rowIndex + 1) * 2 - 1;
  const previousTopMatchPosition =
    !isUpperSeedingRound
      ? calculatePositionOfMatchLowerBracket(
          previousBottomPosition - 1,
          columnIndex - 1,
          {
            canvasPadding,
            rowHeight,
            columnWidth,
            offsetY,
          }
        )
      : null;
  const previousBottomMatchPosition = calculatePositionOfMatchLowerBracket(
    previousBottomPosition,
    columnIndex - 1,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
    }
  );

  return (
    <Connectors
      bracketSnippet={bracketSnippet}
      previousBottomMatchPosition={previousBottomMatchPosition}
      previousTopMatchPosition={previousTopMatchPosition}
      currentMatchPosition={currentMatchPosition}
      style={style}
    />
  );
};

export default ConnectorsLower;
