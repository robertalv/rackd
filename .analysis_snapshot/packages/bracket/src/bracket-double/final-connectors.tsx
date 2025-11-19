import React from 'react';
import Connector from '../components/connector';
import { getCalculatedStyles } from '../settings';
import {
  calculatePositionOfMatchUpperBracket,
  calculatePositionOfMatchLowerBracket,
  calculatePositionOfFinalGame,
} from './calculate-match-position';
import { Options, Match } from '../types';

type FinalConnectorsProps = {
  rowIndex: number;
  columnIndex: number;
  style: Options;
  bracketSnippet?: {
    currentMatch: Match;
    previousTopMatch?: Match;
    previousBottomMatch?: Match;
  } | null;
  offsetY?: number;
  numOfUpperRounds: number;
  numOfLowerRounds: number;
  lowerBracketHeight: number;
  upperBracketHeight: number;
  gameHeight: number;
};

const FinalConnectors = ({
  rowIndex,
  columnIndex,
  style,
  bracketSnippet = null,
  offsetY = 0,
  numOfUpperRounds,
  numOfLowerRounds,
  lowerBracketHeight,
  upperBracketHeight,
  gameHeight,
}: FinalConnectorsProps) => {
  const calculatedStyles = getCalculatedStyles(style);
  const { columnWidth = 0, rowHeight = 0, canvasPadding = 0 } = calculatedStyles;

  const currentMatchPosition = calculatePositionOfFinalGame(
    rowIndex,
    columnIndex,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
      lowerBracketHeight,
      upperBracketHeight,
      gameHeight,
    }
  );
  const previousTopMatchPosition = calculatePositionOfMatchUpperBracket(
    0,
    numOfUpperRounds - 1, // numOfRounds is higher than index by 1 and we need 2nd to last index
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
    }
  );

  const previousBottomMatchPosition = calculatePositionOfMatchLowerBracket(
    0,
    numOfLowerRounds - 1, // numOfRounds is higher than index by 1 and we need 2nd to last index
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY: upperBracketHeight + offsetY,
    }
  );

  return (
    <Connector
      bracketSnippet={bracketSnippet}
      previousBottomMatchPosition={previousBottomMatchPosition}
      previousTopMatchPosition={previousTopMatchPosition}
      currentMatchPosition={currentMatchPosition}
      style={style}
    />
  );
};

export default FinalConnectors;
