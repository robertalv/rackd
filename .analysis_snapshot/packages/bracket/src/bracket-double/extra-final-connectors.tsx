import React from 'react';
import Connector from '../components/connector';
import { getCalculatedStyles } from '../settings';
import { calculatePositionOfFinalGame } from './calculate-match-position';
import { Options, Match } from '../types';

type ExtraFinalConnectorsProps = {
  rowIndex: number;
  columnIndex: number;
  style: Options;
  bracketSnippet?: {
    currentMatch: Match;
    previousBottomMatch?: Match;
  } | null;
  offsetY?: number;
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
  numOfLowerRounds,
  lowerBracketHeight,
  upperBracketHeight,
  gameHeight,
}: ExtraFinalConnectorsProps) => {
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

  const previousBottomMatchPosition = calculatePositionOfFinalGame(
    0,
    numOfLowerRounds, // numOfRounds is higher than index by 1 and we need 2nd to last index
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

  return (
    <Connector
      bracketSnippet={bracketSnippet}
      previousBottomMatchPosition={previousBottomMatchPosition}
      currentMatchPosition={currentMatchPosition}
      style={style}
    />
  );
};

export default FinalConnectors;
