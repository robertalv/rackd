import React from 'react';

import Connector from '../components/connector';
import { getCalculatedStyles } from '../settings';
import { calculatePositionOfMatch } from './calculate-match-position';
import { Options, Match } from '../types';

type ConnectorsProps = {
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

const Connectors = ({
  bracketSnippet,
  rowIndex,
  columnIndex,
  style,
  offsetY = 0,
}: ConnectorsProps) => {
  const calculatedStyles = getCalculatedStyles(style);
  const {
    columnWidth = 0,
    rowHeight = 0,
    canvasPadding = 0,
  } = calculatedStyles;

  const currentMatchPosition = calculatePositionOfMatch(rowIndex, columnIndex, {
    canvasPadding,
    rowHeight,
    columnWidth,
    offsetY,
  });
  const previousBottomPosition = (rowIndex + 1) * 2 - 1;
  const previousTopMatchPosition = calculatePositionOfMatch(
    previousBottomPosition - 1,
    columnIndex - 1,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
    }
  );
  const previousBottomMatchPosition = calculatePositionOfMatch(
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
    <Connector
      bracketSnippet={bracketSnippet}
      previousBottomMatchPosition={previousBottomMatchPosition}
      previousTopMatchPosition={previousTopMatchPosition}
      currentMatchPosition={currentMatchPosition}
      style={style}
    />
  );
};

export default Connectors;
