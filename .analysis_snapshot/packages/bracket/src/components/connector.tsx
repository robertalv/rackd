import useMatchHighlightContext from '../hooks/use-match-highlight';
import React from 'react';
import { getCalculatedStyles } from '../settings';
import { Options, Match } from '../types';

type Position = {
  x: number;
  y: number;
};

type ConnectorProps = {
  bracketSnippet?: {
    currentMatch: Match;
    previousTopMatch?: Match;
    previousBottomMatch?: Match;
  } | null;
  previousBottomMatchPosition?: Position | null;
  previousTopMatchPosition?: Position | null;
  currentMatchPosition: Position;
  style: Options;
};

const Connector = ({
  bracketSnippet,
  previousBottomMatchPosition = null,
  previousTopMatchPosition = null,
  currentMatchPosition,
  style,
}: ConnectorProps) => {
  const calculatedStyles = getCalculatedStyles(style);
  const {
    boxHeight = 0,
    connectorColor = '',
    roundHeader,
    roundSeparatorWidth = 0,
    lineInfo,
    horizontalOffset = 0,
    connectorColorHighlight = '',
    width = 0,
  } = calculatedStyles;

  const pathInfo = (multiplier: number): string[] => {
    const middlePointOfMatchComponent = boxHeight / 2;
    const previousMatch =
      multiplier > 0 ? previousBottomMatchPosition : previousTopMatchPosition;
    if (!previousMatch) return [];
    
    const startPoint = `${
      currentMatchPosition.x - horizontalOffset - (lineInfo?.separation ?? 0)
    } ${
      currentMatchPosition.y +
      (lineInfo?.homeVisitorSpread ?? 0) * multiplier +
      middlePointOfMatchComponent +
      (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0)
    }`;
    const horizontalWidthLeft =
      currentMatchPosition.x - roundSeparatorWidth / 2 - horizontalOffset;
    const isPreviousMatchOnSameYLevel =
      Math.abs(currentMatchPosition.y - previousMatch.y) < 1;

    const verticalHeight =
      previousMatch.y +
      middlePointOfMatchComponent +
      (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0);
    const horizontalWidthRight = previousMatch.x + width;

    if (isPreviousMatchOnSameYLevel) {
      return [`M${startPoint}`, `H${horizontalWidthRight}`];
    }

    return [
      `M${startPoint}`,
      `H${horizontalWidthLeft}`,
      `V${verticalHeight}`,
      `H${horizontalWidthRight}`,
    ];
  };

  const { topHighlighted, bottomHighlighted } = useMatchHighlightContext({
    bracketSnippet,
  });

  const { x, y } = currentMatchPosition;
  return (
    <>
      {previousTopMatchPosition && (
        <path
          d={pathInfo(-1).join(' ')}
          id={`connector-${x}-${y}-${-1}`}
          fill="transparent"
          stroke={topHighlighted ? connectorColorHighlight : connectorColor}
        />
      )}
      {previousBottomMatchPosition && (
        <path
          d={pathInfo(1).join(' ')}
          id={`connector-${x}-${y}-${1}`}
          fill="transparent"
          stroke={bottomHighlighted ? connectorColorHighlight : connectorColor}
        />
      )}

      {topHighlighted && <use href={`connector-${x}-${y}-${-1}`} />}
      {bottomHighlighted && <use href={`connector-${x}-${y}-${1}`} />}
    </>
  );
};
export default Connector;
