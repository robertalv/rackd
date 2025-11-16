import React from 'react';
import styled from 'styled-components';
import { Options } from '../types';
import type { Theme } from '../types';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

export interface RoundHeaderProps {
  x: number;
  y?: number;
  width: number;
  roundHeader: NonNullable<Options['roundHeader']>;
  canvasPadding: number;
  numOfRounds: number;
  tournamentRoundText: string;
  columnIndex: number;
  rowIndex?: number; // Row index to determine if we should render background
  gameWidth?: number; // Full width of the bracket for full-width background
}

const Text = styled.text`
  font-family: ${({ theme }) => theme.fontFamily};
  color: ${({ theme }) => theme.textColor.highlighted};
`;
const Rect = styled.rect.attrs(({ theme }) => ({
  fill: theme.roundHeaders.background,
}))``;
const BorderLine = styled.line.attrs(({ theme }) => ({
  stroke: theme.border.color,
  strokeWidth: 1,
}))``;

export default function RoundHeader({
  x,
  y = 0,
  width,
  roundHeader,
  canvasPadding,
  numOfRounds,
  tournamentRoundText,
  columnIndex,
  rowIndex = 0,
  gameWidth,
}: RoundHeaderProps) {
  if (!roundHeader) {
    return null;
  }

  const headerHeight = roundHeader.height ?? 0;
  const headerY = y + canvasPadding;
  
  // Background and border are now rendered at the root SVG level
  // RoundHeader only renders the text labels for each column
  return (
    <g>
      {/* Text centered in column - rendered for each column */}
      <Text
        x={x + width / 2}
        y={headerY + headerHeight / 2 - 25}
        style={{
          fontFamily: roundHeader.fontFamily ?? '',
          fontSize: `${roundHeader.fontSize ?? 10}px`,
          color: roundHeader.fontColor ?? '',
        }}
        fill="currentColor"
        dominantBaseline="middle"
        textAnchor="middle"
        className="uppercase"
      >
        {!roundHeader.roundTextGenerator &&
          columnIndex + 1 === numOfRounds &&
          'Final'}
        {!roundHeader.roundTextGenerator &&
          columnIndex + 1 === numOfRounds - 1 &&
          'Semi-final'}
        {!roundHeader.roundTextGenerator &&
          columnIndex + 1 < numOfRounds - 1 &&
          `Round ${tournamentRoundText}`}
        {roundHeader.roundTextGenerator &&
          roundHeader.roundTextGenerator(columnIndex + 1, numOfRounds)}
      </Text>
    </g>
  );
}
